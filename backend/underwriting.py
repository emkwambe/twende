"""Tanzania-contextual underwriting engine.

Replaces generic SACCO/chama logic with a model tuned for Tanzanian informal
finance: VICOBA/Upatu groups, fragmented mobile money, NIDA/TIN/BRELA
formalization, and agricultural seasonality.
"""
from decimal import Decimal
from typing import Any, Dict, List, Optional

from config import settings
from models import Group, LoanApplication, Member


class TanzanianUnderwritingEngine:
    """Underwrite a Tanzanian group loan using local-context rules."""

    @classmethod
    def evaluate(cls, member: Member, group: Group, loan: LoanApplication) -> Dict[str, Any]:
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
        if not member.national_id:
            critical_failures.append("NIDA number required for loan application")
        if amount > group_savings * settings.MAX_LOAN_TO_SAVINGS_RATIO:
            critical_failures.append("Loan exceeds 4x group savings (VICOBA rule)")
        if loan_balance > 0 and (loan_balance + amount) > savings * settings.MAX_DEBT_TO_SAVINGS_RATIO:
            critical_failures.append("Total debt exceeds 3x personal savings")

        # ── 2. Estimated weekly income heuristic ─────────────────────────────
        # savings_balance * 0.05 is a proxy for weekly cash flow.
        # Floor at TZS 50,000/week (~$19), realistic for the informal sector.
        estimated_weekly_income = max(
            savings * 0.05, settings.MIN_WEEKLY_INCOME_TZS
        )

        # ── 3. Weekly payment for this loan ──────────────────────────────────
        weekly_payment = total_repayment / repayment_weeks if repayment_weeks > 0 else 0.0

        # ── 4. Existing weekly debt obligation ───────────────────────────────
        existing_weekly_debt = loan_balance / 52.0 if loan_balance > 0 else 0.0

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
        formalization = 0
        if member.national_id:
            formalization += 8
        if member.tin_number:
            formalization += 4
        if member.brela_number:
            formalization += 3

        # ── 10. Agricultural Seasonality Penalty/Bonus ──────────────────────
        seasonality = 0
        if purpose == "agriculture":
            if repayment_weeks < 12:
                seasonality = -5  # unlikely to cover harvest
            else:
                seasonality = 5   # covers likely harvest period

        # ── 11. Scoring (0-100) ──────────────────────────────────────────────
        mm_flow_points = min(personal_savings_ratio / settings.MIN_PERSONAL_SAVINGS_RATIO, 1.0) * 30

        # DSR points: full at target ratio, zero at hard ceiling
        dsr_points = max(
            0.0,
            (
                (settings.HARD_DEBT_SERVICE_CEILING - dsr)
                / (settings.HARD_DEBT_SERVICE_CEILING - settings.TARGET_DEBT_SERVICE_RATIO)
            ) * 25,
        )

        guarantee_points = min(
            group_guarantee_ratio / settings.MIN_GROUP_GUARANTEE_RATIO, 1.0
        ) * 20

        formalization_points = formalization

        # Seasonality band: 0-10, with agriculture penalties/bonuses
        if seasonality > -10:
            seasonality_points = max(0.0, 10.0 + seasonality)
        else:
            seasonality_points = 0.0

        # Upatu groups get less guarantee credit (no interest accumulation)
        if group.group_type == "upatu":
            guarantee_points *= 0.8

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
        elif total_score >= 70:
            decision = "approved"
        elif total_score >= 50:
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
