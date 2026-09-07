# The Tanzania Underwriting Engine

## Loan-Level Affordability Assessment for VICOBA and Upatu Groups

**Component:** `backend/underwriting.py` — `TanzanianUnderwritingEngine`
**Constants:** `backend/country_packs/tanzania.py`, overridable via `backend/config.py`
**Status:** Implemented and in use by `POST /api/v1/loans/apply`
**Classification:** Internal Technical Specification

---

## 1. Why This Document Exists

The Trust Engine White Paper specifies a **7-factor, 300–850 borrower credit score** built on XGBoost with SHAP explainability. That system describes a borrower's general creditworthiness across the whole platform, and it is the system the Platform Blueprint presents to funders and regulators.

It is **not** the system that currently decides whether a loan is approved.

Loan decisions today are made by a second, separately implemented component — the Tanzania Underwriting Engine — which scores a **specific loan application** on a 0–100 scale across five factors and returns `approved` / `flagged` / `rejected`. It was written for the Tanzanian pilot and encodes local realities the 7-factor model abstracts away: the VICOBA 4× rule, NIDA/TIN/BRELA formalization, fragmented mobile money providers, Upatu's weaker guarantee structure, and agricultural seasonality.

Until this document, that engine appeared in no specification. A technical reviewer diligencing the White Paper against the repository would have found a scoring system they had not been shown. This document closes that gap.

**The two engines answer different questions and are complementary, not competing:**

| | Trust Engine (White Paper §4) | Underwriting Engine (this document) |
|---|---|---|
| **Question** | How creditworthy is this *person*? | Can this *person* afford *this loan*? |
| **Unit of assessment** | Borrower | Loan application |
| **Output** | 300–850 score, 4 risk tiers | 0–100 score, 3-way decision |
| **Horizon** | Longitudinal behavioural history | Point-in-time affordability |
| **Inputs** | Cross-pillar behaviour over months | Current balances, this loan's terms |
| **Status** | Specified; not yet implemented | Implemented; in production path |

In the target architecture the Trust Engine sets *what terms a borrower qualifies for* (tier → limit and rate), and the Underwriting Engine decides *whether a particular request within those terms is affordable right now*. A borrower can hold a strong Trust Score and still be correctly declined for a loan that breaches their debt-service ratio this month. The two are intended to compose: **tier gates the offer, underwriting gates the disbursement.** See §7 for the current state of that integration.

---

## 2. Design Rationale

The engine deliberately does **not** attempt to replicate the 7-factor model server-side. Three considerations drove that:

**Data availability.** The 7-factor model requires 12+ months of cross-pillar behavioural history — chama contribution series, M-Pesa transaction summaries, Soko GMV, gig completion records. During the pilot's opening months no borrower has that history. An affordability model built on balances and loan terms produces defensible decisions from day one.

**Regulatory posture.** Bank of Tanzania draft Digital Credit Provider guidance emphasises responsible lending — that a lender establish the borrower can service the debt. A debt-service-ratio model addresses that requirement directly and is legible to a regulator in a way that a gradient-boosted ensemble is not.

**Falsifiability.** Every factor here is a closed-form arithmetic expression over recorded balances. A loan officer, a borrower, or an auditor can recompute any decision by hand. This matters during a pilot whose purpose is to *generate* the labelled default data the XGBoost model will eventually need.

The engine is a **rule-based bridge**, not a permanent substitute. It produces the repayment outcomes that become training labels for the Trust Engine.

---

## 3. Critical Checks (Hard Rejects)

Evaluated before scoring. Any failure forces `decision = "rejected"` regardless of score, and the reasons are returned in `critical_failures`.

| # | Condition | Rejection reason | Basis |
|---|---|---|---|
| 1 | `member.national_id` is absent | NIDA number required for loan application | KYC precondition for any credit extension |
| 2 | `amount > group_savings × 4.0` | Loan exceeds 4x group savings (VICOBA rule) | The classic VICOBA lending limit, widely understood by groups themselves |
| 3 | `loan_balance > 0` **and** `(loan_balance + amount) > savings × 3.0` | Total debt exceeds 3x personal savings | Prevents debt stacking across successive loans |

Constants: `MAX_LOAN_TO_SAVINGS_RATIO = 4.0`, `MAX_DEBT_TO_SAVINGS_RATIO = 3.0`.

Check 3 applies only to members who already carry a balance; a first-time borrower is not gated on it.

---

## 4. Derived Quantities

Let $A$ be the loan amount, $S$ the member's savings balance, $G$ the group's total savings, $n$ the member count, $B$ the member's outstanding loan balance, $R$ the total repayment due, and $w$ the repayment term in weeks.

**Estimated weekly income** — a proxy, since informal income is unobserved:

$$Y = \max(S \times 0.05,\; 50{,}000)$$

Savings balance times 5% approximates weekly cash flow. The floor of TZS 50,000/week (~USD 19) prevents a low-savings member from being assigned a near-zero income, which would make every DSR appear catastrophic.

**Weekly payment** for the requested loan: $p = R / w$

**Existing weekly debt:** $b = B / 52$

**Debt Service Ratio:** $\text{DSR} = (p + b) / Y$

**Personal savings ratio** (mobile-money flow proxy): $\sigma = S / A$

**Group guarantee ratio:** $\gamma = G / A$

**Group discipline** (reported, not scored): $S / (G/n)$ — the member's savings against the group average.

**Formalization score:** the sum of points for documents the member holds.

| Document | Field | Points |
|---|---|---|
| NIDA (national ID) | `national_id` | 8 |
| TIN (tax ID) | `tin_number` | 4 |
| BRELA (business registration) | `brela_number` | 3 |
| **Maximum** | | **15** |

**Seasonality adjustment** — applied only when `purpose == "agriculture"`:

$$\Delta = \begin{cases} -5 & w < 12 \text{ weeks} \\ +5 & w \geq 12 \text{ weeks} \end{cases}$$

A loan that matures before harvest forces repayment from a borrower with no crop revenue yet.

---

## 5. Scoring

| Factor | Declared band | Formula |
|---|---|---|
| Mobile money flow | 30 | $\min(\sigma / 0.15,\; 1) \times 30$ |
| Debt service | 25 | $\min\!\left(25,\; \max\!\left(0,\; \frac{0.70 - \text{DSR}}{0.70 - 0.25} \times 25\right)\right)$ |
| Group guarantee | 20 | $\min(\gamma / 0.30,\; 1) \times 20 \times m$ |
| Formalization | 15 | document points, as above |
| Seasonality | 10 | $\min(10,\; \max(0,\; 10 + \Delta))$ |

where $m$ is the group-type guarantee multiplier: **0.8 for Upatu**, 1.0 otherwise. Upatu rotates a fixed pot without interest accumulation, so its collective savings are a weaker guarantee than an interest-bearing VICOBA's.

The debt-service band awards full marks at or below the target DSR of 0.25 and decays linearly to zero at the hard ceiling of 0.70. Both the debt-service and seasonality terms are capped at their bands, so the maximum attainable total is exactly 100 — see §6.

### Decision

$$\text{decision} = \begin{cases} \texttt{rejected} & \text{any critical failure} \\ \texttt{approved} & \text{score} \geq 70 \\ \texttt{flagged} & 50 \leq \text{score} < 70 \\ \texttt{rejected} & \text{score} < 50 \end{cases}$$

`flagged` routes to manual review rather than auto-declining — deliberately, since the pilot's early decisions carry the most model uncertainty.

---

## 6. Score Inflation: Identified and Fixed

**Resolved.** The debt-service and seasonality terms were originally floored but not capped, so both could pay above their declared bands and the maximum attainable score was **118.89, not 100**. Because the approval threshold of 70 was set against a nominal 0-100 scale, this made approvals looser than intended - and the effect was largest for low-DSR applicants, who are often low-DSR only because their *estimated* income sits at the TZS 50,000 floor rather than because their cash flow is genuinely strong.

Both terms are now capped at their declared bands (Option 1 of the two resolutions previously set out here):

| Case | Before | After | Band |
|---|---|---|---|
| Debt service @ DSR 0.00 | 38.89 | **25.00** | 25 |
| Debt service @ DSR 0.10 | 33.33 | **25.00** | 25 |
| Debt service @ DSR 0.25 (target) | 25.00 | 25.00 | 25 |
| Seasonality, agriculture >=12 weeks | 15.00 | **10.00** | 10 |
| Seasonality, agriculture <12 weeks | 5.00 | 5.00 | 10 |
| **Maximum attainable total** | **118.89** | **100.00** | 100 |

The debt-service term now reaches its band at or below the target DSR of 0.25 and decays linearly to zero at the ceiling of 0.70. The seasonality bonus for a well-timed agricultural term now *restores* the full band rather than exceeding it, while the short-term penalty is unchanged - so agriculture is still penalised for maturing before harvest, and no case pays above 10.

**Effect on decisions.** Approval thresholds remain 70 / 50. Since scores can only decrease relative to the previous behaviour, some applications that previously scored `approved` on inflated points will now land in `flagged` (manual review) rather than auto-approving. That is the intended correction: the engine no longer pays a borrower more than a full band for carrying no debt.

## 7. Integration Status and Gaps

**Not yet connected to the Trust Engine.** The engine reads no Trust Score. Tier-based limits and rates from White Paper §4.2 are not consulted, so a Tier 4 borrower and a Tier 1 borrower are underwritten identically. The intended composition described in §1 is not yet wired.

**Chama behaviour is absent.** The recalibrated chama scoring in `src/trust/algorithm.ts` — consistency, tenure, leadership, group size — has no counterpart here. Group standing enters only through `group_guarantee_ratio` and the reported-but-unscored `group_discipline`. A member with five years of flawless contributions is underwritten the same as one who joined last month with the same balance. This is the single largest missing signal.

**Income is a proxy, not a measurement.** `S × 0.05` stands in for weekly cash flow. Once M-Pesa Daraja summaries are ingested, this should be replaced by observed inflows; the DSR is only as good as its denominator.

**Existing debt amortisation is crude.** $B / 52$ assumes every outstanding balance runs over exactly one year, regardless of its actual remaining term. A balance with six weeks left is treated as far lighter than it is.

**Currency.** This engine is TZS throughout, consistent with the country pack. The White Paper and Blueprint state loan products in KES; those documents need reconciling to TZS for the Tanzania pilot.

**Explainability.** The returned `factors` dictionary exposes every intermediate quantity and per-factor point award, so decisions are already fully decomposable — the SHAP-equivalent for a rule-based model. This is not currently surfaced in any UI.

---

## 8. Return Contract

```python
{
  "decision": "approved" | "flagged" | "rejected",
  "score": float,                    # 0-100
  "factors": {
      "personal_savings_ratio":   float,
      "debt_service_ratio":       float,
      "group_guarantee_ratio":    float,
      "group_discipline":         float,
      "estimated_weekly_income":  float,
      "weekly_payment":           float,
      "existing_weekly_debt":     float,
      "formalization_score":      int,
      "seasonality":              int,
      "mm_flow_points":           float,
      "dsr_points":               float,
      "guarantee_points":         float,
      "formalization_points":     int,
      "seasonality_points":       float,
  },
  "critical_failures": list[str],
  "recommendation": str,             # human-readable, names the disbursement provider
}
```

---

## 9. Configuration

All thresholds originate in `country_packs/tanzania.py` and are re-exported through `config.py` as Pydantic settings, so each is overridable per deployment via environment variable without a code change.

| Constant | Value | Meaning |
|---|---|---|
| `MIN_WEEKLY_INCOME` | 50,000 TZS | Income floor for the DSR denominator |
| `SAVINGS_TO_WEEKLY_INCOME_RATE` | 0.05 | Savings → weekly cash flow proxy |
| `MAX_LOAN_TO_SAVINGS_RATIO` | 4.0 | VICOBA rule (critical check) |
| `MAX_DEBT_TO_SAVINGS_RATIO` | 3.0 | Debt-stacking limit (critical check) |
| `MIN_PERSONAL_SAVINGS_RATIO` | 0.15 | Savings-to-loan ratio for full flow points |
| `TARGET_DEBT_SERVICE_RATIO` | 0.25 | DSR earning the full band |
| `HARD_DEBT_SERVICE_CEILING` | 0.70 | DSR earning zero |
| `MIN_GROUP_GUARANTEE_RATIO` | 0.30 | Group cover for full guarantee points |
| `GUARANTEE_MULTIPLIER_BY_GROUP_TYPE` | `{upatu: 0.8}` | Group-type guarantee discount |
| `AGRICULTURE_MIN_WEEKS` | 12 | Below this, an agricultural loan is penalised |
| `SCORE_APPROVE` / `SCORE_FLAG` | 70 / 50 | Decision thresholds |

Adding a market means adding a country pack module with the same constant names — no change to the engine itself.

---

*Specification written against `backend/underwriting.py` as of September 2026. Figures in §6 were produced by evaluating the shipped scoring expressions directly.*
