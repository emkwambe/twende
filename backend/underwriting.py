"""Tanzania-contextual underwriting engine.

Replaces generic SACCO/chama logic with a model tuned for Tanzanian informal
finance: VICOBA/Upatu groups, fragmented mobile money, NIDA/TIN/BRELA
formalization, and agricultural seasonality.
"""
from decimal import Decimal
from typing import Any, Dict, List, Optional

from config import settings
from country_packs import tanzania as tz
from models import Group, LoanApplication, Member
from kyc import can_borrow
from money import CurrencyMismatch


class TanzanianUnderwritingEngine:
    """Underwrite a Tanzanian group loan using local-context rules."""

    @classmethod
    def evaluate(cls, member: Member, group: Group, loan: LoanApplication) -> Dict[str, Any]:
        # Every ratio below — savings-to-loan, group guarantee, debt service — is
        # dimensionless only because numerator and denominator share a currency.
        # Nothing else enforces that, so enforce it here before any of it is
        # computed: a mixed-denomination DSR is a number with no meaning.
        cls._require_single_currency(member, group, loan)

        amount = float(loan.amount)
        savings = float(member.savings_balance or Decimal("0"))
        total_repayment = float(loan.total_repayment or Decimal("0"))
        repayment_weeks = int(loan.repayment_weeks)
        group_savings = float(group.total_savings or Decimal("0"))
        member_count = int(group.member_count or 1)
        loan_balance = float(member.loan_balance or Decimal("0"))
        purpose = (loan.purpose or "other").lower()

        # ── 1. Critical checks (auto-reject if any fail) ─────────────────────
        critical_failures: List[str] = []
        # Identity is required, but a NIDA is not the only way to establish it.
        # BoT Form F accepts a ward/village executive letter as photo ID, and
        # 35-43% of Tanzanian adults hold no usable NIDA credential — a NIDA-only
        # gate would exclude them at enrolment, where no fairness audit can see
        # it. What is checked is the verification tier, reachable by either the
        # registry route or a committee-corroborated attestation. See kyc.py.
        borrow_ok, tier_status = can_borrow(member)
        if not borrow_ok:
            critical_failures.append(
                tier_status.next_steps[0]
                if tier_status.next_steps
                else "Identity verification required before borrowing"
            )
        if amount > group_savings * settings.MAX_LOAN_TO_SAVINGS_RATIO:
            critical_failures.append("Loan exceeds 4x group savings (VICOBA rule)")
        if loan_balance > 0 and (loan_balance + amount) > savings * settings.MAX_DEBT_TO_SAVINGS_RATIO:
            critical_failures.append("Total debt exceeds 3x personal savings")

        # ── 2. Estimated weekly income heuristic ─────────────────────────────
        # savings_balance * 0.05 is a proxy for weekly cash flow.
        # Floor at TZS 50,000/week (~$19), realistic for the informal sector.
        estimated_weekly_income = max(
            savings * tz.SAVINGS_TO_WEEKLY_INCOME_RATE, settings.MIN_WEEKLY_INCOME_TZS
        )

        # ── 3. Weekly payment for this loan ──────────────────────────────────
        weekly_payment = total_repayment / repayment_weeks if repayment_weeks > 0 else 0.0

        # ── 4. Existing weekly debt obligation ───────────────────────────────
        existing_weekly_debt = loan_balance / tz.WEEKS_PER_YEAR if loan_balance > 0 else 0.0

        # ── 5. Debt Service Ratio (DSR) ──────────────────────────────────────
        dsr = (weekly_payment + existing_weekly_debt) / estimated_weekly_income

        # ── 6. Personal Savings Ratio (proxy for mobile-money flow) ──────────
        personal_savings_ratio = savings / amount if amount > 0 else 0.0

        # ── 7. Group Guarantee Ratio ─────────────────────────────────────────
        group_guarantee_ratio = group_savings / amount if amount > 0 else 0.0

        # ── 8. VICOBA/Group discipline ───────────────────────────────────────
        avg_group_savings = group_savings / max(member_count, 1)
        group_discipline = savings / max(avg_group_savings, 1.0)

        # ── 9. Business Formalization Score (0-15) ───────────────────────────
        formalization = sum(
            doc["points"]
            for field, doc in tz.FORMALIZATION_DOCS.items()
            if getattr(member, field, None)
        )

        # ── 10. Agricultural Seasonality Penalty/Bonus ──────────────────────
        seasonality = 0
        if purpose == "agriculture":
            seasonality = (
                tz.AGRICULTURE_SHORT_PENALTY
                if repayment_weeks < tz.AGRICULTURE_MIN_WEEKS
                else tz.AGRICULTURE_LONG_BONUS
            )

        # ── 11. Scoring (0-100) ──────────────────────────────────────────────
        mm_flow_points = (
            min(personal_savings_ratio / settings.MIN_PERSONAL_SAVINGS_RATIO, 1.0)
            * tz.SCORE_WEIGHTS["mobile_money_flow"]
        )

        # DSR points: full at target ratio, zero at hard ceiling. Capped at the
        # declared band — below the target the linear term exceeds 1.0, and
        # carrying no debt must not pay more than the band is worth.
        dsr_points = min(
            float(tz.SCORE_WEIGHTS["debt_service"]),
            max(
                0.0,
                (
                    (settings.HARD_DEBT_SERVICE_CEILING - dsr)
                    / (settings.HARD_DEBT_SERVICE_CEILING - settings.TARGET_DEBT_SERVICE_RATIO)
                ) * tz.SCORE_WEIGHTS["debt_service"],
            ),
        )

        guarantee_points = (
            min(group_guarantee_ratio / settings.MIN_GROUP_GUARANTEE_RATIO, 1.0)
            * tz.SCORE_WEIGHTS["group_guarantee"]
        )

        formalization_points = formalization

        # Seasonality band: 0-10, with agriculture penalties/bonuses. Capped at
        # the declared band: a well-timed agricultural term restores the full
        # band rather than exceeding it.
        seasonality_points = min(
            float(tz.SCORE_WEIGHTS["seasonality"]),
            max(0.0, float(tz.SCORE_WEIGHTS["seasonality"]) + seasonality),
        )

        # Upatu groups get less guarantee credit (no interest accumulation)
        guarantee_points *= tz.GUARANTEE_MULTIPLIER_BY_GROUP_TYPE.get(group.group_type, 1.0)

        total_score = (
            mm_flow_points
            + dsr_points
            + guarantee_points
            + formalization_points
            + seasonality_points
        )

        # ── 12. Decision ─────────────────────────────────────────────────────
        if critical_failures:
            decision = "rejected"
        elif total_score >= tz.SCORE_APPROVE:
            decision = "approved"
        elif total_score >= tz.SCORE_FLAG:
            decision = "flagged"
        else:
            decision = "rejected"

        recommendation = cls._recommendation(
            decision,
            total_score,
            critical_failures,
            member.phone_provider,
        )

        return {
            "decision": decision,
            "score": round(total_score, 2),
            "factors": {
                "personal_savings_ratio": round(personal_savings_ratio, 4),
                "debt_service_ratio": round(dsr, 4),
                "group_guarantee_ratio": round(group_guarantee_ratio, 4),
                "group_discipline": round(group_discipline, 4),
                "estimated_weekly_income": round(estimated_weekly_income, 2),
                "weekly_payment": round(weekly_payment, 2),
                "existing_weekly_debt": round(existing_weekly_debt, 2),
                "formalization_score": formalization,
                "seasonality": seasonality,
                "mm_flow_points": round(mm_flow_points, 2),
                "dsr_points": round(dsr_points, 2),
                "guarantee_points": round(guarantee_points, 2),
                "formalization_points": formalization_points,
                "seasonality_points": seasonality_points,
            },
            "critical_failures": critical_failures,
            "recommendation": recommendation,
        }

    @staticmethod
    def _require_single_currency(
        member: Member, group: Group, loan: LoanApplication
    ) -> None:
        """Refuse to underwrite across denominations.

        Raises rather than converting: an FX rate is a business decision with a
        timestamp and an audit trail, and it has no place inside a scoring pass.
        """
        seen = {
            "member": getattr(member, "currency", None),
            "group": getattr(group, "currency", None),
            "loan": getattr(loan, "currency", None),
        }
        present = {k: v for k, v in seen.items() if v}
        if len(set(present.values())) > 1:
            detail = ", ".join(f"{k}={v}" for k, v in present.items())
            raise CurrencyMismatch(
                f"cannot underwrite across currencies ({detail}); "
                "the affordability ratios are only meaningful in one denomination"
            )

    @staticmethod
    def _recommendation(
        decision: str,
        score: float,
        failures: List[str],
        phone_provider: Optional[str],
    ) -> str:
        provider_label = phone_provider or "M-Pesa"
        if failures:
            return f"Loan rejected. Score: {score:.0f}/100. Reasons: {'; '.join(failures)}"
        if decision == "approved":
            return f"Loan approved. Score: {score:.0f}/100. Disburse via {provider_label}."
        if decision == "flagged":
            return f"Manual review required. Score: {score:.0f}/100. Verify NIDA and group savings."
        return f"Loan rejected. Score: {score:.0f}/100. Profile does not meet Tanzanian underwriting criteria."
