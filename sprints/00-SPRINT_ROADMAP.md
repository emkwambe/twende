# TWENDE Sprint Roadmap

**Status of this document:** rewritten to match the repository as built.
**Last verified against the code:** September 2026

The previous version was written before implementation began and drifted badly — it listed twelve sprints when there are sixteen, indexed several documents under filenames that do not exist, described a Node.js/Express backend that was never built, and still read *"Status: Sprint 1 Ready for Implementation"* after five sprints had shipped. Anyone using it as a map was being misled. Statuses below were verified by reading the code and the commit history, not by trusting the specs.

---

## How to read this

**Sprint numbers are identifiers, not a schedule.** They record the order specs were written. Several were overtaken by reality, and two are now superseded outright. **Execution order lives in §3**, and it does not follow the numbering.

Three statuses are used, and the distinction matters:

- **Shipped** — implemented, in `main`, with a commit reference.
- **Frontend only** — the UI exists and runs on `mockData.ts`; there is no backend behind it.
- **Superseded** — the spec describes a system that was not built and should not now be built. Kept for history; do not implement.

---

## 1. What is actually built

| # | Sprint | Status | Evidence |
|---|---|---|---|
| 01 | Authentication & Onboarding | **Shipped** | 6 auth endpoints, JWT + refresh rotation, OTP, RBAC, KYC tier field |
| 02 | Backend API Foundation | **Superseded** | Specced Node.js/Express + PostgreSQL. Built as **FastAPI + SQLAlchemy + Alembic + SQLite**. See §4 |
| 03 | Frontend-API Integration | **Partial** | Golden Path wired Trust Score, loans and passbook. Kazi, Linda, Soko still on `mockData.ts` |
| 04 | M-Pesa Integration | **Not started** | No Daraja/STK code anywhere in the repo |
| 05 | Credit Scoring Engine | **Shipped** | `308d4c6` — Trust Engine, 7 factors, 5 components. Recalibrated in `c249a61` |
| 06 | Cross-Product Event Bus | **Not started** | No Kafka code. Cross-pillar flow is direct, not evented |
| 07 | Biashara v2 | **Shipped** | `a639c72` — reducing-balance calculator, business dashboard, 9 components |
| 08 | Kazi v2 | **Frontend only** | 7 components; no backend |
| 09 | Linda v2 | **Not started** | Page only; no components, no backend |
| 10 | Soko v2 | **Shipped** | `e9e539c` — marketplace, 13 components, WhatsApp selling, flash sales |
| 11 | Regional Expansion (UG/ET/RW) | **Superseded** | Written when Kenya was the base market. See §4 |
| 12 | Analytics & Intelligence | **Not started** | — |
| 13 | Group Formalization Toolkit | **Shipped** | `d7a7f7e` backend, `89840ed` frontend. Segmentation correction applied |
| — | **Golden Path** | **Shipped** | `d2ddc68` — live API for Trust Score, eligibility, applications, repayment, passbook. Spec: `CLAUDE_PROMPT_GOLDEN_PATH.md` (unnumbered) |
| 14 | Financial Records + Country Packs | **Shipped** | `2befdf8`, completed by `a756be8` |
| 15 | Identity & KYC | **Planned** | `15-SPRINT_IDENTITY_KYC.md` |
| 16 | Multi-Country Readiness | **Planned** | `16-SPRINT_MULTI_COUNTRY.md` |

**Highest implemented sprint: 14.** The largest body of work since then — the Golden Path — carries no number.

---

## 2. What the platform actually is

Stated plainly, because three sprint specs still describe something else:

| Layer | Built |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind 4, React Router 7 (HashRouter), TanStack Query, Recharts |
| Backend | **FastAPI + SQLAlchemy + Alembic**, JWT + RBAC, **SQLite** (`twende.db`) |
| Scoring | Two engines — frontend Trust Engine (7 factors, 300–850) and backend underwriting (5 factors, 0–100). See `docs/UNDERWRITING_ENGINE.md` |
| Market | **Tanzania-first.** TZS throughout, VICOBA/Upatu vocabulary, NIDA/TIN/BRELA |
| Payments | **None.** No mobile-money integration exists |
| Events | **None.** No message bus |

---

## 3. Execution order

This is the schedule. It does not follow the numbering.

| Order | Work | Why here | Blocked by |
|---|---|---|---|
| **1** | **Currency denomination** (Sprint 16, Phase 0) | A correctness bug, not a feature. Thirteen money columns carry no currency. Cheap now; a data-repair exercise once the pilot writes transactions | Nothing |
| **2** | **PDPC registration + DPO** | Processing personal data without registration is prohibited; enforcement live since 9 Apr 2026. ~TZS 100,000 | Nothing — do it in parallel with 1 |
| **3** | **Sprint 15 Phase 1** (regex, redaction, telemetry) | Removes present-tense harm; needs no external input | Nothing |
| **4** | **Sprint 15 Phases 2–6** (tiers, custody, UX, DSAR) | Identity is the gate on real-money disbursement | Phase 1; KMS availability |
| **5** | **Sprint 16 Phases 1–3** (pack contract, runtime resolution, Kenya) | KYC produces the reference implementation that defines the contract | Sprint 15 |
| **6** | Sprint 04 — M-Pesa | Real money movement | 15 (KYC gates disbursement) |
| **7** | Sprint 03 remainder — Kazi/Linda/Soko integration | Removes the last mock data | 02-equivalent work is done |
| **8** | Sprint 16 Phase 4 — Uganda, Rwanda | Genuinely additive once the contract holds | 16 Phases 1–3, plus per-market legal |

**Long-lead items that gate the pilot** and should start now regardless of engineering order: the Tanzania cross-border transfer permit (unpublished timeline), the Kenya DPIA (**must be filed 60 days before processing**), and NIDA CIG stakeholder access (government MoU cycle). See `docs/ENGINEERING_FINDINGS.md` § compliance calendar.

---

## 4. Superseded specs — do not implement

**Sprint 02 — Backend API Foundation.** Specifies PostgreSQL 15, Node.js 20 + Express 4, `node-pg-migrate`. The backend was built as FastAPI + SQLAlchemy + Alembic on SQLite. The spec's *requirements* remain useful reading; its *stack decisions* are void. Migrating to PostgreSQL is a real future task, but it is not this document.

**Sprint 11 — Regional Expansion (UG/ET/RW).** Written when Kenya was the base market and Tanzania was an expansion target. **That assumption has inverted** — Tanzania is now the primary market and the only implemented country pack. The spec also targets Ethiopia, which is no longer in scope. Superseded by **Sprint 16**, which starts from Tanzania and treats Kenya as the second market.

**Sprint 03 — Frontend-API Integration.** Not superseded, but partially overtaken. The Golden Path implemented a scoped slice; the remainder (Kazi, Linda, Soko) still stands.

---

## 5. Known gaps not covered by any sprint

Recorded so they are not mistaken for done. Detail in `docs/ENGINEERING_FINDINGS.md`.

- **No join-a-group flow.** A newly registered user has no membership, so eligibility correctly 404s and they cannot borrow. Register → apply does not complete for a new account.
- **The two scoring engines are not composed.** Underwriting reads no Trust Score; a Tier 4 and a Tier 1 borrower are underwritten identically.
- **The chama recalibration has no backend counterpart.** The weights live only in `src/trust/algorithm.ts`.
- **Bundle is a single ~1 MB chunk** with no code splitting — material on the low-end devices this product targets.
- **SQLite in the production path.** Fine for the pilot; not for concurrent writes at scale.

---

## 6. Document index

Verified filenames.

| File | Contents | Status |
|---|---|---|
| `00-SPRINT_ROADMAP.md` | This file | Current |
| `01-SPRINT_AUTH.md` | Auth, KYC, onboarding | Shipped |
| `02-SPRINT_BACKEND.md` | Node/Express + PostgreSQL API | **Superseded** |
| `03-SPRINT_INTEGRATION.md` | React Query, replace mock data | Partial |
| `04-SPRINT_MPESA.md` | Daraja, STK Push, B2C, C2B | Not started |
| `05-SPRINT_CREDIT_SCORE.md` | Trust Engine, tiers | Shipped |
| `06-SPRINT_EVENT_BUS.md` | Kafka, cross-product events | Not started |
| `07-SPRINT_BIASHARA_V2.md` | Merchant tools, reducing balance | Shipped |
| `08-SPRINT_KAZI_V2.md` | Gig marketplace | Frontend only |
| `09-SPRINT_LINDA_V2.md` | Insurance, claims | Not started |
| `10-SPRINT_SOKO_V2.md` | Marketplace, WhatsApp selling | Shipped |
| `11-SPRINT_REGIONAL.md` | Expansion UG/ET/RW | **Superseded by 16** |
| `12-SPRINT_ANALYTICS.md` | Dashboards, ML | Not started |
| `13-SPRINT_CHAMA_SEGMENTATION.md` | Group formalization | Shipped |
| `Required Correction to Sprint 13.md` | Removes `primary_segment` as a chama-defining field | **Applied** |
| `CLAUDE_PROMPT_GOLDEN_PATH.md` | End-to-end API integration | Shipped, unnumbered |
| `15-SPRINT_IDENTITY_KYC.md` | Tiered KYC, PII custody, inclusion | Planned |
| `16-SPRINT_MULTI_COUNTRY.md` | Currency integrity, pack contract, Kenya | Planned |

**Related, outside `sprints/`:** `docs/ENGINEERING_FINDINGS.md` (findings and decisions, with status), `docs/UNDERWRITING_ENGINE.md` (the engine that actually decides loans), `docs/CHAMA_CREDIT_CALIBRATION_ANALYSIS.md` (why scoring is behaviour-normalized), `docs/TRUST_ENGINE_WHITEPAPER.md`, `docs/TWENDE_PLATFORM_BLUEPRINT.md`.

---

## 7. Keeping this honest

This document drifted because nothing forced it to track reality. Two cheap habits prevent a repeat:

1. **A sprint is not done until its row here says so, with a commit reference.**
2. **When a spec is overtaken, mark it superseded in the same commit** that overtakes it. A spec that quietly describes a system nobody built is worse than no spec — someone will eventually implement it.
