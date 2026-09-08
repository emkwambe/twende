# Engineering Findings & Decisions

**A running record of what was found, what was decided, and what remains open.**

This exists because most of what follows was discovered by measuring the code rather than reading it, and because several decisions here are ones a future reader would otherwise re-litigate or silently reverse. Each entry states the evidence, the decision, and its status. Where a figure appears, it was produced by running something — the command is given so it can be re-checked.

Cross-references rather than duplicates: `UNDERWRITING_ENGINE.md` for the loan-decision engine, `TRUST_ENGINE_WHITEPAPER.md` §4.3.1 for chama scoring, `CHAMA_CREDIT_CALIBRATION_ANALYSIS.md` for the fairness argument, `sprints/15-SPRINT_IDENTITY_KYC.md` for identity work, `sprints/16-SPRINT_MULTI_COUNTRY.md` for territory expansion.

---

## Status at a glance

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Chama scoring was wealth-weighted | High — fairness | **Fixed** `c249a61` |
| 2 | Underwriting score inflation (max 118.89, not 100) | High — lending policy | **Fixed** `d2ddc68` |
| 3 | Two scoring engines, one undocumented | High — diligence | **Documented** `2384922` |
| 4 | Frontend/backend `User` type drift | Medium — blocked integration | **Fixed** `5243e7c` |
| 5 | Vite dev proxy pointed at the wrong port | High — nothing worked | **Fixed** `d2ddc68` |
| 6 | Offline session self-logout | Medium — broke demo mode | **Fixed** `d2ddc68` |
| 7 | Gateway 5xx misclassified as "server answered" | Low | **Fixed** `d2ddc68` |
| 8 | NIDA placeholder was a near-neighbour of a real number | High — PII | **Fixed** `bd09706` |
| 9 | `SHA-256(nida)` is functionally plaintext | High — PII | **Decided**, planned |
| 10 | `national_id` hard reject excludes 35–43% of adults | High — inclusion | **Planned** Sprint 15 |
| 11 | NIDA regex rejected the grouping printed on the card | Medium — onboarding | **Fixed** `280b5c3` |
| 12 | No public NIN check-digit algorithm exists | Medium — constrains design | **Decided**, enforced by test `280b5c3` |
| 13 | Formalization scoring is a wealth proxy | Medium — fairness | **Accepted with tripwire** |
| 14 | Cross-border transfer is a per-transfer permit | High — architecture | **Open — blocking** |
| 15 | PDPC registration overdue | High — legal | **Open — action** |
| 16 | Kenya country config said `TZS` | Low — regression | **Fixed** `76e70a4` |
| 17 | Trust Engine calibration has no backend counterpart | Medium | **Open** |
| 18 | No join-a-group flow | Medium — golden path gap | **Open** |
| 19 | Country packs are not actually multi-country | High — blocks expansion | **Open** — Sprint 16 |
| 20 | No currency denomination on any money column | High — silent corruption | **Fixed** `9675843` |

---

## 1. Chama scoring was wealth-weighted

**Evidence.** `calculateChamaScore` weighted absolute `savingsVolume` at 30% — the formula the calibration analysis labels *"Approach 1: Wealth-Weighted Scoring (WRONG)"*. Contribution size correlates with income, and income correlates with gender, geography and education — all attributes the Trust Engine explicitly excludes. The factor was acting as a proxy for the very things the model refuses to use.

**Decision.** Recalibrated to the normalized behavioural weights: consistency 45%, contribution-relative-to-chama-median 15%, tenure 20%, leadership 15%, group size 5%. Absolute amount enters nowhere.

**Verification.** Two equally reliable members, each contributing at their own group's median, score identically whether that median is TZS 50,000 or 500,000 — confirmed by evaluating the shipped function:

```
Member A ($50/mo, treasurer, 20 members): 98   [doc expects 97]
Member B ($500/mo, member, 10 members):   80   [doc expects 78]
Wealth invariance (same behaviour, 10× amount): 81 vs 81 → IDENTICAL
```

**Honest caveat.** The doc's §4 projects a 3-point cross-demographic spread; the shipped function produces **23**. The residual is entirely leadership role and group size — behavioural factors the doc says *should* differentiate. The 3-point figure appears to assume near-uniform leadership across segments, which its own table doesn't hold constant. The wealth term contributes zero by construction, which is the property that matters.

**Also fixed in passing.** Tenure was read as a raw 0–100 value with no cap, so 18 months scored 18/100 instead of the specified 75/100. The `min(100, months/24 × 100)` formula is now applied.

**Knock-on.** The What-If simulator advertised the removed lever — a scenario reading *"Save KES 5,000 more monthly"* and a KES 0–20,000 slider. Under the new formula those barely move the score, so the UI would have been telling users to do something that no longer works, in the wealth-signalling terms the analysis rejects. Both now offer contribution consistency.

---

## 2. Underwriting score inflation

**Evidence.** `SCORE_WEIGHTS` declares bands summing to exactly 100 and the module comment says "total 100". Two terms were floored but not capped:

| Case | Awarded | Declared band |
|---|---|---|
| Debt service @ DSR 0.00 | **38.89** | 25 |
| Debt service @ DSR 0.10 | 33.33 | 25 |
| Seasonality, agriculture ≥12 weeks | **15.00** | 10 |
| **Maximum attainable** | **118.89** | 100 |

Found by evaluating the shipped expressions, not reading them.

**Why it mattered.** The approval threshold of 70 was set against a nominal 0–100 scale, so approvals were **looser than intended** — a borrower could bank up to 13.89 unearned points, enough to carry a marginal file from `flagged` to `approved`. The effect was largest for exactly the population where caution matters most: many low-DSR applicants are low-DSR only because their *estimated* income sits at the TZS 50,000 floor, not because their cash flow is strong.

**Decision, and how it was made.** Initially documented as an open defect rather than silently fixed, because capping tightens approvals and the threshold may have been chosen empirically against the inflated scale — a lending-policy call, not a cleanup. The founder subsequently directed the fix. Both terms are now capped; max is exactly 100; thresholds stay 70/50.

**Live consequence.** Scores can only decrease relative to prior behaviour, so **some applications that previously auto-approved will now flag for manual review.** That is the intended correction, but it is a behaviour change worth knowing before a demo.

```bash
# re-verify max is exactly 100
cd backend && venv/Scripts/python.exe -c "..."   # see UNDERWRITING_ENGINE.md §6
```

---

## 3. Two scoring engines, one undocumented

**Evidence.** `backend/underwriting.py` decides every loan approval and appeared in no specification. The White Paper and Blueprint both presented the 7-factor XGBoost model as though it were making those decisions. A reviewer diligencing the paper against the repo would have found a scoring system they had not been shown — the largest gap in the data room.

**Decision.** The two are complementary, not competing, and the framing is now written down:

| | Trust Engine | Underwriting Engine |
|---|---|---|
| Question | How creditworthy is this **person**? | Can they afford **this loan**? |
| Output | 300–850, four tiers | 0–100, three-way decision |
| Horizon | Longitudinal behaviour | Point-in-time affordability |
| Status | Specified, not implemented | Implemented, in the decision path |

**Tier gates the offer; underwriting gates the disbursement.** Documented in `UNDERWRITING_ENGINE.md`, cross-referenced from White Paper §8.0 and Blueprint §4.6.

**Rationale for running the rule-based engine during the pilot** — worth restating because it reads as a shortcut and isn't: the 7-factor model needs 12+ months of cross-pillar history that no pilot borrower has, and the pilot's own repayments are what *generate* its training labels. The rule-based engine is a bridge that produces the data the model requires.

**Still not wired.** The engine reads no Trust Score; a Tier 4 and a Tier 1 borrower are underwritten identically. See #17.

---

## 4. Frontend/backend `User` type drift

**Evidence.** `const displayUser = user || currentUser` unioned the snake_case API `User` with a camelCase mock, so TypeScript permitted *no* field on the result. Consumers had grown defensive chains like `user.display_name || user.name` that couldn't typecheck either way. 55 errors, of which 12 traced to this one pattern.

**Decision.** The `User` type was never wrong — the mock was. Reshaping it to the contract it stands in for collapsed the union.

Two further places where the frontend had fallen behind the backend, both verified against `schemas.py`: `RegisterRequest` was missing `country` (which `schemas.py:32` has always had, and `Register.tsx` was already sending), and `getTokens()` claimed a two-field shape while the server sends `TokenPair`'s four.

**Result.** `tsc --noEmit` 51 → **0**. It can now gate CI, which it could not before.

---

## 5. Vite dev proxy pointed at the wrong port

**Evidence.** `vite.config.ts` proxied `/api` to **port 8002**; the backend, `.env.example`, the sprint docs and the Swagger URL all say **8000**. Every API call from the dev server returned 502.

**Why it went unnoticed.** Nothing in the frontend called the backend before the Golden Path sprint, so the misconfiguration had no symptom. It surfaced the moment login was driven through a real browser.

**Decision.** Repointed to 8000, keeping the `VITE_BACKEND_ORIGIN` override.

**Lesson worth keeping.** The build was green and the typecheck was clean while the app could not reach its backend at all. Neither check exercises the network. The browser test is what found it.

---

## 6. Offline session self-logout

**Evidence.** `fetchCurrentUser` returned `null` for both "no token" and "request failed", and `AuthContext.init()` treated `null` as "log out". So whenever the backend was unreachable, the app logged the user out — which made the demo-mode requirement unsatisfiable.

**Decision.** `fetchCurrentUser` now returns `null` only when there is no token to use, and throws on a failed request. `AuthContext` keeps the stored session on a network failure. A genuine 401 is already handled by the response interceptor, which refreshes or clears the session before this path is reached.

**The general shape of the bug:** collapsing two conditions that need opposite handling into one sentinel value.

---

## 7. Gateway 5xx misclassified

**Evidence.** After refining `useApiData` to distinguish "server answered" from "request never landed", the loans view stopped showing its Demo Mode banner — a dev-proxy **502 carries a status**, so it was classified as the server answering.

**Decision.** `status == null || status >= 500` counts as unreachable; 4xx is the API answering and the view reports what it actually said. That distinction is also what lets the loan view say *"You're not in a savings group yet"* on a 404 instead of mislabelling it as backend failure.

---

## 8. The NIDA placeholder was a near-neighbour of a real number

**Evidence.** The repo's `NIDA_FORMAT_HINT` — present before this engagement, in three files including a **user-visible form placeholder** — compared to a real number as follows:

| Segment | Repo | Real | |
|---|---|---|---|
| Birth year | 1984 | 1983 | off by one |
| Birth MMDD | 0313 | 0413 | transposed |
| **Ward code** | **11101** | **11101** | **identical** |
| Sequence | 00006 | 00007 | **adjacent** |
| **Check digits** | **25** | **25** | **identical** |

Not an independently invented number. It leaked a real ward code and sat one digit from a real sequence.

**Decision.** Replaced everywhere with `1990-0101-99999-00000-00` — ward `99999` and check digits `00` do not occur in issued numbers, so it reads as fake at a glance while still matching `NIDA_REGEX`.

**What the cleanup actually required.** Source files were the easy part:

- The unique constraint on `national_id` meant re-seeding would **not** overwrite stored values; the DB rows had to be rewritten directly, and each person's `User` and `Member` rows reconciled to match.
- **SQLite retains overwritten values in free pages.** A byte scan confirmed the old values were still recoverable from the file after the row update. `VACUUM` was required. This is the kind of thing that turns "we removed it" into a false statement.

**Verified clean:**
```bash
grep -rnoE "\b(19|20)[0-9]{2}-[0-9]{4}-[0-9]{5}-[0-9]{5}-[0-9]{2}\b" . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv
# plus a byte-level scan of backend/twende.db
```

**Standing rule.** Synthetic identity values use ward `99999`, check digits `00`. Never a plausible-looking invented number — two of the values in the repo were invented, plausible, and therefore indistinguishable from real ones.

**Not fixable:** the real number was pasted into a Claude session transcript and cannot be deleted from it. Deleting the session is the only removal path.

---

## 9. `SHA-256(nida)` is functionally plaintext

**The proposal.** Store `SHA-256(nida)` and compare hashes to verify.

**Why it fails.** SHA-256 is preimage-resistant, not confidentiality-preserving. It hides its input only when the input is drawn from a large, high-entropy space. A national ID is not.

| Attacker knowledge | Search space | One RTX 4090 @ 21,975 MH/s |
|---|---|---|
| Naive 20 digits | 10²⁰ | ~450 years |
| DOB-structured | ~3 × 10¹⁶ | ~16 days |
| **Knows the DOB** — it's in the adjacent column | 10¹² | **~45 seconds** |
| **Has any list of issued NINs** — only ~20M exist | ~2²⁴ | **~1 millisecond** |

The real entropy of a national ID is bounded by the population holding one: **~24 bits**. It is not a secret — it is printed on a card and already held by every MNO, employer and landlord the person has dealt with. A per-row salt breaks dedup (the only reason to hash); a global salt in the same database helps nobody.

**The precedent that settles it.** **PCI DSS v4.0 removed plain one-way hashing** as an acceptable control for card numbers and now requires keyed hashes with key management — against a 16-digit space *smaller and better structured* than a NIN.

**Decision.** `HMAC-SHA256(pepper, normalize(nid) ‖ type ‖ "v1")` computed **inside** KMS, plus an AES-256-GCM envelope-encrypted copy. Full design in Sprint 15 §4.

**Two things this corrects in the original framing:**

- **Hashing buys no legal relief.** A hash is pseudonymisation, not anonymisation, under Kenya DPA s.2 and the TZ PDPA. The column stays personal data: still in scope for DSARs, erasure, retention, cross-border rules and breach notification. "We hashed it, so we're fine" is the part that's wrong — not the hashing.
- **You cannot rotate a hash.** HMAC is one-way; `v2` cannot be derived from `v1`. If the pepper leaks and the index is all you hold, there is no re-key path short of re-collecting every number. The encrypted copy is what makes rotation possible — that, not retrieval, is the main reason to keep it.

**Say the honest thing.** *"We do not store your ID number"* is false if reversible ciphertext is held. *"Your ID number is encrypted, no member of staff can read it, and it is used only to prevent duplicate accounts and to meet anti-money-laundering law"* is true and defensible.

**And the likelier leak is not the database.** Sentry's Python SDK captures stack-frame locals by default, so any exception raised below the parser ships the raw number. Postgres prints bound parameters unless `log_parameter_max_length = 0`. Those controls must ship with the encryption or the encryption is theatre.

---

## 10. The `national_id` hard reject excludes a third of the market

**Evidence.** `underwriting.py`'s first critical check rejects any application where `member.national_id` is absent. Roughly **35–43% of Tanzanian adults** hold no usable NIDA credential (FSDT 2023: 57% have a NIN; ~1.2M produced cards uncollected as of Jan 2025). FinScope 2023: rural formal access 57% vs urban 82%; women, under-25s, dependants and rural dwellers 40–80% excluded.

**Why this is the sharpest finding in the engagement.** It lands on the same cohort the Chama Calibration Analysis identified as the primary customer — the rural female vendor with a five-year perfect contribution record. Wealth bias was removed from the chama factor; a NIDA gate reintroduces the same exclusion one layer earlier, **in the enrolment funnel, where no fairness audit can see it.** You cannot measure bias in people who never got an account.

**Decision.** Replace the hard reject with a Tier 2 check reachable by two routes — documentary, or community attestation. Sprint 15 §3.

---

## 11. The regex rejected the number as printed on the card — **fixed**

**Evidence.** `NIDA_REGEX` expects `4-4-5-5-2`; cards print `8-5-5-2`. Both are 20 digits.

```
as printed on card (8-5-5-2)   19950101-12345-67890-12    digits=20  repo_regex_match=False
as repo expects (4-4-5-5-2)    1990-0101-99999-00000-00   digits=20  repo_regex_match=True
```

A user copying their card verbatim is told their own ID is invalid.

**Fixed** in `280b5c3`. All three groupings are accepted, input normalises to bare digits, and the canonical stored form is the card grouping — verified live: an ID in card grouping now registers successfully.

`normalize_nid` also handles what real input actually contains: separators of every kind, Unicode format characters, and the zero-width and RTL marks that arrive with a WhatsApp paste. Confusables (`O`→0, `I`/`l`→1, `S`→5, `B`→8) are mapped **before** rejection rather than after — a user reading `O` off a card made a legible mistake, not an invalid claim. Every fix applied is recorded, because a spike in `O→0` is a UX signal and clean input arriving fast is a security signal.

---

## 12. No public NIN check-digit algorithm exists

**Evidence.** Nothing from NIDA; nothing in any standards or vendor source; and `python-stdnum` has **no Tanzania module at all** — meaningful negative evidence, since its inclusion criterion is literally "any number that has some validation mechanism available". The trailing two digits are *presumed* to be check digits; no source confirms even that.

**Decision.** **Ship no checksum.** An invented mod-10/mod-11 would silently reject real citizens — invisible on our side, total on theirs. Offline validation caps at: 20 digits after normalisation, positions 1–8 a real past date implying age ≥ 18.

**Related trap.** Searches conflate Tanzania's NIN with Uganda's (14 alphanumeric, `CM`/`CF` prefix). A spec citing 14 characters with letters is Uganda's.

**Now enforced by test** (`280b5c3`): `test_no_checksum_is_implemented` mutates the trailing pair and asserts the number still validates. It exists to fail loudly if someone later adds a checksum — the failure mode being guarded against is invisible on our side and total for the person rejected.

---

## 13. Formalization scoring is a wealth proxy

**Evidence.** `FORMALIZATION_DOCS` awards NIDA 8, TIN 4, BRELA 3 — up to 15 of 100 underwriting points. Document possession correlates with being urban, male, formally employed and wealthier: the same class of proxy the chama calibration removed, in the same scoring pipeline.

**Decision — keep it, with the trade-off stated rather than silently carried.** Formalization genuinely correlates with recoverability and legal enforceability, which are real credit considerations, and unlike the chama factor there is no obvious within-group normalisation.

Three mitigations: documents gate *eligibility*, not access; behaviour sizes the loan; and the bias is monitored by tracking approval rate and mean score **by verification route**. If the attestation cohort underperforms on *approval* without underperforming on *repayment*, the weight is doing wealth-proxy work rather than credit work and should be cut.

That third point is what makes this a hypothesis with a tripwire rather than an assertion.

---

## 14. Cross-border transfer is a per-transfer permit — **blocking**

**Evidence.** TZ `GN 449C` regs 20–22: Form No. 7 must name the applicant, the recipient, **the individual data subject**, the data type, purpose, and **the date and time of sending**. Reg. 22 then restricts the data to that named recipient and stated purpose with **no onward disclosure or transfer without Commission approval**.

**Why it is an architecture decision, not paperwork.** Naming the data subject and send time reads as a *transfer-instance* permit, not a standing authorisation. And reg. 22 is incompatible with normal SaaS: an offshore KYC vendor cannot pass data to its own cloud region, OCR provider or liveness sub-processor without Commission approval, which no standard vendor DPA contemplates.

There is **no in-country AWS/GCP region**; `af-south-1` is South Africa and still a cross-border transfer.

**Kenya is the opposite** — s.48 needs safeguards + DPA + DPIA and **no permit**; consumer credit is not on the s.50 localisation list. The asymmetry should drive the topology.

**Open, and it is the critical path.** The fee and timeline are unpublished. This is the only unknown that can move a launch date.

---

## 15. PDPC registration is overdue — **action**

**Evidence.** TZ PDPA in force since 1 May 2023. `GN 449C reg. 3` prohibits collecting or processing personal data without being registered. Successive grace periods expired and **enforcement inspections began 9 April 2026**. The platform is collecting identity data outside that regime now.

**Cost is not the obstacle:** ~TZS 100,000 for the small band (1–49 staff, turnover < TZS 100M), 5-year certificate, via the RCMIS portal. **PDPA s.27(3) also requires a DPO — no thresholds, no exemptions.**

Cheapest item on the list, and it gates everything else.

---

## 16. Kenya country config said `TZS` — **fixed**

**Evidence.** Commit `41bb6a4` normalized currency across all country configs and caught the Kenya entry: `KE: { currency: 'TZS', currencySymbol: 'TZS', … }`. A Kenyan user would have been shown Tanzanian shillings. The backend's `country_config.py` was untouched and still read `KES`/`KSh`, so the two sides of the stack disagreed for that market.

**Why the sweep was right everywhere else.** 125 KES/KSh literals across 26 files were correctly converted — those were hardcoded pilot strings. This entry is different in kind: it is multi-country configuration, and the whole point of the country-pack design is that each market carries its own values. TZ remains the pilot default through `getCountryConfig`'s fallback, which is what makes Tanzania-first behaviour correct *without* falsifying the Kenya config.

**Fixed** in `76e70a4`. Frontend and backend now agree on both markets, verified by parsing both config files and comparing:

```
KE  frontend=KES/KSh   backend=KES/KSh   MATCH
TZ  frontend=TZS/TSh   backend=TZS/TSh   MATCH
```

**Worth keeping as a guard.** That comparison is a two-minute script and would have caught this at the point it was introduced. A cross-stack config-agreement check is a reasonable thing to add to CI alongside `tsc`.

---

## 17. The Trust Engine calibration has no backend counterpart — **open**

The recalibrated chama weights live only in `src/trust/algorithm.ts`. `/users/me/trust-factors` computes the factor *inputs* server-side from real records, but the scoring itself is client-side. When the Trust Engine moves to the backend, the same weights must land there — and the calibration doc's §9.1 item 3 also asks for `chamaMedianContribution`, `chamaMeetingFrequency` and `chamaOfficerRole` on the member profile, which is a schema change not yet made.

---

## 18. No join-a-group flow — **open**

Surfaced by end-to-end testing: a freshly registered user has no group membership, so `/loans/eligibility` correctly 404s and they cannot borrow. Loans are guaranteed by chama savings, so the behaviour is right — but **register → apply does not complete for a new account**. The UI now explains this rather than mislabelling it as backend failure. There is no flow to join or form a group.

---

## 19. Country packs are not actually multi-country — **open**

**Evidence.** Sprint 14 created `country_packs/` and `tanzania.py` is genuinely clean — pure data, no backend imports. But **nothing consumes the abstraction.** All six backend modules reach past the registry:

```python
# config.py, constitution.py, country_config.py, ledger.py, main.py, underwriting.py
from country_packs import tanzania as tz
```

`get_pack()` is called by nothing. `PACKS` has one entry. And the resolver **fails open**:

```python
return PACKS.get(country_code.upper(), tanzania)   # get_pack("UG") → Tanzania, silently
```

| Module | `tz.*` refs | Consequence |
|---|---|---|
| `underwriting.py` | 15 | **Never reads `group.country`** — a Kenyan group would get the VICOBA 4× rule, a TZS income floor, and NIDA/TIN/BRELA formalization points |
| `config.py` | 8 | TZ constants frozen into module-level singletons at import; one is named `MIN_WEEKLY_INCOME_TZS` |
| `main.py` | 3 | `tz.tier_for_score()` — TZS tiers regardless of country |
| `ledger.py` | 2 | TZ grace weeks and currency label for all markets |
| `constitution.py` | 1 | `JOINING_FEE_TZS` |

Kenya has *display* config (`country_config.py`, `country.ts`) but **no pack** — no underwriting guardrails, no formalization docs, no tiers, and `id_regex=None  # TODO`.

**Why this is worse than not supporting a market.** Adding Uganda today produces a system that silently underwrites it as Tanzania — no error, no signal, plausible-looking output. Failing open is the defect.

**Decision.** `get_pack()` must raise on an unsupported code; packs must resolve from the entity's country at runtime; a written contract must define what a pack owes. Sprint 16 §2–3.

**Sequencing.** Sprint 16 follows Sprint 15 deliberately. Identity is irreducibly per-market — Tanzania NIDA (20 digits, no checksum), Kenya Huduma Namba (**≤8 digits, unpadded — a fixed-width mask rejects real holders**), Uganda NIN (14 alphanumeric, `CM`/`CF`), Rwanda NID (16 digits). Building the abstraction against zero real implementations is speculative generality; KYC on Tanzania produces the reference implementation that defines the contract, and Kenya is then the second one that proves it.

And the code is not the long pole — **every market needs its own licence and data-protection registration**, which is sequential and slow (§ compliance calendar).

---

## 20. No currency denomination on any money column — **fixed**

**Evidence.** Thirteen money columns across five tables (`groups`, `members`, `loan_applications`, `mobile_money_statements`, `transactions`) are bare `Numeric(12, 2)`. **No currency is stored anywhere** — not on the row, not on the table, not in a constraint. The two `currency` fields in `schemas.py` are response-shaping only, computed from `tz.CURRENCY` at serialisation and never persisted.

**Harmless today, corrupting on day one of a second market.** TZS 1,000,000 and KES 50,000 are roughly equal in value and twentyfold apart as numbers. Once both share a column:

- group totals, portfolio aggregates and the ledger silently mis-sum;
- the underwriting ratios (`savings / amount`, `group_savings / amount`, DSR) are dimensionless **only if numerator and denominator share a currency — nothing enforces that**;
- the failure is silent and plausible. A wrong total looks like a total.

**Decision.** Add currency to every money-bearing table, backfill `TZS`, enforce `NOT NULL`, and make an amount without a currency unconstructible in the application layer — the same "make the wrong thing unrepresentable" move as the redacting `NationalId` type.

**Fixed** in `9675843`, ahead of Sprint 15, because it is a correctness bug rather than a multi-country feature and gets more expensive with every transaction written.

**What shipped.** A `currency` column on all five tables — loans and transactions carry their own rather than joining to the group, since they are the durable financial record. A three-step migration (nullable → backfill from each row's country or its parent → `NOT NULL`) so no row is ever undenominated mid-flight, with the backfill map written literally rather than imported, because a migration must keep producing the same result years from now. Write paths denominate at creation from the country pack; `ledger.post_transaction` refuses a member/group disagreement; `underwriting.evaluate` refuses to score across denominations *before* computing anything.

**The load-bearing piece is `money.py`.** `Money` cannot be constructed without a currency, cannot be combined across currencies, and cannot be multiplied by `Money`. `Money ÷ Money` returns a bare ratio — the shape every underwriting ratio takes, and dimensionless only because both sides now provably share a denomination. Deliberately **not** an FX layer: conversion needs a rate, a timestamp and an audit trail, and does not belong in an arithmetic operator.

**All 23 tests assert that something raises**, not that it computes. The failure being defended against is silent, so producing the right answer is not the property under test.

**Incidental finding:** Alembic had no `render_as_batch` for SQLite, so none of these `ALTER`s would have applied. Now enabled, dialect-conditional.

`scripts/verify_currency_integrity.py` gates CI: no undenominated row, none disagreeing with its parent, no currency unbacked by a country pack.

---

## Compliance calendar

Ordered by lead time, longest first.

| When | Item | Why |
|---|---|---|
| **Now** | PDPC registration (TZ) + ODPC registration (KE) | Processing is prohibited without it; ODPC cert is a precondition for a CBK credit licence |
| **Now** | Appoint a DPO | PDPA s.27(3), no exemptions |
| **Now** | Open the PDPC cross-border permit conversation | Unpublished timeline; gates hosting |
| **T-90d** | File the Kenya DPIA | **Must be filed 60 days before processing begins.** Credit scoring triggers it on three independent grounds |
| **T-90d** | Open the NIDA CIG MoU conversation | Government procurement cycle; no self-service path |
| **T-60d** | Privacy notices (EN + **Swahili**), retention schedule, processor DPAs, breach runbooks | Two runbooks — KE requires notifying data subjects, TZ does not clearly |
| **T-30d** | Consent-record schema, Tier A/B data split, DSAR export (**7-day KE access SLA**), ADM reason codes, human-review path | The 7-day SLA breaks any manual process |

**Retention floors:** Tanzania **10 years** (AML Reg. GN 289 reg. 30), Kenya **7 years** (POCAMLA), from *relationship end or last transaction* — not enrolment. These are floors *and* ceilings: storage limitation means the expiry job must actually run.

---

## Things not to assert

Carried forward so nobody states them with more confidence than the evidence supports.

- **The NIN's internal structure.** The `YYYYMMDD-NNNNN-NNNNN-NN` layout is well-attested but has **no primary citation**. Verify against real cards before it goes in a funder-facing document.
- **TZ penalty figures.** A TZS 100M administrative cap and a TZS 5bn corporate disclosure ceiling come from different sources and did not reconcile against the statute; TanzLII returned 403 and the PDPC PDFs would not parse.
- **Current BoT tier ceilings.** The 2015 schedule has been amended by circulars that could not be located; Vodacom's published table already exceeds it.
- **NIDA coverage percentage.** *Registered*, *NIN issued*, *card produced*, *card collected* and *SIM registered* are five different numbers, and sources move between them freely.
- **Whether reg. 20 permits a standing cross-border authorisation.** Get PDPC's written position before architecting around any foreign vendor.
- **How granular Kenya's right to explanation must be.** Untested — no determination or judgment found. Build to the stricter per-decision reading; it is cheap now and expensive to retrofit.
- **Whether a group-savings platform escapes Tier-2 microfinance licensing.** Fact-specific. *"We only provide software"* is a position regulators test.
- **KYC drop-off benchmarks.** The circulating figures are European consumer surveys or vendor marketing. There is no good published dataset for East African low-literacy mobile onboarding. Instrument the funnel; treat external numbers as directional.

---

## Method notes

Three habits earned their keep and are worth repeating.

**Measure, don't read.** The score-inflation defect, the wealth-invariance property, the regex mismatch and the SQLite free-page residue were all found by running something. All four look fine in review.

**Green checks prove less than they appear to.** The build passed and the typecheck was clean while the dev server could not reach its backend at all — because neither exercises the network. Conversely `tsc` was reporting 51 errors while `npm run build` was green, because Vite does not typecheck. Know what each check actually covers.

**Distinguish "I verified" from "the doc says".** Several documents in this repo disagreed with the code, and in every case the code was authoritative about behaviour while the document was authoritative about intent. Both had to change.
