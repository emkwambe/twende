# Identity Referee Policy

## Accepting a Ward or Village Executive Letter as Identity Evidence

**Status:** Draft for review by Tanzanian counsel and, before pilot, by the Bank of Tanzania.
**Implements:** `sprints/15-SPRINT_IDENTITY_KYC.md` §3, Tier 2 route 2
**Code:** `backend/kyc.py`, `backend/models.py::IdentityAttestation`

---

## 1. Why this policy exists

TWENDE serves informal savings groups in Tanzania. **Roughly 35–43% of Tanzanian adults hold no usable NIDA credential** — FSDT put NIN coverage at 57% in 2023, and around 1.2 million produced cards were still uncollected as of January 2025. Non-holding is not evenly spread: FinScope Tanzania 2023 records rural formal access at 57% against 82% urban, and 40–80% exclusion among women, under-25s and dependants.

That is the same population the platform's credit scoring was deliberately recalibrated to serve. Removing wealth bias from chama scoring while gating enrolment on a document that group cannot obtain would move the exclusion one layer earlier — **into the enrolment funnel, where no fairness audit can detect it.** A bias review can only examine people who have accounts.

This policy therefore sets out a **second, documented route to identity verification** for applicants without a NIDA credential.

## 2. Legal basis

This is not a workaround. A ward or village executive letter is **already recognised as identity evidence in Tanzanian financial regulation**, in three separate instruments:

| Instrument | Provision |
|---|---|
| **BoT Payment Systems (Electronic Money) Regulations 2015**, Third Schedule, Form F | Accepted photo ID reads verbatim: *"National ID; or Voter's registration card; or Employment ID; or Social Security ID; **or Letter from ward/village executive**."* |
| **NBC Kikundi group account** requirements | Every signatory must provide a valid ID **and** *"Proof of residence from Ward Executive Officer (WEO) or Village Executive Officer (VEO)"* |
| **Microfinance (Community Microfinance Groups) Regulations 2019, GN 678** | Tier 4 group registration requires *a letter of reference from the ward or village authority* |

Further, the **Anti-Money Laundering Regulations GN 289 of 2012, reg. 3(1)** requires, for a Tanzanian citizen, a *"voters' card **or** national identity card"* — the obligation is to identify the customer, not specifically to collect a NIN.

A NIDA-only onboarding flow would therefore be **stricter than Tanzanian law requires**, and stricter than the banks TWENDE competes with.

The framework this policy follows most closely is the **Central Bank of Liberia's Mobile Money Regulations**, which state that institutions *"must have written policies on the identification of people without a formal ID, listing documents acceptable for their identification, for example allowing a third party (such as clergymen, village/clan head/chief, etc. with acceptable means of identity) to act as referees."* This document is that written policy.

It is also consistent with the **FATF February 2025 amendments to Recommendation 1 and INR.10**, which replaced "commensurate" with "proportionate" and now require countries to *allow and encourage* simplified measures in proven lower-risk cases.

## 3. Who may act as a referee

Two independent attestations are required. Neither alone is sufficient.

### 3.1 The state referee — one WEO or VEO

| Requirement | Detail |
|---|---|
| Office | Ward Executive Officer (WEO) or Village Executive Officer (VEO) only |
| Evidence | A signed letter on the office's letterhead, naming the applicant |
| Recorded | Officer name, title, office, ward and/or village, letter reference, letter date |
| Retained | A scan or photograph of the letter, stored with the AML record |

No other office qualifies. Chairpersons, religious leaders, employers and elders are **not** accepted, notwithstanding the Liberian model's broader list — Tanzanian regulation names the ward and village executive specifically, and matching it exactly is the stronger position.

### 3.2 The community referees — at least two group officers

| Requirement | Detail |
|---|---|
| Number | **At least two**, and neither may be the applicant |
| Office | Chairperson, Treasurer or Secretary of the applicant's own group |
| Standing | **Each must already be verified to Tier 2 in their own right** |
| Recorded | An immutable snapshot of which officers attested, and when |

The standing requirement is the control that matters. Without it, unverified accounts could vouch each other into credit — the obvious attack on this route. Because officers must themselves be verified, the route cannot bootstrap from nothing.

The snapshot is stored as a list on the attestation record rather than as a live join, so it cannot silently change if an officer later leaves the committee. **What was relied on at the time must remain readable.**

## 4. What the attestation grants, and what it does not

**Grants:** Tier 2 — credit eligibility. The applicant may apply for a loan and be underwritten normally.

**Does not grant:**

- **Any change to loan sizing.** Tier gates the offer; behaviour sizes the loan. A member verified by attestation is subject to the same debt-service, savings and group-guarantee tests as anyone else.
- **Formalization points.** The underwriting engine awards up to 15 points for NIDA, TIN and BRELA. An attested member scores zero on that factor. This is a known and deliberate residual disparity — see §7.
- **Permanence.** The attestation is subject to the same renewal interval as documentary verification.
- **Tier 3.** Business limits still require a TIN and business licence.

## 5. Refusal and review

An attestation is refused where any of the following holds, and the reason is given to the applicant in Kiswahili:

- fewer than two qualifying group officers attested;
- an attesting officer is not a chair, treasurer or secretary of that group;
- an attesting officer is not themselves verified to Tier 2;
- the applicant is among the attesting officers;
- the letter is not from a WEO or VEO, or does not name the issuing officer and office.

**Before real-money disbursement, a human review queue must sit in front of acceptance.** The current implementation accepts an attestation once the evidence is complete and internally consistent, which is appropriate for a pilot with supervised onboarding and is *not* appropriate for unsupervised production. This is recorded as an open item in the sprint.

## 6. Renewal

Verification is not permanent, by either route.

NIDA suspends NIN usage **one month after an SMS notice** where a produced card is never collected. A person can hold a valid NIN, be SIM-registered against it, and still find the credential switched off. Attestation carries an analogous risk: an officer leaves, a group dissolves, a member moves ward.

Both routes therefore carry a renewal date (`KYC_REVERIFY_DAYS`, currently 365). On lapse the member drops below the borrowing threshold and is told plainly what to do — including, where relevant, that an uncollected NIDA card should be collected, because that is the most common cause.

## 7. The residual disparity, stated

An attested member reaches credit but **scores zero on formalization**, which is up to 15 of 100 underwriting points. A NIDA holder scores at least 8. So the two routes reach the same door and do not yet reach the same terms.

That is retained deliberately — formalization correlates with recoverability and legal enforceability, which are genuine credit considerations — but it is **monitored rather than assumed**:

> Track approval rate and mean underwriting score by verification route. **If the attestation cohort underperforms on approval without underperforming on repayment, the formalization weight is doing wealth-proxy work rather than credit work, and it should be cut.**

That is the falsifiable test. Without it this section is an assertion; with it, it is a hypothesis with a tripwire. The route is recorded on every member (`kyc_method`) precisely so the comparison can be run.

## 8. Records and retention

Each attestation retains: the letter image, the issuing officer's details, the attesting officers' identities at the time, the reviewer, and the decision with its reason.

This forms part of the customer due diligence record and is retained for the **AML minimum of ten years** from the end of the business relationship or the last transaction (AML Regulations GN 289 of 2012, reg. 30(1)), in the sealed archive described in the sprint — separate store, separate key, no application read path.

Retention is a floor **and a ceiling**: once the period elapses, the record must actually be destroyed.

## 9. Open items before pilot

| Item | Why |
|---|---|
| **Counsel review** | Confirm that a WEO/VEO letter satisfies CDD for a credit product, not only for e-money onboarding under Form F |
| **BoT engagement** | Put this policy to the regulator before relying on it at scale. A filed, written policy is the point of the Liberian model |
| **Human review queue** | Required before unsupervised disbursement (§5) |
| **Kiswahili translation** | Refusal reasons and applicant-facing guidance must be in Kiswahili |
| **Officer fraud controls** | A single officer attesting for unusually many members is a signal worth alerting on. Related: the documented Tanzanian market in SIMs registered on other people's biometrics means possession of a phone proves little |

---

*Draft. Engineering policy, not legal advice. §9 must be closed before the pilot relies on this route.*
