# Sprint 15 — Identity & KYC

## Tiered Verification, PII Custody, and Not Excluding a Third of the Market

**Status:** Plan. Nothing in this sprint is implemented.
**Depends on:** Sprint 14 (country packs), Golden Path (live loan/underwriting path)
**Blocks:** Tanzania pilot, BoT/PDPC engagement, any real-money disbursement
**Research basis:** four commissioned research passes (NIDA/TIN/BRELA formats; PII cryptography; TZ PDPA + KE DPA; KYC tiering and exclusion). Sources in §10.

---

## 0. Why This Sprint Exists

Three things are true of the codebase today:

1. **`backend/underwriting.py` hard-rejects any loan application where `member.national_id` is absent** — the first critical check. Roughly **35–43% of Tanzanian adults do not hold a usable NIDA credential**. That single line is, right now, the most consequential exclusion mechanism in the platform.
2. **National ID numbers are stored in plaintext**, in a unique-indexed column, on both `User` and `Member`.
3. **The format regex rejects the grouping printed on the card.** `NIDA_REGEX` expects `4-4-5-5-2`; the number as printed is `8-5-5-2`. Both are 20 digits. A user copying their card verbatim is told their own ID is invalid.

None of these is a bug in the ordinary sense. They are the consequence of building the credit path first and identity second, which was the right order. This sprint pays that back.

**It is also a compliance deadline, not just an improvement.** Tanzania's Personal Data Protection Act 2022 has been in force since 1 May 2023; the registration grace period expired and **PDPC enforcement inspections began 9 April 2026**. `GN 449C reg. 3` prohibits collecting or processing personal data without being registered. The platform is currently collecting identity data outside that regime.

### Scope

| In | Out |
|---|---|
| NIDA/TIN/BRELA validation and normalisation | Building our own biometric matcher |
| Tiered KYC ladder mirroring BoT Form F | NIDA CIG integration (MoU-gated — §8) |
| PII custody: blind index + sealed AML archive | Replacing the underwriting model |
| Non-NIDA identity paths (WEO/VEO letter, group attestation) | Kenya launch (design for it, don't build it) |
| Log/telemetry redaction | Liveness/PAD vendor integration (§8) |
| DSAR, retention, and deletion machinery | Migrating off SQLite |

---

## 1. Findings That Force Design Decisions

Each of these overturns something we would otherwise have built. They are the reason this is a sprint and not a ticket.

### 1.1 There is no public NIDA check-digit algorithm

No specification exists from NIDA, in `python-stdnum` (which has **no Tanzania module at all** — meaningful, since its inclusion criterion is "has some validation mechanism"), or in any standards or vendor source. The last two digits are *presumed* to be check digits; no source confirms it.

**Consequence:** we ship **no checksum validation**. An invented mod-10/mod-11 would silently reject real citizens, and we would never know — the failure is invisible on our side and total on theirs. Offline validation is capped at: 20 digits after normalisation, positions 1–8 parse as a real past calendar date implying age ≥ 18.

### 1.2 The number encodes a birth date — which makes our own lookup an oracle

Positions 1–8 are `YYYYMMDD` of birth; positions 9–13 encode a postcode (zone/region/district/ward) of the **place of registration**. Two consequences:

- **Never treat the embedded date as identity evidence.** It is the *registered* DOB, and NIDA runs a public amendment process, so it legitimately diverges from the record. Soft consistency signal only.
- **A verification endpoint that behaves differently for "found" vs "not found" is a DOB-confirmation and identity-enumeration oracle.** An attacker who knows a target's date of birth — which is in our own database and on the loan application — faces ~10¹² candidates, not 10²⁰. Nigeria does not have this problem because its NIN is deliberately non-intelligible. Ours is not. §5.4 covers the mitigation.

### 1.3 `SHA-256(nida)` is functionally plaintext

This was the proposed approach and it does not survive contact with the numbers.

| Attacker knowledge | Search space | Time, one RTX 4090 (21,975 MH/s, hashcat v6.2.6) |
|---|---|---|
| Naive 20 digits | 10²⁰ | ~450 years |
| DOB-structured | ~3 × 10¹⁶ | ~16 days (≈2 days on 8 GPUs) |
| **Attacker knows the DOB** — it's in the adjacent column | 10¹² | **~45 seconds** |
| **Attacker has any list of real NINs** — only ~20M exist | ~2 × 10⁷ ≈ 2²⁴ | **~1 millisecond** |

The real entropy of a national ID is bounded by the population holding one: **~24 bits**. It is not a secret; it is printed on a card and already held by every MNO, employer and landlord the person has dealt with. A per-row salt does not help (it breaks dedup, which is the reason for hashing at all); a global salt stored in the same database does not help either.

**Precedent that settles the argument:** **PCI DSS v4.0 removed plain one-way hashing** as an acceptable control for card numbers and now requires keyed hashes with key management — against a 16-digit space that is *smaller and better structured* than a NIN. We would be shipping the control the payments industry deprecated for exactly this reason.

**And hashing buys no legal relief.** A hash is pseudonymisation, not anonymisation, under Kenya DPA s.2 and the TZ PDPA. The column remains personal data: still in scope for DSARs, erasure, retention limits, cross-border rules and breach notification. GN 449C's retention rules go further — they require that we *test* that deleted data is unrecoverable and anonymised data is not re-identifiable. Ciphertext of a NIN is pseudonymised; document it as such and do not claim otherwise.

### 1.4 The ward/village executive letter is a regulator-recognised identity document

This is the most important finding in the sprint, and it is not a workaround — it is written into three separate Tanzanian instruments:

- **BoT Payment Systems (Electronic Money) Regulations 2015, Third Schedule Form F** lists acceptable photo ID as: *"National ID; or Voter's registration card; or Employment ID; or Social Security ID; **or Letter from ward/village executive**."*
- **NBC's Kikundi group account** requires, for every signatory, a valid ID **plus** *"Proof of residence from Ward Executive Officer (WEO) or Village Executive Officer (VEO)"*.
- **Microfinance (Community Microfinance Groups) Regulations 2019, GN 678** — Tier 4 group registration requires *a letter of reference from the ward or village authority*.

**Consequence:** a NIDA-only onboarding flow is stricter than Tanzanian law requires, and stricter than the banks we would be competing with. The *barua ya utambulisho* becomes a first-class enrolment path in this sprint, not a fallback.

### 1.5 A NIN is not stable state, and a verified SIM is not a verified person

- **NIDA suspends NIN usage one month after an SMS notice if the physical card is never collected.** ~1.2M cards were produced and uncollected as of January 2025. A user can hold a valid NIN, be SIM-registered against it, and still have the credential switched off. **Never cache "has NIDA" as permanent state; re-verify.**
- There is a **priced market in SIMs registered on other people's biometrics** in Tanzania — agents tell a customer their fingerprint "wasn't captured properly", re-scan, and register a spare SIM later sold on. A March 2026 Morogoro operation seized 198 fraud-linked SIMs, 88 from one agent; street price TZS 10,000–15,000. **The MSISDN-as-identity shortcut is dead.** Treat SIM registration as a convenience signal, never as identity assurance for credit.

### 1.6 Cross-border transfer is a per-transfer permit, not GDPR-style SCCs

`GN 449C` regs 20–22: Form No. 7 must name the applicant, **the recipient**, **the data subject**, the data type, purpose, and **the date and time of sending**. Reg. 22 then restricts the data to that named recipient and stated purpose, with **no onward disclosure or transfer without Commission approval**.

**Consequence — and this is an architecture decision, not a paperwork one:** naming the individual data subject and the send time reads as a *transfer-instance* permit, not a standing authorisation. And reg. 22 is incompatible with how normal SaaS works, since an offshore KYC vendor cannot pass data to its own cloud region, OCR provider or liveness sub-processor without Commission approval — which their standard DPA will not contemplate. **This is the strongest argument for keeping the identity pipeline domestic.** Note there is no in-country AWS/GCP region; `af-south-1` is South Africa and is still a cross-border transfer.

Kenya is the opposite: s.48 needs safeguards + DPA + DPIA, and **no permit**. Consumer credit is not on the s.50 localisation list. The asymmetry should drive our topology.

### 1.7 AML requires 10-year retention — and that is reconcilable

**AML Regulations GN 289 of 2012, reg. 30(1): minimum ten years** from the end of the relationship or last transaction, retrievable *without delay and in legible format* (reg. 31(1)). Kenya's POCAMLA equivalent is 7 years.

This appears to collide with erasure rights. It does not, and the resolution is the same in both jurisdictions: **the erasure right carves out data retained to comply with a legal obligation.** We never delete KYC data on request during the retention window — we refuse, cite the instrument, and log the decision. Refusing *without* a stated statutory basis is what draws a fine.

Critically: **nothing in reg. 30 requires the NIN in queryable plaintext in the operational database.** The obligation is to be *able to produce* the record to a competent authority. That is what §4 is built around.

And reg. 3(1) permits *"voters' card **or** national identity card"* — **we are not obliged to collect a NIN at all.** That is our necessity-and-proportionality argument to the PDPC, and it is a strong one.

### 1.8 The exclusion is measurable, and it lands on the people the platform is for

| Measure | Figure | Source |
|---|---|---|
| Adults with a NIN | **57%** (2023, trending up) | FSDT |
| NINs issued, cumulative | >22.6M | NIDA to Parliament, Apr 2026 |
| Cards produced but uncollected | **1.2M** | Jan 2025 |
| Fully financially excluded adults | **6.3–6.4M** | FinScope TZ 2023 |
| Rural formal access vs urban | **57% vs 82%** | FinScope TZ 2023 |
| Excluded groups | women, under-25s, dependants, rural: **40–80% excluded** | FinScope TZ 2023 |

FSDT's work on gender barriers to ID acquisition names the mechanisms: distance to registration offices, constrained mobility and household decision-making, **missing birth certificates and family-origin documents** (a prerequisite for registration), time poverty, transport cost.

**This maps precisely onto the demographic the Chama Credit Calibration Analysis identified as our primary customer** — the rural female vendor contributing TZS 30,000 with a five-year perfect record. We removed wealth bias from the chama factor last sprint. A NIDA-gated onboarding would reintroduce the same exclusion one layer earlier, in the enrolment funnel where it is invisible to any fairness audit run on scored users. **You cannot audit bias in people who never got an account.**

### 1.9 Our formalization scoring has the same problem

`tanzania.py` awards `FORMALIZATION_DOCS` points: NIDA 8, TIN 4, BRELA 3 — up to 15 of 100 underwriting points, ~15% of the score. Document possession correlates with being urban, male, formally employed and wealthier. This is a **wealth proxy of exactly the kind the chama calibration removed**, sitting in the same scoring pipeline.

It is not indefensible — formalization genuinely correlates with recoverability and legal enforceability, which are real credit considerations, and unlike the chama factor there is no obvious within-group normalisation. But it is currently **undocumented as a fairness trade-off**, and §7 makes it explicit rather than silently carrying it.

---

## 2. Non-Negotiables

Five rules. Any PR in this sprint that violates one does not merge.

1. **No real identity number enters the repo, the mock data, the docs, the seeds, or a log.** Synthetic values use ward `99999` and check digits `00`.
2. **No plain, unkeyed hash of an identifier, anywhere.** Blind index = KMS-held HMAC (§4.2).
3. **No checksum validation of a NIN.** No public algorithm exists (§1.1).
4. **No hard NIDA gate on participation.** Verification gates *credit*, not *access* (§3).
5. **The raw number never crosses an API boundary outbound** — not to our own frontend, not to admin tooling, not to support. Decryption is a break-glass path with an approval and an audit record.

---

## 3. The Tier Ladder

We mirror BoT Form F rather than inventing a ladder. Aligning to a gazetted schedule is a far better position in front of a regulator than arguing from first principles.

| Tier | Identity evidence | What it unlocks | TZS ceilings (BoT reference) |
|---|---|---|---|
| **0 — Observer** | Phone number, OTP verified | Join a group, record contributions, see own passbook and balances, browse Soko | No value out |
| **1 — Member** | Tier 0 + **any one** of: NIDA, voter's card, employment ID, social security ID, **WEO/VEO letter** | Contributions, withdrawals, group participation, Soko selling | 1,000,000/day, 2,000,000 balance |
| **2 — Verified** | Tier 1 + verified NIDA (registry match, or document + face match), OR WEO/VEO letter + group committee attestation | **Credit eligibility.** Loan application, disbursement | 5,000,000/day, 10,000,000 balance |
| **3 — Business** | Tier 2 + TIN + business licence (BRELA where applicable) | Higher limits, supplier payments, agent participation | 10,000,000 single, 50,000,000/day |

**The load-bearing design choice: Tier 2 has two routes.** The documentary route (NIDA) and the **community-attestation route** (WEO/VEO letter + group committee attestation + tenure). Both reach credit. This is what §1.4 and §1.8 make both lawful and necessary.

**Credit limits are earned by behaviour, not documents.** This is the M-Shwari/KCB pattern: KYC is paid once at the tier gate; the limit comes from group tenure, contribution regularity and repayment history. KCB M-Pesa assigns **a limit of zero to anyone under six months** regardless of documents. Reaching Tier 2 makes you *eligible*; it does not set your ceiling. This keeps §1.9's formalization bias bounded — documents open the door, behaviour sizes the loan.

---

## 4. Data Model and PII Custody

### 4.1 The split

Two stores, different keys, different access paths, different lifecycles.

**Operational store** (`members`, `users`) — what the application queries:

```
national_id           DROPPED (plaintext column removed)
nid_blind_index       bytea, unique, indexed    -- KMS HMAC, for dedup/lookup only
nid_last4             varchar(4)                -- support UX
nid_type              enum(nida|voter|employment|social_security|weo_letter|passport)
nid_pepper_version    smallint
nid_norm_version      smallint
kyc_tier              smallint
kyc_verified_at       timestamptz
kyc_method            enum(registry|document|attestation|agent)
kyc_provider_ref      varchar                   -- vendor/registry reference, not the number
kyc_reverify_after    timestamptz               -- §1.5: NIN validity is not permanent
```

**Sealed AML archive** — separate schema, separate KMS key, write-mostly, no application read path:

```
member_id, nid_ciphertext (AES-256-GCM), dek_id, alg, created_at,
document_images (object storage, separately encrypted),
verification_evidence (jsonb), legal_hold_until (timestamptz)
```

Reads require an authenticated legal-request flow and are logged with actor, reason and ticket reference. The BI/analytics role has **no grant** on this schema — purpose limitation enforced by database privilege, not policy document.

### 4.2 The blind index

```
nid_blind_index = KMS_HMAC_SHA256(pepper_key, normalize(nid) ‖ nid_type ‖ "v1")
```

- **Computed inside KMS** (`GenerateMac` / `MacSign`), so the pepper never enters application memory. An RCE, SSRF or leaked `.env` then yields a rate-limited, audit-logged oracle instead of the key. This is the single largest upgrade over a pepper in an env var.
- **Normalise first, and version the normalisation** — otherwise the same person enrols twice and dedup silently fails.
- **Domain-separate per field.** Never one pepper across NIDA, TIN and phone; that lets an attacker cross-join our own columns.
- **Truncate to 16 bytes.**

**Key rotation is the reason we keep ciphertext.** HMAC is one-way: `HMAC_v2` cannot be derived from `HMAC_v1`. If the pepper leaks and the index is all we hold, there is no re-key path short of asking every user for their number again. With the AES-GCM copy: decrypt → re-HMAC → dual-read on `pepper_version` → swap → destroy old key. Bind `member_id ‖ column ‖ key_version` into the AEAD associated data so ciphertexts cannot be swapped between rows.

**Rejected, with reasons:** per-row salt (breaks dedup); deterministic encryption / AES-SIV (equivalent security, but reversibility is a worse regulatory story than a one-way index); **FPE — FF3 is cryptanalytically broken** for small domains and is the wrong tool regardless, since we control the schema; **Bloom-filter PPRL — repeatedly broken**, most recently in IEEE TIFS 2024 against *hardened* encodings, and we do not need fuzzy matching on a numeric identifier; offshore tokenisation vaults (§1.6 makes them a legal problem, not just a dependency).

**Argon2id as defence-in-depth** is a legitimate option if we cannot get the pepper into an HSM — HMAC is only ~5× slower than raw SHA-256, so if the pepper leaks, HMAC alone buys little. At ~100 ms/hash the DOB-known 10¹² space becomes ~3,000 GPU-years. Cost: ~100 ms and ~64 MB per enrolment and lookup, and a DoS amplifier. **Decide once KMS availability is known.**

### 4.3 Say the honest thing

"We do not store your ID number" is **false** if we hold reversible ciphertext. The claim we can defend is: *"Your ID number is encrypted, no member of staff can read it, and it is used only to prevent duplicate accounts and to meet anti-money-laundering law."* Write that, in Kiswahili, in the privacy notice.

---

## 5. Phases

Each phase has a test command and an acceptance bar. Do not start the next until the current passes.

### Phase 1 — Stop the bleeding (no new capability)

Smallest set that removes present-tense harm.

1. **Fix the format regex.** Accept the card grouping (`8-5-5-2`), the current repo grouping, and unseparated 20 digits. Normalise to bare digits internally; display in `8-5-5-2` because that is what is printed on the card.
2. **Add `normalize_nid()`**: strip whitespace (incl. non-breaking, full-width), hyphens, dashes, dots, slashes, parens, Unicode direction and zero-width marks (WhatsApp paste), leading `+`/`#`. **Map confusables before rejecting** — `O o Ο о`→0, `I l | i`→1, `S`→5, `B`→8, `Z`→2, `G`→6. Log which normalisations fired: a spike in `O→0` is a UX signal; a spike in enumeration-shaped traffic is a security signal.
3. **Date-prefix validation only.** 20 digits; positions 1–8 a real past date; age ≥ 18. No checksum.
4. **Redacting `NationalId` type** whose `__repr__`/`__str__`/`__format__` return `****1234`, with an explicit `.reveal()` that is greppable and CI-auditable. This one change defeats `logger.info(f"{member}")`, exception reprs, dataclass reprs and JSON model dumps at once.
5. **Telemetry lockdown**, same PR: `include_local_variables=False` in the Sentry SDK (**it captures stack-frame locals by default — any exception below the parser ships the raw number**); `send_default_pii=False`; a `before_send` scrubbing `request.data`, query strings, headers, breadcrumbs and frame vars; Postgres `log_parameter_max_length=0` and `log_parameter_max_length_on_error=0`; ORM echo off outside local; **never put an ID in a URL path or query string** — it lands in access logs, browser history and `Referer`.

**Test:**
```bash
pytest backend/tests/test_nid_validation.py -v     # incl. card-grouping acceptance
pytest backend/tests/test_pii_redaction.py -v      # sentinel must not appear in log/Sentry payloads
npx tsc --noEmit -p tsconfig.app.json              # 0 errors
```
**Acceptance:** the card grouping validates; a sentinel ID appears in no log line, Sentry payload or DB statement log; `grep -rn "\.reveal()"` returns only annotated call sites.

---

### Phase 2 — Tier ladder and the non-NIDA path

6. `kyc_tier`, `kyc_method`, `kyc_reverify_after` on `Member`/`User`; `LOAN_TIERS`-style `KYC_TIERS` in the country pack with Form F ceilings.
7. **Tier enforcement middleware** — a decorator on endpoints declaring the minimum tier, returning a structured "what you need to unlock this" payload rather than a bare 403.
8. **WEO/VEO attestation model**: issuing officer name, office, ward/village, date, document image, plus a **committee attestation** from the group (≥2 officers, recorded against their own verified identities).
9. **Write the referee policy** — the Liberia model is the cleanest documented form: a written, filed policy naming who may vouch and how the referee is themselves identified. This is a document, not code, and it is what makes route 2 defensible to BoT.
10. **Underwriting change:** replace the `not member.national_id` hard reject with a **Tier 2 check**. A member verified by attestation passes. Update `docs/UNDERWRITING_ENGINE.md` §3.

**Test:**
```bash
pytest backend/tests/test_kyc_tiers.py -v
pytest backend/tests/test_underwriting.py -v       # attestation-verified member is not auto-rejected
python backend/seed_demo.py                        # add an attestation-route borrower
```
**Acceptance:** a member with no NIDA but a complete attestation bundle reaches Tier 2 and receives a real underwriting decision. A Tier 0 user can join a group and record a contribution.

---

### Phase 3 — PII custody

11. KMS abstraction (`GenerateMac`, envelope encrypt/decrypt) with a **local dev fake** that is loudly non-production.
12. Blind index + sealed archive per §4. Alembic migration: backfill index and ciphertext, then **drop the plaintext column**.
13. **Break-glass read path**: approval, reason, ticket reference, immutable audit record.
14. **Rotation runbook**, exercised once in staging before the phase closes. An untested rotation path is not a rotation path.

**Test:**
```bash
alembic upgrade head && pytest backend/tests/test_pii_custody.py -v
python backend/scripts/verify_no_plaintext_nid.py   # byte-scan DB + backups, mirroring §9 checks
python backend/scripts/rotate_pepper.py --dry-run
```
**Acceptance:** no plaintext identifier in any table or backup; dedup still works; a rotation dry-run completes; every archive read is logged.

---

### Phase 4 — Enrolment UX

15. **Single text input**, not segments — GOV.UK's NI-number and UTR patterns both specify one field; split fields break paste, backspace-across-boundary and screen readers. `inputmode="numeric"`, **never `type="number"`** (Chrome silently discards typed letters; NVDA reports it unlabelled; the scroll wheel changes the value).
16. **Auto-format as they type** into `8-5-5-2`, with a **live digit counter (`12 / 20`)** — Baymard found **89% of subjects entered data in a format different from the on-screen example even when they had noticed it**, which is the decisive argument for auto-formatting over hint text. A numeral is legible to someone who cannot read the sentence.
17. **Swahili-first**, icon + pre-recorded audio on every screen (human speech, not TTS — trust matters at this literacy level). Flat navigation, one decision per screen: low-literate users have a documented **diminished capacity to navigate hierarchical interfaces**, which rules out a nested KYC wizard.
18. **Error messages that say what to do**, never "invalid": *"Namba ya NIDA ina tarakimu 20. Umeandika 18."* Distinguish wrong-length from bad-date-prefix. Inline at the field, not only in a summary the user has scrolled past.
19. **Deferred KYC**: Tier 0 is usable immediately. Verification is requested at the point value crosses out, not at signup — mirroring the Tier-1-by-default ladder Tanzanian users already know from mobile money.

**Acceptance:** a user can complete enrolment with audio only; the card grouping pastes and validates; nothing about the flow requires reading English.

---

### Phase 5 — Anti-abuse and fraud graph

20. **Rate limiting per §1.2's oracle problem**: 3 free attempts per (phone, 24h); exponential backoff 4–8, keyed to **both** session and source IP/ASN; hard stop at ~8–10 → human review, never a dead end. **Uniform, constant-time responses** for match / no-match / throttled. **Never echo a name from a registry before the user proves possession** via OTP to the number on file. Never distinguish "doesn't exist" from "doesn't match you". Global per-IP/ASN/device caps independent of per-user limits, since per-user limits are trivially bypassed by rotating phone numbers. **No image CAPTCHAs** — hostile to this user base.
21. **Graph signals, which is where the fraud actually is.** In the best-studied comparable market, **~70% of joint-liability groups were "bogus"** — every member a real, verifiable person, but one person controlling all the loans. **Duplicate-ID detection catches none of it.** Detect instead: repayment always from one MSISDN; disbursement immediately forwarded to one wallet; one device fingerprint across "unrelated" members; one recovery number for many members.
22. **Member-visible immutable ledger.** The dominant loss vector in savings-group finance is the *record*, not the *identity* — KUSCCO in Kenya was **KSh 13.3bn** through fictitious loans created by manipulating records over nine years. Independent member-side balance confirmation is a higher-value control than harder KYC.

**Acceptance:** verification endpoint gives no differential signal under a timing harness; the graph rules fire on a seeded bogus-group fixture.

---

### Phase 6 — Data-subject rights and retention

23. **DSAR export** — Kenya's access SLA is **7 days**, which will break any manual process. Build self-serve.
24. **Tier A / Tier B erasure**: purge product/analytics data, retain the AML archive, log the decision and its statutory basis, and respond explaining the split.
25. **Retention expiry job** — 10 years TZ / 7 years Kenya from *relationship end or last transaction*, not enrolment. Crypto-shredding (destroy the row DEK) is the clean implementation. **Build this now**: GN 449C requires that we test that deleted data is unrecoverable, and an un-run cron job is itself an audit finding.
26. **Consent records** — version, timestamp, exact text shown, UI context, withdrawal events. Append-only. Not a boolean. TZ requires **explicit written consent for sensitive data**, and s.3 names *financial transactions* as sensitive — which is our entire product.

**Acceptance:** DSAR export in one request under the 7-day SLA; an erasure request leaves the AML archive intact with a logged basis; the expiry job is proven on a back-dated fixture.

---

## 6. What We Are Deliberately Not Doing

- **No NIDA CIG integration this sprint.** Access is MoU-gated with no self-service path, no public sandbox, no published pricing, and a government procurement cycle measured in months (§8). Design the interface behind a port so it can be dropped in.
- **No liveness/PAD vendor.** §8 explains why the choice is genuinely hard and should not be rushed.
- **No biometric capture.** AML reg. 3(1) asks for a thumbprint, which would make us a processor of biometric data — sensitive under PDPA s.3, requiring explicit written consent and triggering an independent mandatory DPIA. Defer until the DPIA is filed.
- **No Kenya launch.** Design the country pack so Kenya slots in; don't build it.

---

## 7. The Formalization-Bias Trade-off, Stated

Per §1.9, `FORMALIZATION_DOCS` awards up to 15/100 underwriting points for documents that correlate with being urban, male and wealthier.

**We keep it, with three mitigations, and we write down why:**

1. **Documents no longer gate access** — only Tier 2 eligibility, reachable by attestation (§3).
2. **Behaviour sizes the loan**, documents only open the door (§3).
3. **The bias is disclosed** in `UNDERWRITING_ENGINE.md` and monitored: track approval rate and mean score by verification route (`registry` vs `attestation`). If the attestation cohort underperforms on approval *without* underperforming on repayment, the formalization weight is doing wealth-proxy work rather than credit work, and it should be cut.

That third point is the falsifiable test. Without it this is an assertion; with it, it is a hypothesis with a tripwire.

---

## 8. Blocked on External Input

These cannot be resolved in code and are the sprint's critical path.

| Item | Why it blocks | Action |
|---|---|---|
| **PDPC registration** | `GN 449C reg. 3` prohibits processing while unregistered; enforcement live since 9 Apr 2026 | Form No. 1 via RCMIS; ~TZS 100,000 small band; 5-year certificate. **Do this first — it is cheap and it gates everything.** |
| **DPO appointment** | PDPA s.27(3) — **no thresholds, no exemptions** | Name one, including to the regulator. Part-time/outsourced is fine at this stage. |
| **Cross-border permit** | Any data leaving TZ; **fee and timeline unpublished** — the only unknown that can move a launch date | Contact PDPC directly. Decide domestic-vs-offshore hosting on the answer. |
| **DPIA** | GN 449C reg. 33 makes it mandatory — we trigger *every* listed criterion. Kenya requires filing **60 days before processing** | Use the **Fifth Schedule template**, not a GDPR one. Longest-lead item for Kenya. |
| **NIDA CIG access** | The only route to an authoritative NIN match | Open the MoU conversation now; get the fee schedule in writing. Cite SIM registration as precedent: an existing private-sector, real-time, national-scale NIDA integration. |
| **Referee policy sign-off** | Makes the attestation route defensible | Draft on the Liberia model; put it to BoT before building on it. |
| **Counsel: two questions** | Determines what we may store at all | (a) Is there a statutory offence for a private party retaining or disclosing a NIN? (b) Does the **NIDA CIG stakeholder contract** restrict what we may store of the returned payload? Contract terms, not just the PDPA, may govern. |

### Vendor reality

No global KYC vendor exposes a NIDA registry lookup. Entrust/Onfido lists Tanzania for applicant creation but **absent from database coverage** (Africa: EG, GH, KE, NG, ZA, ZW only). Didit states plainly that no public NIDA consumer API exists for third-party integrators.

**And our liveness vendor probably cannot be our ID vendor.** Smile ID, Dojah, Prembly and Youverify — the Africa specialists covering Tanzanian documents — are **absent from iBeta's PAD register**. The L2-certified globals (Onfido, Veriff, Jumio, Shufti) do not cover Tanzanian databases and start at **minSdk 24–26**.

**That last number decides it.** TCRA Q4 2025: **smartphone penetration 41.8%** against **87.1% feature-phone**. Only **Smile ID and Onfido reach API 21**. ML Kit's Document Scanner **hard-fails below 1.7 GB RAM**, so an Android Go device cannot run it — a plain-camera path with our own edge detection is mandatory, not a nicety. Target ~600 KB–1 MB per verification, 1200–1920 px crops at q≈80, resumable upload in 128–256 KB chunks (**not S3 multipart** — its 5 MiB minimum part means a sub-1 MB payload never chunks and a dropped connection restarts everything), idempotency keys minted **at capture time** and persisted with the queued job, webhook-primary with polling reconcile — **never make the phone the webhook target**, it usually isn't reachable when the decision lands.

Data cost is not the constraint: TZS pricing is ~$0.84/GB, so a 1 MB payload costs the user ~$0.0008. **Optimise for first-attempt capture success, not bytes.**

---

## 9. Definition of Done

- [ ] No plaintext identifier in any table, backup, log, Sentry payload or trace — proven by byte-scan, not assertion
- [ ] Card-grouping (`8-5-5-2`) input validates; no checksum is implemented
- [ ] A member with **no NIDA** can reach Tier 2 by attestation and receive a real underwriting decision
- [ ] A Tier 0 user can join a group and record contributions
- [ ] Blind index dedups correctly; rotation dry-run passes; break-glass reads are logged
- [ ] Enrolment completable in Swahili with audio only
- [ ] Verification endpoint gives no differential signal (timing harness); retry exhaustion routes to human review, never a dead end
- [ ] DSAR export inside 7 days; erasure preserves the AML archive with a logged basis; expiry job proven on a back-dated fixture
- [ ] `tsc --noEmit` 0 errors; build passes; backend tests green
- [ ] `UNDERWRITING_ENGINE.md` §3 updated; formalization trade-off (§7) documented with its tripwire
- [ ] PDPC registration certificate obtained; DPO named; DPIA drafted on the Fifth Schedule template

---

## 10. Sources

**Tanzania — identity and payments**
- BoT Payment Systems (Electronic Money) Regulations 2015, GN 447, Third Schedule Form F — https://www.bot.go.tz/Publications/NPS/GN-THE%20ELECTRONIC%20MONEY%20REGULATIONS%202015.pdf
- Vodacom TZ published tier limits — https://vodacom.co.tz/uploads/Customer_Transaction_Limits_Tier_Limits_Internet_website_English_edb76164fb.pdf
- NIDA — https://nida.go.tz/ · https://services.nida.go.tz/
- ID4Africa 2023, NIDA (Rumatila Temba) — https://id4africa.com/wp-content/uploads/2023/06/PS2-S3-1-Rumatila-Temba-Tanzania.pdf
- ID4Africa 2018, NIDA (Malibiche) — https://www.id4africa.com/2018_event/Presentations/PS2/1-2-2_Tanzania_Alphonce_Malibiche.pdf
- NBC Kikundi group account requirements — https://www.nbc.co.tz/en/personal/bank/kikundi-account/
- Microfinance (Community Microfinance Groups) Regulations 2019, GN 678 — https://tanzlii.org/en/akn/tz/act/gn/2019/678/eng@2019-09-13
- AML Regulations GN 289/2012 — https://www.bot.go.tz/Publications/Acts,%20Regulations,%20Circulars,%20Guidelines/Regulations/sw/2020031802372796.pdf
- TRA taxpayer portal guide (TIN format) — https://www.tra.go.tz/images/uploads/acts/HOW_TO_REGISTER_GET_AN_ACCOUNT_AS_WELL_AS_UPDATING_TIN_INFORMATION_IN_TAXPAYERS_PORTAL.pdf
- BRELA ORS public search — https://ors.brela.go.tz/orsreg/searchbusinesspublic

**Data protection**
- TZ PDPA 2022 (Cap. 44) — https://www.pdpc.go.tz/media/media/THE_PERSONAL_DATA_PROTECTION_ACT.pdf
- GN 449C of 2023 — https://www.mawasiliano.go.tz/uploads/documents/sw-1691159153-GN%20NO.%20449C%20OF%202023.pdf
- PDPC registration · cross-border permit — https://www.pdpc.go.tz/en/registration-data-controller-processor/ · https://pdpc.go.tz/services/cross-border-data-transfer-permit/
- Kenya DPA 2019 — https://new.kenyalaw.org/akn/ke/act/2019/24/eng@2022-12-31
- Kenya DP (General) Regulations 2021, LN 263 — https://new.kenyalaw.org/akn/ke/act/ln/2021/263/eng@2022-12-31
- CBK Digital Credit Providers Regulations 2022, LN 46 — https://www.centralbank.go.ke/wp-content/uploads/2022/03/L-.N.-No.-46-Central-Bank-of-Kenya-Digital-Credit-Providers-Regulations-2022.pdf
- ODPC Guidance Note for Digital Credit Providers — https://www.odpc.go.ke/wp-content/uploads/2024/02/ODPC-Guidance-Note-for-Digital-Credit-Providers.pdf

**Cryptography and PII**
- AEPD/EDPS, hash functions as a pseudonymisation technique — https://edps.europa.eu/data-protection/our-work/publications/papers/introduction-hash-function-personal-data_en
- hashcat v6.2.6 RTX 4090 benchmarks — https://gist.github.com/Chick3nman/32e662a5bb63bc4f51b847bb422222fd
- NIST, cryptanalysis of FF3 — https://csrc.nist.gov/News/2017/Recent-Cryptanalysis-of-FF3
- CipherSweet blind-index internals and threat model — https://ciphersweet.paragonie.com/internals/blind-index · https://ciphersweet.paragonie.com/security
- OWASP Cryptographic Storage / Password Storage cheat sheets
- NIST SP 800-63A-4 — https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63A-4.pdf
- Sentry, scrubbing sensitive data — https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/

**Inclusion, tiering, fraud**
- FATF, Feb 2025 update to R.1/INR.10 promoting inclusion — https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-standards-promote-financial-conclusion-feb-2025.html
- FATF Digital Identity Guidance 2020 — https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/Guidance-on-Digital-Identity.pdf
- GSMA, Overcoming the KYC hurdle (2019)
- FinScope Tanzania 2023 — https://www.fsdt.or.tz/wp-content/uploads/2023/07/FinScope-Tanzania-2023-Full-Report-Insights-that-Drive-Innovation.pdf
- FSDT, gender barriers in ID acquisition — https://www.fsdt.or.tz/2021/05/17/addressing-gender-barriers-in-the-id-acquisition-process-in-tanzania/
- CBN 3-Tier KYC circular 2013 — https://www.cbn.gov.ng/Out/2013/CCD/3%20TIERED%20KYC%20REQUIREMENTS.PDF
- CGAP on M-Shwari — https://www.cgap.org/blog/top-10-things-to-know-about-m-shwari
- CGAP/FSD, A Digital Credit Revolution (2018) — https://www.cgap.org/sites/default/files/publications/Working-Paper-A-Digital-Credit-Revolution-Oct-2018.pdf
- Luhanga et al., third-party SIM cards in KE/TZ — https://arxiv.org/abs/2311.00830
- Bogus joint-liability groups (CFPA, *J. Comparative Economics*) — http://thred.devecon.org/papers/2016/2016-015.pdf
- The Citizen, SIM registration agent fraud (2026) — https://www.thecitizen.co.tz/tanzania/news/national/dishonest-sim-registration-agents-are-fueling-tanzania-s-phone-fraud-networks-5525316

**UX**
- GOV.UK NI number pattern — https://design-system.service.gov.uk/patterns/national-insurance-numbers/
- GDS, why we changed the input type for numbers — https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/
- Baymard, input masking — https://baymard.com/blog/input-masking-form-field
- Medhi Thies, UI design for low-literate users — https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf
- ML Kit document scanner (1.7 GB RAM floor) — https://developers.google.com/ml-kit/vision/doc-scanner/android
- iBeta PAD certification register — https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/

---

## 11. Confidence and Open Questions

**High confidence:** BoT Form F tier structure and its acceptance of a WEO/VEO letter; AML GN 289 reg. 30's 10-year retention; PDPA/GN 449C registration, DPO and DPIA duties; Kenya s.35 automated-decision duties and the 7-day access SLA; the cryptographic analysis; the absence of a public NIN checksum; the vendor coverage and minSdk constraints.

**Medium — verify before quoting externally:** exact NIN internal structure (the `YYYYMMDD-NNNNN-NNNNN-NN` layout is well-attested but has no primary citation); TZ penalty figures (the TZS 100M administrative cap and the TZS 5bn corporate disclosure ceiling come from different sources and did not reconcile against the statute); current BoT tier ceilings (the 2015 schedule has been amended by circulars we could not locate; Vodacom's published table exceeds it); NIN coverage percentage (issued / carded / collected / SIM-registered are four different numbers).

**Genuinely unresolved — do not assert:**
- **Fee and timeline for the TZ cross-border permit.** Unpublished. Pilot-blocking.
- **Whether GN 449C reg. 20 requires a per-transfer permit or allows a standing authorisation.** Reg. 20(2)'s "particulars of the data subject" and "date and time of sending" read as per-instance. Get PDPC's written position before architecting around any foreign vendor.
- **How TZ reconciles "financial data is sensitive → explicit written consent" with a 10-year AML retention duty.** No guidance, no case law.
- **How granular Kenya's right to explanation must be.** No determination or judgment found. Build to the stricter per-decision reading.
- **Whether a group-savings platform escapes Tier-2 microfinance licensing.** Fact-specific; "we only provide software" is a position regulators test.

*This document is engineering planning, not legal advice. Every item in §8 should be confirmed by Tanzanian counsel before the pilot.*
