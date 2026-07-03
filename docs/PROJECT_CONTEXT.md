# TWENDE — Project Context (Quick Reference)

**One-page summary for AI coding assistants. Read this before writing any code.**

---

## What This Is

TWENDE is a **5-pillar fintech platform** for East Africa's informal economy. One user identity, one M-Pesa payment rail, five product surfaces. Each product feeds data into a shared Trust Engine that improves the user's experience across all other products.

## The Five Pillars

| # | Pillar | Swahili | Target User | Core Value |
|---|---|---|---|---|
| 1 | **Chama** | *"Let's go, community"* | Chama members (15M+ across EAC) | Digitize savings groups — transparent ledger, instant loans, credit score building |
| 2 | **Biashara** | *"Business"* | MSMEs with M-Pesa history (3–5M) | Microloans without collateral, cash-flow-aligned repayments, merchant super-app |
| 3 | **Kazi** | *"Work"* | Gig workers — boda, delivery, digital (2–3M) | AutoSave (% of every fare), per-ride insurance, emergency loans, income analytics |
| 4 | **Linda** | *"Protect"* | All TWENDE users | Microinsurance — accident, health, life, business, crop. AI adjudication, M-Pesa payout in 24hrs |
| 5 | **Soko** | *"Market"* | Micro-sellers + all users as buyers (1M+) | WhatsApp-native commerce, phone-number store URL, M-Pesa checkout, Kazi delivery |

## The Trust Engine (Shared Infrastructure)

Not a separate product — the invisible layer powering everything:

| Component | Function | Input | Output |
|---|---|---|---|
| **Unified Identity** | One user record, KYC tiers 1–3, phone number = primary key | National ID, selfie, address | Portable identity across all products |
| **Credit Scoring** | 300–850 score from non-traditional data | Chama contributions (20%), M-Pesa patterns (15%), Soko sales (20%), loan repayment (25%), gig income (10%), insurance claims (5%), KYC tier (5%) | Pre-qualified loan offers, insurance pricing |
| **Risk & Fraud** | Real-time anomaly detection | Transaction velocity, device fingerprint, biometric | Fraud alerts, transaction holds |
| **Consent Management** | User-controlled data sharing per product | Explicit opt-in per data type | GDPR/Data Protection Act compliance |
| **Event Bus (Kafka)** | Cross-product async communication | 18 event topics | Real-time credit updates, instant insurance eligibility |
| **Blockchain Anchoring** | Immutable audit trail | Daily hash of all transactions | Regulatory auditability, dispute resolution |

## KYC Tiers

| Tier | Requirements | Products Unlocked | Monthly Limit |
|---|---|---|---|
| 1 | Phone + OTP + national ID | Chama contributions, Soko purchases (buyer) | KES 50,000 |
| 2 | Tier 1 + selfie liveness + ID upload + CRB check | Biashara loans (≤KES 50K), Linda insurance, Soko selling | KES 200,000 |
| 3 | Tier 2 + address verification + 6 months history | Biashara loans (≤KES 500K), Linda premium, Soko premium features | KES 1,000,000 |

## Credit Score → Product Unlocks

| Score | Tier | Biashara Max Loan | Linda Coverage | Soko Badge | Kazi Loan |
|---|---|---|---|---|---|
| 300–449 | Bronze | Not eligible | Basic accident only | None | Not eligible |
| 450–599 | Silver | KES 50,000 | + Income protection | "Verified" | KES 10,000 |
| 600–749 | Gold | KES 200,000 | + Business cover | "Trusted" | KES 50,000 |
| 750–850 | Platinum | KES 500,000 | Full coverage | "Top Seller" | KES 100,000 |

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Tailwind CSS v4 + Vite |
| **Routing** | React Router v6 (HashRouter) |
| **Icons** | Lucide React |
| **State** | React hooks (Zustand for production) |
| **Backend** | Node.js (API) + Python (ML/scoring) |
| **Database** | PostgreSQL 15 (RDS Multi-AZ + 2 read replicas) |
| **Cache** | Redis 7 (ElastiCache Cluster) |
| **Events** | Apache Kafka 3.6 (MSK) — 18 topics |
| **Payments** | M-Pesa Daraja 3.0 (STK Push, B2C, C2B, Ratiba) |
| **Blockchain** | Hyperledger Fabric 2.5 (permissioned) |
| **Hosting** | Vercel (frontend) + AWS ECS (backend) + af-south-1 |

## Microservices (10 + 3 infra)

| Service | Language | Responsibility |
|---|---|---|
| User Service | Node.js | Auth, KYC, profile, consent |
| Chama Service | Node.js | Group lifecycle, member mgmt, governance |
| Biashara Service | Python (FastAPI) | Loan app, underwriting, disbursement, repayment |
| Kazi Service | Node.js | Gig worker enrollment, AutoSave, insurance |
| Linda Service | Python (FastAPI) | Policy mgmt, claims, AI adjudication |
| Soko Service | Node.js | Seller profiles, listings, orders, WhatsApp bot |
| Transaction Service | Python (FastAPI) | ALL M-Pesa integrations, payment processing |
| Credit Scoring Engine | Python | Score calc, pre-qualification, ML models |
| Notification Service | Node.js | SMS, push, WhatsApp, email delivery |
| Ledger Service | Python | Financial ledger, reporting, blockchain anchoring |
| Kong Gateway | Kong 3.5 | API routing, auth, rate limiting |
| Kafka Cluster | Kafka 3.6 | Event streaming, cross-product communication |
| Redis Cluster | Redis 7 | Session store, cache, rate limits, pub/sub |

## Key Kafka Topics (most important)

| Topic | Producer → Consumers | Payload |
|---|---|---|
| `user.kyc_upgraded` | User Service → Credit Engine, Biashara, Linda | user_id, new_tier |
| `transaction.completed` | Transaction Service → Credit Engine, Ledger, Notification | txn details, product, amount |
| `chama.contribution.received` | Chama Service → Credit Engine, Ledger, Notification | member_id, amount, chama_id |
| `biashara.loan.disbursed` | Biashara → Transaction Service, Credit Engine | loan_id, amount, disbursement_txn |
| `soko.order.paid` | Soko Service → Credit Engine, Biashara, Linda, Ledger | order_id, amount, seller_id, buyer_id |
| `kazi.gig.completed` | Kazi Service → Credit Engine, AutoSave | worker_id, amount, platform |
| `linda.claim.approved` | Linda → Transaction Service (payout), Credit Engine | claim_id, payout_amount |
| `credit.score.updated` | Credit Engine → ALL products | user_id, new_score, unlocked_products |

## Design System Tokens

```css
--color-ocean: #0A2463      /* Headers, primary branding, trust */
--color-sunrise: #FF6B35    /* CTAs, alerts, Biashara */
--color-fresh: #2ECC71      /* Success, contributions, confirmations */
--color-coral: #E74C3C      /* Errors, overdue, warnings */
--color-linda: #9B59B6      /* Insurance, protection */
--color-kazi: #1ABC9C       /* Gig work, income */
--color-soko: #FF6B6B       /* Commerce, seller branding */
--color-bg: #F8F9FA         /* App background */
--color-surface: #FFFFFF    /* Cards, sheets */
--color-border: #E5E7EB     /* Borders, dividers */
--color-text: #1F2937       /* Primary text */
--color-text2: #6B7280      /* Secondary text */
--color-text3: #9CA3AF      /* Tertiary text */
```

## M-Pesa Transaction Types (all via Daraja 3.0)

| Type | Daraja API | Product | Direction |
|---|---|---|---|
| C2B Contribution | STK Push + C2B Callback | Chama | Member → Group |
| C2B Soko Payment | STK Push + C2B Callback | Soko | Buyer → Seller |
| C2B Insurance Premium | STK Push + C2B Callback | Linda | User → Insurer |
| B2C Loan Disbursement | B2C Payment Request | Biashara | Platform → User |
| B2C Insurance Claim | B2C Payment Request | Linda | Insurer → User |
| B2C Cashout | B2C Payment Request | Soko | Platform → Seller |
| B2B Supplier Payment | B2B API | Biashara | Business → Vendor |
| Ratiba Recurring | Ratiba Schedule API | Chama, Kazi, Linda | User → Various |

## Current Codebase (Frontend Only)

All data is currently mocked in `src/data/mockData.ts`. Every product dashboard is implemented as a React page with interactive UI (sliders, modals, charts, tabs). The routing uses HashRouter for static hosting compatibility.

## Migration Path: Mock → Real API

1. Create `src/api/` folder with service modules per product
2. Use React Query for caching, loading states, error handling
3. Keep `mockData.ts` as offline fallback
4. Swap imports from `../data/mockData` to `../api/chamaService`

## File Structure for Context

```
twende-app/
├── src/
│   ├── main.tsx              # React entry + HashRouter
│   ├── App.tsx               # Routes: /, /chama, /biashara, /kazi, /linda, /soko
│   ├── index.css             # Tailwind design system
│   ├── App.css               # Minimal
│   ├── components/
│   │   └── Layout.tsx        # Sidebar nav + credit score card + header
│   ├── data/
│   │   └── mockData.ts       # ALL demo data
│   └── pages/
│       ├── Home.tsx          # Overview dashboard
│       ├── Chama.tsx         # Savings groups
│       ├── Biashara.tsx      # MSME credit
│       ├── Kazi.tsx          # Gig worker services
│       ├── Linda.tsx         # Insurance
│       └── Soko.tsx          # Commerce
├── docs/                     # Full documentation (this folder)
│   ├── README.md             # Doc index and quick reference
│   ├── PROJECT_CONTEXT.md    # This file — quick ref
│   ├── twende_unified_prd.md # Complete product requirements
│   ├── twende_unified_trd.md # Complete technical architecture
│   ├── twende_startup_strategy.md # Company strategy
│   ├── twende_soko_integration.md # Soko ecosystem integration
│   ├── east_africa_fintech_opportunities_report.md # Market research
│   ├── twende_chama_prd.md   # Original Chama PRD
│   └── twende_chama_trd.md   # Original Chama TRD
└── [config files]
```

## When Modifying Code

1. **Check `twende_unified_prd.md`** — find the product section for the feature being built
2. **Check `twende_unified_trd.md`** — verify database schema and API specs
3. **Follow the design system** in `src/index.css` — do not introduce new colors
4. **Use existing component patterns** — follow Layout.tsx, mockData.ts conventions
5. **Maintain cross-product awareness** — a change in one product affects the Trust Engine

## One-Sentence Rules

- **Phone number = primary key everywhere.**
- **M-Pesa is the only payment rail.**
- **Kafka is the only cross-product communication method.**
- **Every transaction enriches the Trust Engine.**
- **KYC tier 2 minimum for loans and insurance.**
- **Credit score 300–850, recalculated in real-time.**
- **Feature phone users get full access via USSD.**
- **All financial transactions are blockchain-anchored daily.**
