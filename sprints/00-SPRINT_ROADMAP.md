# TWENDE Sprint Roadmap

**Version:** 1.0  
**Date:** July 2026  
**Owner:** Engineering Team  
**Status:** Sprint 1 Ready for Implementation

---

## Philosophy

This roadmap is designed for **incremental delivery** — each sprint produces a working, deployable increment. No sprint depends on future sprints to be functional. Each sprint builds on previous sprints but can stand alone.

The guiding principle: **"Ship working software every sprint."** Not perfect software. Working software.

---

## Sprint Overview

| Sprint | Name | Goal | Duration | Dependencies | Business Value |
|---|---|---|---|---|---|
| 1 | Authentication & Onboarding | Users can register, verify, and access the platform | 1 week | None | Foundation — no users = no product |
| 2 | Backend API Foundation | Real database, real APIs, real data persistence | 1.5 weeks | Sprint 1 | Data persistence enables everything else |
| 3 | Frontend-API Integration | Replace all mock data with real API calls | 1 week | Sprint 2 | Users see their real data, not demos |
| 4 | M-Pesa Payment Integration | Real money movement through Daraja | 1.5 weeks | Sprint 3 | Revenue begins — transaction fees |
| 5 | Credit Scoring Engine v1 | Alternative credit scores from real data | 1 week | Sprint 4 | Core moat — unlocks lending |
| 6 | Cross-Product Event Bus | Kafka events wire all products together | 1 week | Sprint 5 | The flywheel effect |
| 7 | Merchant Super-App v2 | Full Biashara merchant tools | 1 week | Sprint 6 | Revenue from SaaS + loans |
| 8 | Gig Worker Platform SDK | White-label Kazi for gig platforms | 1 week | Sprint 6 | Partnership revenue |
| 9 | Insurance AI Adjudication | Automated claims processing | 1 week | Sprint 6 | Margin improvement |
| 10 | Soko Commerce v2 | WhatsApp bot, delivery, bulk orders | 1.5 weeks | Sprint 8 + 9 | Commerce revenue |
| 11 | Regional Expansion | Tanzania, Uganda, Rwanda | 2 weeks | Sprint 10 | 4x addressable market |
| 12 | Analytics & Intelligence | Business dashboards, ML models | 1.5 weeks | Sprint 11 | Operational excellence |

**Total Timeline:** ~14 weeks (3.5 months) to full platform

---

## Critical Path

```
Sprint 1 (Auth) → Sprint 2 (Backend) → Sprint 3 (Integration) → Sprint 4 (M-Pesa)
                                                          ↓
                                              Sprint 5 (Credit Scoring)
                                                          ↓
                                              Sprint 6 (Event Bus)
                                                          ↓
                                    Sprint 7 ─┬─ Sprint 8 ─┴─ Sprint 9 ─┬─ Sprint 10
                                              ↓                          ↓
                                    Sprint 11 (Regional Expansion)
                                                          ↓
                                    Sprint 12 (Analytics)
```

**Sprints 1–6 are the critical path.** Everything after Sprint 6 can be parallelized based on business priorities.

---

## Resource Allocation

| Sprint | Frontend Focus | Backend Focus | DevOps Focus |
|---|---|---|---|
| 1 | 80% | 10% | 10% |
| 2 | 20% | 70% | 10% |
| 3 | 70% | 20% | 10% |
| 4 | 30% | 60% | 10% |
| 5 | 10% | 80% | 10% |
| 6 | 20% | 70% | 10% |
| 7–12 | Varies by sprint | Varies by sprint | 10% |

---

## Definition of Done (All Sprints)

Every sprint is complete only when ALL of the following are true:

1. **Build passes:** `npm run build` succeeds with zero TypeScript errors
2. **Code committed:** All changes committed with professional commit messages
3. **Code pushed:** Changes pushed to `origin main`
4. **Deployed:** Live on Vercel (preview or production)
5. **Tested:** User can complete the primary flow end-to-end
6. **Documented:** Any new APIs, components, or data structures documented in code comments
7. **No regressions:** Previous sprints' functionality still works

---

## Guardrails (Apply to Every Sprint)

### Technical Guardrails

| Rule | Rationale | Enforcement |
|---|---|---|
| **Never use `any` type** | Type safety prevents runtime errors | TypeScript strict mode + build fails |
| **Never import unused dependencies** | Build fails, bundle bloat | `tsc` + lint checks |
| **Never commit secrets** | Security breach risk | `.env` in `.gitignore`, pre-commit hooks |
| **Never skip `npm run build` before committing** | Catches errors early | Build discipline |
| **Never modify design system tokens without PRD approval** | UI consistency | PRD review gate |
| **Never use `console.log` in production** | Performance + security | Lint rule + code review |
| **Always handle API errors** | UX resilience | Error boundaries + toast notifications |
| **Always show loading states** | Perceived performance | Skeleton screens + spinners |
| **Always validate user input** | Data integrity + security | Zod schemas on frontend + backend |

### Product Guardrails

| Rule | Rationale | Enforcement |
|---|---|---|
| **Every feature must have a business justification** | Prevents scope creep | Sprint planning gate |
| **Every UI change must be accessible** | Inclusive design | WCAG 2.1 AA compliance |
| **Every payment flow must be reversible** | Consumer protection | Refund/cancel mechanisms |
| **Every user action must be auditable** | Regulatory compliance | Event logging + blockchain anchoring |
| **Never store M-Pesa PINs** | Security | Daraja handles PIN entry |
| **Always encrypt PII at rest** | Data protection law | AES-256 field-level encryption |

### Deployment Guardrails

| Rule | Rationale | Enforcement |
|---|---|---|
| **Never deploy broken builds** | Production stability | Build gate in CI/CD |
| **Always deploy to preview first** | Catch issues early | Vercel preview deployments |
| **Never force-push to main** | Team safety | Branch protection rules |
| **Always tag releases** | Traceability | Git tags for each sprint |

---

## Sprint Selection Guide

### If You Have 1 Week
Execute **Sprint 1 only.** Users can register, verify, and see a personalized dashboard. This is demo-ready for investors.

### If You Have 2 Weeks
Execute **Sprints 1–2.** Users register, data persists in PostgreSQL, APIs serve real data. This is MVP-ready for early adopters.

### If You Have 4 Weeks
Execute **Sprints 1–4.** Full auth, real database, real APIs, real M-Pesa payments. This is revenue-ready — transaction fees begin.

### If You Have 8 Weeks
Execute **Sprints 1–7.** Full platform with credit scoring, merchant tools, and cross-product data flow. This is Series A-ready.

### If You Have 14 Weeks
Execute **all sprints.** Full 5-pillar platform, regional expansion, analytics. This is the complete vision.

---

## How to Use This Roadmap with Kimi Code

1. **Pick a sprint** based on your timeline and priorities
2. **Read the sprint document** in `sprints/` folder
3. **Copy the Kimi Code prompt** at the end of the sprint document
4. **Paste into terminal:** `kimi "[prompt here]"`
5. **Execute the PowerShell commands** Kimi Code generates
6. **Verify:** Run `npm run build`, test the feature, deploy
7. **Move to next sprint**

---

## Document Index

| Document | Contents |
|---|---|
| `00-SPRINT_ROADMAP.md` | This file — overview, timeline, guardrails, selection guide |
| `01-SPRINT_AUTH.md` | Authentication, KYC, onboarding, auth context, protected routes |
| `02-SPRINT_BACKEND.md` | Node.js/Express API, PostgreSQL schema, REST endpoints, seed data |
| `03-SPRINT_INTEGRATION.md` | React Query, API service modules, replace mock data, error handling |
| `04-SPRINT_MPESA.md` | M-Pesa Daraja integration, STK Push, B2C, C2B, webhooks |
| `05-SPRINT_CREDIT.md` | Credit scoring engine, score calculation, tier unlocks |
| `06-SPRINT_EVENTS.md` | Kafka event bus, cross-product communication, event consumers |
| `07-SPRINT_MERCHANT.md` | Biashara merchant super-app, inventory, POS, analytics |
| `08-SPRINT_GIG.md` | Kazi SDK, platform partnerships, AutoSave, per-ride insurance |
| `09-SPRINT_INSURANCE.md` | Linda AI claims adjudication, policy management, payouts |
| `10-SPRINT_COMMERCE.md` | Soko WhatsApp bot, delivery integration, bulk orders |
| `11-SPRINT_REGIONAL.md` | Multi-country KYC, currency, language, regulatory compliance |
| `12-SPRINT_ANALYTICS.md` | Business intelligence, dashboards, ML models, reporting |

---

*Sprint Roadmap v1.0 — July 2026*
