# TWENDE Project Documentation

**Read this first before modifying any code.**

## What Is TWENDE?

TWENDE is a 5-pillar fintech platform for East Africa's informal economy. It is NOT five separate apps — it is **one unified financial operating system** where all products share a single identity layer, trust engine, and M-Pesa payment rails.

## The Five Pillars

| Pillar | Swahili | What It Does | Tech Surface |
|---|---|---|---|
| **Chama** | *"Let's go, community"* | Community savings groups — digitized contributions, transparent ledger, group loans, credit score building | Flutter app, M-Pesa Mini Program, USSD *384*77#, WhatsApp bot |
| **Biashara** | *"Business"* | MSME microloans underwritten by alternative data (not collateral) — cash-flow-aligned repayments, merchant super-app | Flutter app, M-Pesa Mini Program |
| **Kazi** | *"Work"* | Gig worker financial services — AutoSave (% of every fare), per-ride insurance, emergency loans, income analytics | White-label SDK in gig platform apps + standalone app |
| **Linda** | *"Protect"* | Microinsurance — accident, health, life, business, crop cover. Micro-premiums (per ride/day), AI adjudication, M-Pesa payout within 24hrs | Embedded in all other products |
| **Soko** | *"Market"* | Phone-number commerce — WhatsApp-native buying, M-Pesa STK Push checkout, delivery via Kazi riders, seller protection insurance | WhatsApp Business API bot + mobile web |

## Core Architectural Principle

> **"Phone number is the financial life."**

Every user has ONE profile across all five products. A single M-Pesa transaction (e.g., a Soko sale) simultaneously: improves Biashara credit score, updates Linda risk profile, builds Chama collective data, and feeds Kazi income verification.

## Document Index

Read documents in this order before coding:

| # | Document | Why Read It | Size |
|---|---|---|---|
| 1 | `PROJECT_CONTEXT.md` | **START HERE.** One-page cheat sheet of the entire platform, data flows, and tech stack | ~3 KB |
| 2 | `twende_startup_strategy.md` | Company vision, why these 5 products, competitive moat, funding roadmap, team structure | ~43 KB |
| 3 | `twende_unified_prd.md` | **The Bible.** Complete product requirements for all 5 pillars: features, user flows, design system, business rules, KPIs, release plan | ~50 KB |
| 4 | `twende_unified_trd.md` | **The Blueprint.** 10 microservices, PostgreSQL schema, 18 Kafka topics, credit scoring engine code, security architecture, AWS deployment | ~56 KB |
| 5 | `twende_soko_integration.md` | How Soko (commerce) integrates with the other 4 pillars — 6 integration points, cross-product economics | ~18 KB |
| 6 | `east_africa_fintech_opportunities_report.md` | Market research backing: pain points with evidence, TAM/SAM/SOM, competitor analysis, regulatory landscape | ~75 KB |
| 7 | `twende_chama_prd.md` | Original standalone PRD for Chama (superseded by unified PRD but has detailed feature specs) | ~42 KB |
| 8 | `twende_chama_trd.md` | Original standalone TRD for Chama (superseded by unified TRD but has service-level detail) | ~54 KB |

## Current Codebase Structure

```
twende-app/
├── src/
│   ├── main.tsx              # App entry (React + HashRouter)
│   ├── App.tsx               # Route definitions
│   ├── index.css             # Tailwind design system (colors, animations)
│   ├── App.css               # Minimal app styles
│   ├── components/
│   │   └── Layout.tsx        # Sidebar + header + credit score card
│   ├── data/
│   │   └── mockData.ts       # ALL demo data — replace with API calls
│   └── pages/
│       ├── Home.tsx          # Overview dashboard
│       ├── Chama.tsx         # Savings groups
│       ├── Biashara.tsx      # MSME credit
│       ├── Kazi.tsx          # Gig worker services
│       ├── Linda.tsx         # Insurance
│       └── Soko.tsx          # Commerce
├── docs/                     # THIS FOLDER — all project documentation
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vercel.json               # SPA routing for Vercel
```

## Design System (from `src/index.css`)

| Token | Hex | Usage |
|---|---|---|
| `--color-ocean` | #0A2463 | Headers, primary branding, trust elements |
| `--color-sunrise` | #FF6B35 | CTAs, alerts, Biashara branding |
| `--color-fresh` | #2ECC71 | Success, contributions, confirmations |
| `--color-coral` | #E74C3C | Errors, overdue, warnings |
| `--color-linda` | #9B59B6 | Insurance, protection, security |
| `--color-kazi` | #1ABC9C | Gig work, income, energy |
| `--color-soko` | #FF6B6B | Commerce, seller branding |
| `--color-bg` | #F8F9FA | App background |
| `--color-surface` | #FFFFFF | Cards, sheets |

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS v4 + Vite
- **Routing:** React Router v6 (HashRouter for static hosting)
- **Icons:** Lucide React
- **State:** React hooks (add Zustand/Redux for production)
- **Backend:** Node.js (API services) + Python (ML/credit scoring) — see unified TRD
- **Database:** PostgreSQL 15 — schema in unified TRD
- **Events:** Apache Kafka 3.6 — topic design in unified TRD
- **Payments:** M-Pesa Daraja 3.0 — API mapping in unified TRD
- **Hosting:** Vercel (frontend) + AWS (backend) — architecture in unified TRD

## Data Flow Rule

Every cross-product interaction happens via **Kafka events**, never direct API calls:

```
[Soko order paid]
    │ Kafka: soko.order.paid
    ▼
[Credit Scoring Engine] → recalculates score
    │ Kafka: credit.score.updated
    ▼
[Biashara] → updates loan eligibility
[Linda] → adjusts insurance premium
[Chama] → updates group transaction count
```

## Mock Data → Real API Migration Path

All data currently lives in `src/data/mockData.ts`. When connecting real APIs:

1. Keep `mockData.ts` as fallback for offline mode
2. Create `src/api/` folder with service modules per product
3. Use React Query for caching, loading states, error handling
4. Swap component imports from `../data/mockData` to `../api/chamaService`

## Important: Read Before Coding

**Kimi Code / any AI assistant:** Before suggesting code changes, read:
1. `PROJECT_CONTEXT.md` — understand the platform
2. `twende_unified_prd.md` — section matching the product being modified
3. `twende_unified_trd.md` — database schema and API specs for the change

Never modify the design system colors, component naming conventions, or routing structure without referencing the unified PRD.
