# TWENDE — Unified Product Requirements Document (PRD)

**Platform:** TWENDE Financial Wellness Ecosystem  
**Products:** Chama · Biashara · Kazi · Linda · Soko  
**Version:** 2.0 (Unified)  
**Date:** July 2026  
**Status:** Draft for Review  
**Owner:** Product Team, TWENDE  
**Tagline:** *"Your number is your financial life."*

---

## 1. Executive Summary

### 1.1 The Platform Vision

TWENDE is not five separate fintech apps. It is **one financial operating system for East Africa's informal economy**, accessible through five product surfaces that share a single identity layer, a single trust engine, and a single set of M-Pesa payment rails. A vegetable vendor in Nairobi uses the same phone number, the same M-Pesa PIN, and the same TWENDE profile whether she is contributing to her chama, applying for a business loan, buying inventory through Soko, insuring her stock, or saving a percentage of her delivery earnings.

The platform is built on a core insight derived from extensive market research: **East Africans do not experience their financial lives as separate categories** — savings, credit, insurance, commerce, and work income are intertwined daily realities. Yet every fintech product in the region forces them into separate apps, separate registrations, separate passwords, and separate trust-building exercises. TWENDE removes these artificial boundaries by architecting all five products on top of a **shared data foundation** where activity in one product automatically improves the user's experience in all others.

### 1.2 The Five Pillars

| Pillar | Swahili | Target User | Core Problem | Revenue Model |
|---|---|---|---|---|
| **Chama** | *"Let's go, community"* | 15M+ chama members across EAC | Cash-based savings groups suffer fraud, opaque record-keeping, no credit building | $1–3/member/month platform fee + loan facilitation |
| **Biashara** | *"Business"* | 3–5M MSMEs with M-Pesa history | 51% of formal MSMEs cannot access credit; informal sellers have no collateral | 18–36% APR on loans + 2–3% origination + SaaS fees |
| **Kazi** | *"Work"* | 2–3M gig workers (boda, delivery, digital) | No savings, insurance, or credit tailored to irregular gig income | $0.50–2/user/month platform fee + insurance premium share |
| **Linda** | *"Protect"* | All TWENDE users | Insurance penetration <3% of GDP; informal workers have zero safety net | 15–25% commission on premiums + claims management |
| **Soko** | *"Market"* | 1M+ micro-sellers + all TWENDE users as buyers | Selling on WhatsApp/Facebook requires manual M-Pesa coordination; 30–40% buyer drop-off | 1.2% transaction fee + delivery fees + premium seller features |

### 1.3 Market Evidence

The addressable market for each pillar is grounded in verified data from regulatory filings, World Bank reports, and industry research:

- **Chama:** 300,000+ groups in Kenya alone [^87^], with an estimated 15–20 million members across the EAC. The average group manages $150–$1,000 monthly in collective savings, yet operates entirely on cash and paper records.
- **Biashara:** Sub-Saharan Africa has the highest MSME finance gap in the developing world at **51%** of formal MSMEs credit-constrained [^51^]. The IFC estimates a **$5.2 trillion global MSME finance gap** [^54^]. In Kenya alone, women-owned MSMEs face a **$1.7 trillion gap** globally representing 30% of total MSME demand [^54^].
- **Kazi:** Over **1 million boda-boda riders** in Kenya [^58^], with hundreds of thousands more on platforms like Bolt, Glovo, Jumia Food. A CGAP study found that **a savings mechanism topped gig workers' needs by far** — they wanted money locked safely from temptation spending [^62^].
- **Linda:** Insurance penetration in Kenya is **2–3% of GDP**; Uganda and Tanzania hover around **1%** [^42^][^45^]. The global microinsurance market reached **$89.06 billion in 2025** and is projected to grow to **$171.44 billion by 2035** [^44^].
- **Soko:** Micro-sellers on WhatsApp Status, Facebook Marketplace, and Instagram lose **30–40% of interested buyers** to friction in the payment coordination process. The African BNPL market is expected to grow from **$5.2 billion in 2025 to $16.8 billion by 2031** [^76^][^77^].

### 1.4 The Flywheel Effect

The platform's sustainable competitive advantage is architectural: **every transaction across any product enriches the shared trust engine**, which improves credit scores, reduces insurance premiums, unlocks larger loans, and deepens user engagement across all products. A single user journey demonstrates this:

> Wanjiku contributes KES 2,000/month to her chama through Twende Chama. After 6 months of consistent contributions, her credit score reaches 650. She uses this score to qualify for a KES 15,000 inventory loan from Twende Biashara at 24% APR (down from 36%). She buys fabric through Twende Soko, paying via M-Pesa STK Push. The seller delivers via a Twende Kazi rider. Wanjiku opts into Twende Linda's accident coverage for KES 50/week. Every transaction — chama contribution, loan repayment, Soko purchase, delivery fee, insurance premium — feeds back into her trust profile, unlocking better terms on her next loan and lower premiums on her next policy.

This is not a loyalty program with points. It is **structural interdependence** built into the data architecture.

---

## 2. Problem Statement: Five Gaps, One System

### 2.1 The Structural Disconnect

East Africa's informal economy operates as a **parallel financial system** that is larger than the formal banking sector but entirely invisible to it. An estimated **85.3% of employment across Africa is informal** [^52^]. Yet this massive economic activity generates no credit history, no insurance records, no savings documentation, and no transaction data that traditional financial institutions can use for product design or risk assessment.

The result is a **five-dimensional exclusion**:

| Dimension | The Gap | Who Suffers | Scale |
|---|---|---|---|
| **Savings** | 300,000+ chamas operate on cash and paper; treasurer fraud affects 23% annually; no individual credit history built from years of saving | Chama members, predominantly women | 15–20M people across EAC |
| **Credit** | 51% of formal MSMEs cannot access credit; informal sellers have no collateral, no credit bureau record, no formal employment | Small shop owners, market vendors, artisans | 3–5M businesses |
| **Income Protection** | Gig workers (boda, delivery, domestic) have no savings mechanism, no insurance, no income continuity when unable to work | 2–3M platform + informal workers | 2–3M workers |
| **Risk Protection** | Insurance penetration <3% of GDP; agricultural insurance covers <3% of smallholder farmers; health microinsurance almost nonexistent | Farmers, gig workers, SME owners | 200M+ population |
| **Commerce** | Micro-sellers lose 30–40% of buyers to payment friction; no trust signal beyond word-of-mouth; no delivery infrastructure | WhatsApp/Facebook sellers, market vendors | 1M+ sellers |

Each gap has been addressed by standalone fintech products — M-Shwari for savings, Branch for credit, Turaco for gig insurance, Pula for agriculture, Chamasoft for group management. But each product operates in isolation, forcing users to build trust from scratch in every app, with no data portability between them. TWENDE's innovation is not solving any one gap better than existing players; it is **solving all five gaps as one system** where data flows freely between them.

### 2.2 Why Existing Solutions Fail the Informal Worker

The research reveals a consistent pattern across all five problem domains: **products designed for formal-sector users fail when deployed to informal-sector realities** [^41^][^46^].

| Product Type | Formal-World Assumption | Informal-World Reality | Failure Mode |
|---|---|---|---|
| **Savings accounts** | Regular monthly salary deposits | Irregular daily/weekly cash income | Minimum balance requirements; fixed deposit schedules |
| **Bank loans** | Collateral (land, property, equipment); payslips | No titled property; no formal employer | 90%+ rejection rate for informal borrowers |
| **Insurance** | Annual premium paid upfront; claims with documentation | Cannot afford lump-sum premium; no receipts/invoices | <3% penetration in East Africa |
| **Pensions** | Employer-matched contributions via payroll deduction | No employer; income is daily cash | 80–90% of workers have zero pension coverage [^41^] |
| **E-commerce** | Credit card checkout; delivery address; email confirmation | No credit card; no fixed address; feature phone dominant | 30–40% cart abandonment at payment step |

TWENDE's design principle is **"build for the reality, not the ideal"**: contributions are micro (KES 50–500), loan repayments are cash-flow-aligned (percentage of daily sales), insurance premiums are per-ride/per-day, and commerce happens entirely within WhatsApp with no app download required.

---

## 3. Platform Architecture: The Trust Engine

### 3.1 Conceptual Model

At the center of TWENDE is the **Trust Engine** — a unified data layer that aggregates financial behavior across all five products into a single, portable trust profile for every user. The Trust Engine is not a separate product that users interact with directly; it is the invisible infrastructure that powers every product experience.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Flutter App │ M-Pesa Mini Program │ USSD (*384*77#) │ WhatsApp │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      PRODUCT LAYER (5 Pillars)                   │
│                                                                  │
│   ┌─────────┐  ┌───────────┐  ┌─────────┐  ┌────────┐  ┌──────┐ │
│   │  Chama  │  │ Biashara  │  │  Kazi   │  │ Linda  │  │ Soko │ │
│   │ Savings │  │   Credit  │  │  Gig    │  │  Insure│  │Market│ │
│   └────┬────┘  └─────┬─────┘  └────┬────┘  └───┬────┘  └──┬───┘ │
│        │             │             │           │          │     │
└────────┼─────────────┼─────────────┼───────────┼──────────┼─────┘
         │             │             │           │          │
         └─────────────┴──────┬──────┴───────────┴──────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      TRUST ENGINE                                │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ Unified User │  │Alternative   │  │   Risk & Fraud       │  │
│   │ Identity     │  │Credit Scoring│  │   Detection          │  │
│   │ (KYC tiers)  │  │ (300–850)    │  │   (ML models)        │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ Consent      │  │Cross-Product │  │   Blockchain         │  │
│   │ Management   │  │Event Bus     │  │   Anchoring          │  │
│   │ (GDPR/Data   │  │ (Kafka)      │  │   (Audit Trail)      │  │
│   │  Protection) │  │              │  │                      │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                           │
│   M-Pesa Daraja 3.0 │ CRB Credit Bureau │ Huduma Namba │ SMS   │
│   Satellite Data    │ Insurance Partners │ WhatsApp API │ Push  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 The Trust Engine Components

| Component | Function | Data Inputs | Data Outputs |
|---|---|---|---|
| **Unified User Identity** | Single sign-on across all products; KYC tiering (1–3); phone number as primary identifier | National ID verification, selfie liveness check, M-Pesa registered name, address verification | Portable identity; product access control (Tier 1 = savings only; Tier 2 = loans; Tier 3 = large loans + insurance) |
| **Alternative Credit Scoring** | 300–850 score calculated from non-traditional financial behavior | Chama contribution consistency (25%), M-Pesa transaction patterns (20%), Soko sales revenue (20%), loan repayment history (20%), gig platform income (10%), insurance claims history (5%) | Pre-qualified loan offers, insurance premium pricing, savings product eligibility |
| **Risk & Fraud Detection** | Real-time anomaly detection across all products | Transaction velocity, device fingerprinting, location patterns, network behavior, biometric verification | Fraud alerts, transaction holds, account suspension, regulatory SAR filing |
| **Consent Management** | User-controlled data sharing between products | Explicit opt-in per data type, granular revocation, audit logging | Compliance with Kenya Data Protection Act 2019; user trust; regulatory approval |
| **Cross-Product Event Bus** | Asynchronous data propagation between all products | Kafka topics: contribution events, loan lifecycle events, insurance policy events, order completion events, gig income events | Real-time credit score updates, instant insurance eligibility checks, dynamic loan limit adjustments |
| **Blockchain Anchoring** | Immutable audit trail for all financial transactions | Daily hash of all transactions anchored to Hyperledger Fabric | Regulatory auditability; dispute resolution; tamper-proof record-keeping |

### 3.3 KYC Tier System

TWENDE uses a **3-tier KYC system** that balances regulatory compliance with user acquisition friction. Higher tiers unlock more products but require more verification.

| Tier | Requirements | Products Unlocked | Monthly Transaction Limit |
|---|---|---|---|
| **Tier 1: Basic** | Phone number + OTP + national ID number | Chama contributions, Soko purchases (buyer), Kazi savings | KES 50,000 |
| **Tier 2: Verified** | Tier 1 + selfie liveness + ID document upload + CRB check | Biashara loans (up to KES 50,000), Linda insurance, Soko selling | KES 200,000 |
| **Tier 3: Premium** | Tier 2 + address verification + 6+ months platform history | Biashara loans (up to KES 500,000), Linda premium policies, Soko premium seller features | KES 1,000,000 |

---

## 4. Product Specifications: The Five Pillars

### 4.1 Pillar 1: Twende Chama — Community Savings

**Target User:** Chama members and organizers across East Africa. Primary persona: women aged 28–50, urban and peri-urban, participating in 1–3 savings groups simultaneously.

**Core Value Proposition:** Transform cash-based, paper-recorded savings groups into transparent, secure, digitally-managed collectives where every contribution builds individual credit history.

**Key Features (MVP):**

| Feature | Description | User Story | Priority |
|---|---|---|---|
| **Group Creation** | 5-step wizard: name, contribution amount/frequency, loan rules, governance settings, invite | As an organizer, I want to set up my chama digitally in under 3 minutes | P0 |
| **M-Pesa C2B Contribution** | Members contribute via STK Push to group's unique shortcode; instant ledger update | As a member, I want to contribute via M-Pesa and see my payment recorded immediately | P0 |
| **Transparent Ledger** | Real-time transaction history visible to all members; blockchain-anchored for immutability | As a member, I want to verify that my treasurer is not stealing | P0 |
| **Group Loans** | Members request loans; digital vote by eligible members; instant B2C disbursement on approval | As a member, I want to access an emergency loan from our group savings within 24 hours | P0 |
| **USSD Access** | Full contribution and loan functionality via *384*77# for feature phone users | As a rural member with no smartphone, I want to contribute without attending meetings | P0 |
| **Credit Score Building** | Individual score (300–850) based on contribution consistency, loan repayment, group tenure | As a member, I want my savings discipline to unlock loans from other TWENDE products | P1 |
| **Contribution Scheduling** | Automated recurring contributions via Daraja Ratiba API | As a busy member, I want my contributions deducted automatically | P1 |
| **Chama Group Orders (Soko)** | Organizer shares Soko listing to chama WhatsApp; bot coordinates pooled purchase | As a chama, we want to buy bulk inventory together at a discount | P2 |

**Channel Strategy:**
- **Primary:** Flutter mobile app (iOS/Android) for smartphone users
- **Secondary:** M-Pesa Super App Mini Program for discovery within M-Pesa ecosystem
- **Tertiary:** USSD (*384*77#) for feature phone users (estimated 40% of target market)
- **Engagement:** WhatsApp Business API for contribution reminders, meeting notifications, and group order coordination

**Revenue Model:**
- **Free tier:** Up to 15 members, basic ledger, no loans
- **Premium tier:** $1–3/member/month — unlimited members, group loans, investment marketplace access, Soko group orders, priority support
- **Loan facilitation fee:** 2–3% of disbursed group loan amount

---

### 4.2 Pillar 2: Twende Biashara — MSME Credit + Merchant Tools

**Target User:** Small business owners — mama mbogas, boda-boda spare parts shops, mobile money agents, market vendors, informal service providers. Monthly revenue: KES 30,000–300,000.

**Core Value Proposition:** Microloans underwritten by alternative data (not collateral), with repayments aligned to business cash flow, plus a merchant super-app for payment acceptance and business management.

**Key Features (MVP):**

| Feature | Description | User Story | Priority |
|---|---|---|---|
| **Alternative-Data Loan Application** | Apply via app; approval in <5 minutes using M-Pesa history + chama data + Soko sales | As a shop owner, I want a loan without collateral or a bank visit | P0 |
| **Cash-Flow-Aligned Repayment** | Repay as % of daily M-Pesa sales (e.g., 10–15%) rather than fixed monthly installments | As a seasonal vendor, I want to repay less during slow weeks | P0 |
| **Instant B2C Disbursement** | Approved loans reach M-Pesa within 5 minutes | As a vendor, I need to restock inventory today, not next week | P0 |
| **Merchant Super-App** | Payment acceptance (all M-Pesa tills + QR), inventory tracking, customer CRM, staff management | As a shop owner, I want to track my sales and stock in one place | P0 |
| **Soko Seller Integration** | Soko sales revenue automatically feeds into credit score and loan eligibility | As a Soko seller, I want my online sales to help me qualify for bigger loans | P1 |
| **Pre-Qualified Offers** | Dynamic loan offers based on real-time credit score changes | As a growing business, I want to know instantly when I qualify for more credit | P1 |
| **Multi-Currency Virtual Account** | KES, TZS, UGX, RWF balances with auto-reconciliation | As a cross-border trader, I want to accept payments in multiple currencies | P2 |

**Channel Strategy:**
- **Primary:** Flutter mobile app with M-Pesa Super App Mini Program
- **Distribution:** M-Pesa agent network (300,000+ agents in Kenya) for onboarding and support
- **Partnerships:** SACCOs, trade associations, e-commerce platforms (Jumia, Twiga)

**Revenue Model:**
- **Loan interest:** 18–36% APR (below digital lender average of 40–60%)
- **Origination fee:** 2–3% of principal
- **Merchant SaaS:** $5–20/month for premium business management features
- **Payment processing:** Revenue share with M-Pesa on merchant transactions

---

### 4.3 Pillar 3: Twende Kazi — Gig Worker Financial Services

**Target User:** Platform gig workers (SafeBoda, Bolt, Glovo, Jumia Food, Lynk) and informal gig workers (domestic workers, casual laborers, event staff). Primary persona: men aged 22–40, urban, smartphone-owning, working 6–7 days/week.

**Core Value Proposition:** Embedded financial wellness within gig platform apps — auto-save a percentage of every fare, micro-insurance per ride/day, emergency loans, and income analytics — without requiring workers to download a separate app.

**Key Features (MVP):**

| Feature | Description | User Story | Priority |
|---|---|---|---|
| **AutoSave** | Configurable % of each gig income auto-swept to locked savings pot via Ratiba | As a boda rider, I want to save 5% of every fare automatically | P0 |
| **Per-Ride Insurance** | Accident, hospitalization, and income protection micro-premiums (KES 5–20/ride) | As a delivery rider, I want to be covered if I crash | P0 |
| **Emergency Loans** | Pre-approved, instant-disbursed credit for vehicle repairs, medical emergencies | As a driver, I need KES 5,000 for a tyre replacement today | P0 |
| **Income Analytics** | Weekly earnings reports, tax estimation, financial literacy tips | As a gig worker, I want to understand my actual take-home pay | P1 |
| **Soko Delivery Integration** | Riders receive delivery requests from Soko sellers during low-demand hours | As a rider, I want extra income between 10am–4pm when ride demand is low | P2 |
| **Income Protection** | Daily payout if unable to work due to injury (after 3-day waiting period) | As a rider, if I break my leg, I need daily income until I recover | P2 |

**Channel Strategy:**
- **Primary:** White-label SDK embedded into gig platform apps (SafeBoda, Bolt, Glovo)
- **Secondary:** Standalone Flutter app for non-platform gig workers
- **Distribution:** Gig platform partnerships (revenue share model)

**Revenue Model:**
- **Platform licensing:** $0.50–2/active user/month from gig platforms
- **Insurance premium share:** 15–25% of per-ride premiums
- **Loan origination + interest:** 20–30% revenue share with lending partners
- **Savings platform fee:** 0.5–1% of AUM annually

---

### 4.4 Pillar 4: Twende Linda — Microinsurance

**Target User:** All TWENDE users who need protection against health, accident, income loss, and business risks. Primary segments: gig workers (accident/income), chama members (life/group), MSMEs (fire/theft/business interruption), smallholder farmers (crop/livestock).

**Core Value Proposition:** Insurance products designed for irregular incomes — premiums collected micro (per ride, per day, per contribution), claims adjudicated and paid via M-Pesa within 24 hours, underwritten by TWENDE's cross-product trust data.

**Key Features (MVP):**

| Feature | Description | User Story | Priority |
|---|---|---|---|
| **Gig Worker Accident Cover** | Hospitalization + disability payout per ride; auto-enrolled via Kazi | As a rider, if I crash, I want KES 50,000 for hospital bills within 24 hours | P0 |
| **Chama Group Life Cover** | Life insurance for chama members; premium from group contributions | As a chama, if a member dies, we want a payout to support their family | P0 |
| **Seller Shield (Soko)** | Inventory loss, customer dispute, income protection for Soko sellers | As a seller, I want my stock insured against fire and theft | P1 |
| **Parametric Crop Insurance** | Payout triggered by satellite-verified drought/flood (no adjuster visit) | As a farmer, if drought destroys my crop, I want automatic payout | P2 |
| **AI Claims Adjudication** | Image recognition + GPS verification for instant claim decisions | As an insured user, I want my claim approved in 2 hours, not 2 weeks | P1 |
| **B2C Instant Payout** | Approved claims paid directly to M-Pesa; no bank account needed | As a claimant, I need the money now, not after paperwork | P0 |

**Channel Strategy:**
- **Distribution:** Embedded into all other TWENDE products (Chama, Biashara, Kazi, Soko)
- **Underwriting:** Partnership with licensed insurers (Jubilee, CIC, APA, Swiss Re) — TWENDE acts as MGA
- **Claims:** AI-powered adjudication with human escalation for complex cases

**Revenue Model:**
- **Commission:** 15–25% of gross written premium
- **Claims management fee:** Per-claim processing fee
- **Risk data licensing:** Anonymized risk profiles sold to reinsurers

---

### 4.5 Pillar 5: Twende Soko — Commerce Layer

**Target User:** Micro-sellers on WhatsApp Status, Facebook Marketplace, Instagram, and physical markets. Primary persona: women aged 25–45 selling clothes, food, produce, or services informally. Monthly revenue: KES 25,000–100,000.

**Core Value Proposition:** A phone-number-anchored commerce layer that makes any seller instantly payable via M-Pesa, with a WhatsApp-native buying experience, zero buyer account creation, and delivery via TWENDE's Kazi rider network.

**Key Features (MVP):**

| Feature | Description | User Story | Priority |
|---|---|---|---|
| **Phone Number Store URL** | `soko.twende.io/0712345678` — works immediately, even before seller signs up | As a seller, I want buyers to pay me without sharing my M-Pesa number repeatedly | P0 |
| **Lightweight Listings** | Photo + price + title + available toggle (max 30 listings, no categories/variants) | As a seller, I want to list an item in 30 seconds, not 30 minutes | P0 |
| **WhatsApp Bot Buying Flow** | Buyer browses via bot, selects item, enters M-Pesa number, receives STK Push, gets receipt — 7 messages, 3 inputs, <90 seconds | As a buyer, I want to pay instantly without creating an account | P0 |
| **Order Confirmation + Receipt** | Buyer and seller both receive instant WhatsApp confirmation with M-Pesa code | As a buyer, I want proof that my payment was received | P0 |
| **Reverse Onboarding** | Buyer pays seller who has no SOKO account → seller receives activation prompt → money releases on signup | As SOKO, I want buyers to recruit sellers for us | P1 |
| **Verified Order Count** | Public trust signal: "127 completed orders" derived directly from payment ledger | As a buyer, I want to know if this seller is trustworthy before I pay | P1 |
| **Chama Group Orders** | Chama organizer shares listing to group; bot coordinates pooled purchase with individual STK pushes | As a chama, we want to buy bulk together at a discount | P2 |
| **Kazi Delivery** | "Delivery" option at checkout pings Kazi rider marketplace; verified rider identity shared | As a buyer, I want my item delivered by someone I can trust | P2 |
| **Daily WhatsApp Summary** | Evening summary of revenue, orders, balance; reply CASHOUT to withdraw | As a seller, I want to know my day's earnings without opening an app | P1 |

**Channel Strategy:**
- **Seller interface:** Mobile web (no app download) + WhatsApp commands
- **Buyer interface:** WhatsApp Business API bot (primary) + mobile web store page
- **Distribution:** Viral via reverse onboarding; chama group orders; M-Pesa Super App Mini Program

**Revenue Model:**
- **Transaction fee:** 1.2% per sale
- **Delivery fee:** KES 150–400 per delivery (split with Kazi rider)
- **Premium seller features:** KES 500/month for featured listings, analytics, custom slug
- **Linda Seller Shield:** KES 45–200/week for insurance (revenue share with Linda)

---

## 5. Cross-Product User Flows

### 5.1 The Complete Journey: From First Contribution to Financial Wellness

This flow demonstrates how a single user engages with all five products over time, with each interaction improving their position in the next.

```
WEEK 1: Onboarding
├── Downloads TWENDE app / opens M-Pesa Mini Program
├── Registers with phone + OTP
├── Completes KYC Tier 1 (name + national ID)
└── Joins "Nyota Chama" via invite link

WEEK 2-4: Chama + First Credit Building
├── Contributes KES 2,000 via M-Pesa C2B
├── Views real-time ledger (all members see her payment)
├── Credit score: 320 → 380 (contribution consistency factor)
└── Receives weekly contribution reminder via WhatsApp

MONTH 2: Soko Discovery
├── Sees kitenge dress on friend's WhatsApp Status
├── Clicks Soko link → browses store → taps "Chat to Buy"
├── WhatsApp bot: selects item, enters M-Pesa number, pays KES 1,200
├── Receives instant receipt + pickup details
├── Delivery arranged via Kazi rider (James, verified ID)
├── Credit score: 380 → 420 (diversified transaction activity)

MONTH 3: First Loan
├── Credit score reaches 500 (Tier 2 threshold)
├── Receives push: "You're pre-qualified for KES 10,000 at 28% APR"
├── Applies via Biashara → approved in 3 minutes
├── KES 10,000 disbursed via B2C to M-Pesa
├── Repayment: 12% of daily M-Pesa sales auto-deducted
├── Uses loan to buy bulk fabric through Soko (group order with chama)

MONTH 4: Insurance
├── Enrolls in Linda Gig Cover via Kazi (KES 50/week auto-deducted)
├── Also enrolls chama in Linda Group Life Cover
├── Minor accident → files claim via app (photo upload)
├── AI adjudicates in 2 hours → KES 15,000 paid to M-Pesa
├── Credit score: 420 → 550 (insurance enrollment + claim history)

MONTH 6: Growth
├── Credit score: 550 → 650
├── Pre-qualified for KES 50,000 loan at 24% APR
├── Opens Soko seller account → lists excess fabric from bulk purchase
├── Makes first Soko sale → verified order count: 1
├── Chama group orders her fabric → 8 members buy → consolidated order
├── Daily summary shows: KES 8,400 revenue, 6 orders
└── Credit score: 650 → 680 (Soko sales revenue now 20% of score)
```

### 5.2 Cross-Product Data Flows

| Trigger Event | Source Product | Data Produced | Destination Products | Effect |
|---|---|---|---|---|
| Chama contribution confirmed | Chama | Contribution amount, timeliness, consistency | Biashara (credit scoring), Linda (risk profile) | Credit score +2 to +5 points; insurance premium discount eligibility |
| Biashara loan repaid on time | Biashara | Repayment amount, timeliness, days early/late | Chama (member status), Linda (risk reduction) | Credit score +10 to +20 points; loan limit increased; insurance premium reduced |
| Kazi gig completed + AutoSave triggered | Kazi | Income amount, savings rate, work frequency | Biashara (income verification), Linda (occupation risk) | Credit score +1 to +3 per gig; income protection premium adjusted |
| Linda claim filed + approved | Linda | Claim type, amount, payout speed, fraud indicators | Biashara (risk assessment), Chama (group solvency check) | Future premiums adjusted; group loan eligibility reviewed |
| Soko order paid | Soko | Order amount, seller revenue, buyer behavior | Biashara (seller credit), Linda (seller insurance), Chama (group order tracking) | Seller credit score +3 to +10; verified order count +1; chama ledger updated |
| Chama group order initiated | Chama | Member participation, pooled amount, seller ID | Soko (consolidated order), Biashara (group creditworthiness) | Group credit score +5; bulk discount applied; seller receives single order |
| Credit score crosses threshold | Trust Engine | New score, change reason, unlocked products | All products (dynamic offers) | User receives pre-qualified loan offer, insurance upgrade prompt, Soko premium features |

---

## 6. Design System

### 6.1 Unified Design Principles

All five products share a single design system to ensure users perceive TWENDE as one platform, not five apps. The design philosophy prioritizes **familiarity over novelty** — users should immediately understand how to interact with any TWENDE product because the patterns are consistent.

| Principle | Implementation |
|---|---|
| **Phone-first** | All designs start at 360px width; feature phone USSD as fallback |
| **One-tap actions** | Primary actions (contribute, pay, save, claim) require maximum 2 taps |
| **Visual trust** | Transaction confirmations use green checkmark + M-Pesa receipt number prominently |
| **Progressive disclosure** | Advanced features hidden behind "More" — core functions immediately visible |
| **Offline resilience** | Core data cached; actions queued for sync; clear "Last updated" timestamps |
| **Language accessibility** | English primary, Swahili secondary, all strings externalized for i18n |

### 6.2 Color System

| Color | Hex | Usage | Rationale |
|---|---|---|---|
| **Deep Ocean** | #0A2463 | Headers, primary branding, trust elements | Stability, professionalism, bank-like trust |
| **Sunrise Orange** | #FF6B35 | CTAs, alerts, promotions, Soko branding | Energy, action, distinctly African warmth |
| **Fresh Green** | #2ECC71 | Success states, contributions, savings, confirmations | Growth, money, positive reinforcement |
| **Coral Red** | #E74C3C | Errors, overdue payments, cancellations, warnings | Urgency, attention |
| **Linda Purple** | #9B59B6 | Insurance products, protection, security | Safety, care, premium feel |
| **Kazi Teal** | #1ABC9C | Gig worker features, income, work-related | Energy, youth, dynamism |
| **Background** | #F8F9FA | App backgrounds | Clean, reduces eye strain |
| **Surface** | #FFFFFF | Cards, sheets | Content separation |

### 6.3 Component Library

| Component | Specification | Used Across |
|---|---|---|
| **Primary Button** | Full-width, 48dp height, #0A2463 background, white text, 8px radius, touch feedback | All products |
| **Action Button (Green)** | 48dp height, #2ECC71 background, #0A2463 text, for money-in actions (contribute, save, pay) | Chama, Kazi, Soko |
| **Action Button (Orange)** | 48dp height, #FF6B35 background, white text, for commerce actions (buy, sell, order) | Soko, Biashara |
| **Transaction Card** | White card, 12px radius, shadow, left border color-coded by type (green = in, red = out, blue = loan) | All products |
| **Amount Input** | Large font (32sp), # prefix, numeric keyboard, preset chips | Chama, Biashara, Soko |
| **Progress Ring** | Circular progress indicator, 120dp diameter, dual-color (achieved vs. remaining) | Chama, Kazi (savings goals) |
| **Status Badge** | Pill-shaped, color-coded: green (paid/active), orange (pending), red (overdue/defaulted) | All products |
| **Bottom Navigation** | 5-tab pattern: Home, Activity/Orders, Save/Contribute, Profile, More | App + Mini Program |

---

## 7. Business Logic & Rules

### 7.1 Unified Credit Scoring Algorithm (V2)

The credit score (300–850) is the single most important cross-product mechanism. It determines loan eligibility, insurance premium rates, savings product access, and Soko seller trust levels.

| Factor | Weight | Data Source | Scoring Logic |
|---|---|---|---|
| **Chama Contribution Consistency** | 20% | Chama Service | (% of on-time contributions over 6 months) × 170 + 300 |
| **M-Pesa Transaction Pattern** | 15% | Transaction Service | (transaction frequency + consistency score) × 127.5 + 300 |
| **Soko Sales Revenue** | 20% | Soko Service | (monthly_avg_revenue / 10,000) × 170 + 300, capped at 850 |
| **Loan Repayment History** | 25% | Loan Service | (% on-time repayments) × 212.5 + 300 |
| **Gig Platform Income** | 10% | Kazi Service | (months of consistent income × 17) + 300, capped |
| **Insurance Claims History** | 5% | Linda Service | (no_claims_bonus × 25) + 300, penalties for fraud |
| **KYC Tier** | 5% | User Service | Tier 1 = 300, Tier 2 = 450, Tier 3 = 600 (base contribution) |

**Score Thresholds & Unlocks:**

| Score Range | Tier | Biashara Loan Max | Linda Premium | Soko Seller Badge | Kazi Loan Max |
|---|---|---|---|---|---|
| 300–449 | Bronze | Not eligible | Basic accident only | No badge | Not eligible |
| 450–599 | Silver | KES 50,000 | + Income protection | "Verified" badge | KES 10,000 |
| 600–749 | Gold | KES 200,000 | + Business cover | "Trusted" badge | KES 50,000 |
| 750–850 | Platinum | KES 500,000 | Full coverage | "Top Seller" badge | KES 100,000 |

### 7.2 M-Pesa Transaction Routing

All five products use the same M-Pesa Daraja 3.0 integration, with transaction types tagged for routing and reporting:

| Transaction Type | Daraja API | Product | Direction | User Action |
|---|---|---|---|---|
| **C2B Contribution** | STK Push + C2B Callback | Chama | User → Group | Member contributes to chama |
| **C2B Soko Payment** | STK Push + C2B Callback | Soko | Buyer → Seller | Buyer pays for order |
| **C2B Insurance Premium** | STK Push + C2B Callback | Linda | User → Insurer | Premium collection |
| **B2C Loan Disbursement** | B2C Payment Request | Biashara | Platform → User | Approved loan paid out |
| **B2C Insurance Claim** | B2C Payment Request | Linda | Insurer → User | Approved claim paid out |
| **B2C Cashout** | B2C Payment Request | Soko | Platform → Seller | Seller withdraws balance |
| **B2B Supplier Payment** | B2B API | Biashara | Business → Vendor | Bulk payment to suppliers |
| **Ratiba Recurring** | Ratiba Schedule API | Chama, Kazi, Linda | User → Various | Automated recurring deductions |

### 7.3 Consent and Data Sharing

Users must explicitly consent to cross-product data sharing. The consent model is **tiered and revocable**:

| Consent Type | Default | Revocable | Impact if Revoked |
|---|---|---|---|
| **Basic identity sharing** | Auto-granted on registration | No | Required for platform operation |
| **Credit score calculation** | Auto-granted | Yes (30-day notice) | Cannot access loans, insurance premiums increase |
| **Soko sales data → Biashara** | Opt-in | Yes (instant) | Loan amounts based on chama data only |
| **Kazi income → Biashara** | Opt-in | Yes (instant) | Gig income not counted for credit |
| **Cross-product marketing** | Opt-out | Yes (instant) | No product recommendations, no upgrade prompts |
| **Anonymized data for research** | Opt-out | Yes (instant) | No impact on user experience |

---

## 8. Non-Functional Requirements

### 8.1 Performance (Platform-Wide)

| Metric | Target | Measurement |
|---|---|---|
| **App cold start** | < 3 seconds | Firebase Performance Monitoring |
| **Screen transition** | < 200ms | Automated UI testing |
| **M-Pesa STK Push initiation** | < 5 seconds | Transaction logs |
| **C2B callback processing** | < 30 seconds | Webhook latency monitoring |
| **B2C disbursement** | < 5 minutes | Transaction logs |
| **Credit score recalculation** | < 2 seconds (async) | Event processing latency |
| **Loan approval decision** | < 5 minutes | Application tracking |
| **Insurance claim adjudication** | < 2 hours (AI) / 24 hours (human) | Claims management system |
| **Soko order completion** | < 90 seconds (buyer) / instant (seller notification) | Order tracking |
| **USSD session response** | < 3 seconds per menu | Gateway logs |
| **API response time (p95)** | < 500ms | APM (Datadog) |
| **Push notification delivery** | < 30 seconds | FCM delivery reports |
| **SMS delivery** | < 60 seconds | SMS gateway logs |

### 8.2 Reliability & Availability

| Metric | Target |
|---|---|
| **Platform uptime SLA** | 99.9% (max 43 minutes/month) |
| **M-Pesa integration uptime** | 99.5% (graceful degradation during outages) |
| **Financial transaction integrity** | Zero data loss; all transactions atomic |
| **Data backup** | Real-time replication; point-in-time recovery to 24 hours |
| **Disaster recovery** | RPO < 1 hour, RTO < 4 hours |
| **Cross-region failover** | Manual failover to standby region within 4 hours |

### 8.3 Security

| Requirement | Implementation |
|---|---|
| **Encryption at rest** | AES-256 for all database storage |
| **Encryption in transit** | TLS 1.3 for all API communications |
| **App PIN** | 4-digit numeric, bcrypt hashed (salt rounds: 12) |
| **Biometric** | Fingerprint / Face ID optional, device-stored |
| **M-Pesa PIN** | Never stored or transmitted by TWENDE |
| **JWT access token** | RS256, 24-hour expiry, refresh token rotation |
| **Rate limiting** | 100 req/min per user; 10,000 req/min per shortcode |
| **Fraud detection** | Velocity checks, anomaly detection, device fingerprinting |
| **M-Pesa callback security** | HMAC-SHA256 signature validation + IP whitelisting |
| **Blockchain anchoring** | Daily hash of all financial transactions to Hyperledger |
| **Audit logging** | All admin actions, rule changes, financial transactions logged immutably |
| **Penetration testing** | Bi-annual external security assessment |

### 8.4 Scalability (3-Year Targets)

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| **Registered users** | 500,000 | 2,000,000 | 5,000,000 |
| **Monthly active users** | 200,000 | 800,000 | 2,500,000 |
| **Active chama groups** | 2,000 | 20,000 | 75,000 |
| **Biashara loan book** | $300K | $5M | $25M |
| **Kazi insured workers** | 10,000 | 100,000 | 400,000 |
| **Linda policies active** | 5,000 | 75,000 | 300,000 |
| **Soko monthly orders** | 5,000 | 75,000 | 400,000 |
| **Transactions per second** | 50 | 300 | 1,000 |
| **Countries live** | 1 (Kenya) | 3 (Kenya, Tanzania, Uganda) | 5 (EAC) |

---

## 9. Success Metrics

### 9.1 Platform-Level KPIs

| KPI | Year 1 Target | Year 3 Target | Measurement |
|---|---|---|---|
| **Monthly active users (MAU)** | 200,000 | 2,500,000 | Firebase Analytics |
| **Products per active user** | 1.5 | 3.0 | Product engagement tracking |
| **Cross-sell rate (% using 2+ products)** | 25% | 60% | Cohort analysis |
| **Net Promoter Score (NPS)** | 45 | 60 | Quarterly survey |
| **30-day retention** | 70% | 85% | Cohort analysis |
| **Churn rate (monthly)** | <8% | <5% | Cohort analysis |
| **Platform revenue** | $1.8M | $60M | Financial reporting |
| **Gross margin** | 45% | 65% | Financial reporting |
| **Unit economics (LTV:CAC)** | 4:1 | 8:1 | Cohort analysis |

### 9.2 Product-Level KPIs

| Product | Metric | Year 1 | Year 3 |
|---|---|---|---|
| **Chama** | Active groups | 2,000 | 75,000 |
| | Members on platform | 40,000 | 1,250,000 |
| | Monthly contribution volume | $1.2M | $35M |
| **Biashara** | Active borrowers | 2,000 | 100,000 |
| | Loan book outstanding | $300K | $25M |
| | NPL rate | <6% | <4% |
| **Kazi** | Active gig workers | 15,000 | 300,000 |
| | AutoSave AUM | $50K | $5M |
| | Insurance policies active | 10,000 | 400,000 |
| **Linda** | Policies in force | 5,000 | 300,000 |
| | Claims paid | 500 | 40,000 |
| | Loss ratio | <65% | <60% |
| **Soko** | Active sellers | 1,000 | 50,000 |
| | Monthly orders | 5,000 | 400,000 |
| | Monthly GMV | $50K | $8M |

### 9.3 Impact Metrics

| Impact Area | Metric | Year 1 | Year 3 |
|---|---|---|---|
| **Financial inclusion** | First-time credit access | 5,000 | 200,000 |
| | Women reached (% of users) | 55% | 50% |
| | Rural users (% of users) | 30% | 35% |
| **Savings mobilization** | Total chama savings | $5M | $400M |
| **Insurance coverage** | Previously uninsured now covered | 10,000 | 500,000 |
| **Income protection** | Gig workers with accident cover | 10,000 | 400,000 |
| **Commerce enablement** | Micro-sellers with digital storefront | 1,000 | 50,000 |
| **Cost savings** | Interest saved vs. money lenders (cumulative) | $50K | $10M |

---

## 10. Release Plan

### 10.1 Phase 0: Foundation (Months 1–3)

**Goal:** Build the Trust Engine and launch Chama MVP.

| Deliverable | Owner | Dependencies |
|---|---|---|
| Trust Engine v1 (identity, scoring V1, consent) | Backend | — |
| M-Pesa Daraja 3.0 integration (all APIs) | Backend | Safaricom shortcode approval |
| PostgreSQL schema (all 5 products) | Backend | — |
| Kafka event bus | Backend | — |
| Chama MVP (create, contribute, ledger, loans, USSD) | Mobile + Backend | Trust Engine |
| Flutter app shell + design system | Mobile | — |
| CBK Digital Credit Provider licensing | Compliance | — |

**Success Criteria:** 100 active chama groups; 2,000 registered members; KES 50K monthly contribution volume.

### 10.2 Phase 1: Credit + Commerce (Months 4–6)

**Goal:** Launch Biashara lending and Soko commerce; demonstrate cross-product data flow.

| Deliverable | Owner | Dependencies |
|---|---|---|
| Biashara MVP (loan application, approval, disbursement, repayment) | Backend + Mobile | Trust Engine V2 (revenue scoring) |
| Soko MVP (store URL, listings, WhatsApp bot, STK Push) | Backend + WhatsApp | M-Pesa C2B |
| Credit scoring V2 (incorporates chama + M-Pesa data) | Data Science | 3 months of chama data |
| Cross-product event integration (Chama ↔ Biashara ↔ Soko) | Backend | Kafka |
| M-Pesa Super App Mini Program (Chama + Biashara) | Mobile | Ant Group approval |

**Success Criteria:** 500 Biashara borrowers; 200 Soko sellers; first cross-product loan originated from chama credit data.

### 10.3 Phase 2: Gig + Insurance (Months 7–9)

**Goal:** Launch Kazi and Linda; complete the five-pillar ecosystem.

| Deliverable | Owner | Dependencies |
|---|---|---|
| Kazi MVP (AutoSave, per-ride insurance, emergency loans) | Backend + Mobile | Gig platform partnerships (SafeBoda, Bolt) |
| Linda MVP (gig accident cover, chama group life) | Backend + Insurance | Underwriter partnerships (Jubilee, CIC) |
| AI claims adjudication engine | Data Science | Training data from initial claims |
| Credit scoring V3 (all 5 product factors) | Data Science | 6 months of multi-product data |
| Tanzania expansion (Vodacom M-Pesa API) | Backend + Compliance | NIDA KYC integration |

**Success Criteria:** 10,000 Kazi active workers; 5,000 Linda policies; 3-country presence.

### 10.4 Phase 3: Scale + Intelligence (Months 10–12)

**Goal:** Deep cross-product integration, advanced analytics, regional expansion.

| Deliverable | Owner | Dependencies |
|---|---|---|
| Chama Group Orders (Soko integration) | Backend + WhatsApp | Both products at scale |
| Kazi Delivery (Soko integration) | Backend | Kazi rider network density |
| Linda Seller Shield (Soko integration) | Backend + Insurance | Soko seller transaction history |
| Advanced analytics dashboard (internal) | Data | All products generating data |
| Uganda + Rwanda expansion | All teams | Local KYC, regulatory approval |
| API platform for third-party developers | Backend | Stable core infrastructure |

**Success Criteria:** 200,000 MAU; 25% cross-sell rate; $1.8M annual revenue.

---

## 11. Open Questions

| # | Question | Impact | Owner | Target Resolution |
|---|---|---|---|---|
| 1 | Will Safaricom approve unified shortcode for all 5 products, or require separate codes per product? | Affects M-Pesa integration architecture | CEO/Compliance | Month 1 |
| 2 | What is exact Daraja 3.0 Ratiba API pricing and availability? | Affects AutoSave and recurring premium features | CTO | Month 1 |
| 3 | Can we get direct Huduma Namba API access for KYC, or must use third-party aggregator? | Affects KYC cost, latency, and accuracy | Compliance | Month 1 |
| 4 | Will gig platforms (SafeBoda, Bolt) agree to embed Kazi SDK vs. building their own financial services? | Affects Kazi distribution strategy | BD/Partnerships | Month 2 |
| 5 | What are CBK requirements for offering insurance as MGA vs. full insurer license? | Affects Linda regulatory path and capital requirements | Compliance | Month 2 |
| 6 | Should Soko maintain separate brand or be fully absorbed as "Twende Soko"? | Affects marketing, user perception, partner negotiations | Product/CEO | Month 2 |
| 7 | How do we handle data residency requirements across EAC countries (Kenya, Tanzania, Uganda, Rwanda)? | Affects cloud infrastructure architecture | CTO/Compliance | Month 3 |
| 8 | What is the optimal group size limit for chamas to maintain governance quality at scale? | Affects product rules and performance | Product | Month 3 |

---

*PRD Version 2.0 (Unified) — July 2026*  
*Next Review Date: August 2026 (post-Phase 0 architecture review)*  
*Document Owner: Product Team, TWENDE*
