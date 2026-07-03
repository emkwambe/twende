# Twende Chama — Product Requirements Document (PRD)

**Document Version:** 1.0  
**Date:** July 2026  
**Status:** Draft for Review  
**Owner:** Product Team, TWENDE  
**Classification:** Internal — Engineering, Design, QA

---

## 1. Executive Summary

### 1.1 Product Vision

Twende Chama is the **digital operating system for community savings groups** (chamas) across East Africa. It transforms the informal, cash-based, paper-recorded chama experience into a transparent, secure, and financially empowering digital platform built on M-Pesa rails. By digitizing contributions, automating record-keeping, enabling instant group loans, and building individual credit scores from collective savings behavior, Twende Chama becomes the **trust layer and entry point** for the broader TWENDE financial wellness ecosystem.

### 1.2 Problem Statement

Over **300,000 chamas** operate in Kenya alone, managing collective savings in the billions of dollars [^87^]. Yet the vast majority still rely on **physical cash collection at monthly meetings, handwritten ledgers maintained by a single treasurer, verbal loan agreements, and no individual credit history** from years of faithful participation. This creates five critical pain points that drive member dissatisfaction and limit financial growth:

| Pain Point | Impact on Members | Frequency |
|---|---|---|
| **Treasurer fraud / mismanagement** | Members lose trust; groups dissolve; savings stolen | 23% of chamas experience treasurer disputes annually |
| **Cash theft and loss** | Physical cash carried to/from meetings is vulnerable | Occurs in ~15% of groups per year |
| **Delayed loan access** | In-person meetings required for loan approval; urgent needs go unmet | Every loan cycle (weekly to monthly) |
| **No credit score building** | Years of disciplined saving produce zero formal credit history | Continuous — affects all members |
| **Limited investment options** | Group savings sit idle or are lent informally at high risk | Continuous — affects all groups |

### 1.3 Solution Overview

Twende Chama replaces the physical chama with a **mobile-first digital platform** accessible via three channels: a native **Flutter mobile app** (iOS/Android), an **M-Pesa Super App mini program**, and **USSD (*384*77#)** for feature phone users. Members contribute via M-Pesa C2B, all transactions are recorded on a transparent blockchain-anchored ledger, group loans are approved by digital vote and disbursed instantly, and every member's contribution history feeds into TWENDE's alternative credit scoring engine — unlocking pre-qualified microloans after six months of consistent participation.

### 1.4 Target Users

| Persona | Description | Device | Pain Point |
|---|---|---|---|
| **Wanjiku, 34** | Chama member, vegetable vendor in Nairobi. Contributes $30/month. Distrusts treasurer after previous group lost $400. | Android smartphone (TECNO) | Wants transparency; wants her savings visible to everyone |
| **Omondi, 42** | Chama treasurer, boda-boda rider. Manages 20-member group. Spends 4 hours/week on bookkeeping. | Feature phone + borrows smartphone for meetings | Wants to eliminate manual record-keeping; fears being accused of theft |
| **Amina, 28** | Chama admin, primary school teacher. Wants group to invest collectively. Has smartphone but no financial literacy tools. | iPhone | Wants group governance tools; wants investment options beyond real estate |
| **Mwangi, 55** | Rural farmer, member of 3 chamas. Walks 5km to monthly meetings. Uses feature phone exclusively. | Feature phone only | Needs to contribute without attending meetings; needs USSD access |

### 1.5 Success Metrics (12-Month Targets)

| Metric | Baseline | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| **Active chama groups** | 0 | 100 | 500 | 2,000 |
| **Registered members** | 0 | 2,000 | 10,000 | 40,000 |
| **Monthly transaction volume** | $0 | $50K | $250K | $1.2M |
| **Group loan disbursements** | $0 | $5K | $50K | $300K |
| **Member credit scores generated** | 0 | 500 | 3,000 | 15,000 |
| **Member retention (30-day)** | N/A | 70% | 78% | 85% |
| **Contribution success rate** | N/A | 85% | 92% | 95% |
| **NPS score** | N/A | 35 | 45 | 55 |

---

## 2. Feature Specifications

### 2.1 Feature Map

| Epic | Feature | Priority | Channel | Est. Effort |
|---|---|---|---|---|
| **User Management** | Registration & KYC | P0 | App / Mini App / USSD | 3 sprints |
| | Profile Management | P1 | App / Mini App | 1 sprint |
| | Multi-group Membership | P1 | App / Mini App / USSD | 2 sprints |
| **Chama Management** | Group Creation | P0 | App / Mini App | 2 sprints |
| | Member Invitation & Onboarding | P0 | App / Mini App / USSD / SMS | 2 sprints |
| | Role & Permission System | P0 | App / Mini App | 2 sprints |
| | Group Rules Configuration | P0 | App / Mini App | 2 sprints |
| **Contributions** | M-Pesa C2B Contribution | P0 | App / Mini App / USSD | 3 sprints |
| | Contribution Scheduling (Ratiba) | P1 | App / Mini App | 2 sprints |
| | Contribution Reminders | P1 | App / SMS / Push | 1 sprint |
| | Late Payment Tracking | P1 | App / Mini App | 1 sprint |
| **Group Ledger** | Real-time Transaction History | P0 | App / Mini App / USSD | 2 sprints |
| | Blockchain-anchored Records | P1 | Backend | 2 sprints |
| | Financial Reports & Export | P1 | App / Mini App | 1 sprint |
| **Group Loans** | Loan Request & Application | P0 | App / Mini App / USSD | 3 sprints |
| | Digital Voting & Approval | P0 | App / Mini App / USSD | 2 sprints |
| | Instant Disbursement (B2C) | P0 | Backend | 2 sprints |
| | Repayment Tracking | P0 | App / Mini App / USSD | 2 sprints |
| | Interest Calculation Engine | P1 | Backend | 1 sprint |
| **Credit Scoring** | Alternative Credit Score | P1 | Backend | 3 sprints |
| | Score Dashboard | P1 | App / Mini App | 1 sprint |
| | Pre-qualified Loan Offers | P1 | App / Mini App | 2 sprints |
| **Notifications** | SMS Notifications | P0 | Backend / SMS Gateway | 1 sprint |
| | Push Notifications | P1 | App / Mini App | 1 sprint |
| | WhatsApp Business Integration | P2 | Backend | 2 sprints |
| **Admin Tools** | Group Dashboard | P0 | App / Mini App | 2 sprints |
| | Member Management | P1 | App / Mini App | 1 sprint |
| | Audit Trail | P1 | Backend | 1 sprint |
| **Premium Features** | Investment Marketplace | P2 | App / Mini App | 4 sprints |
| | Group Insurance Access | P2 | App / Mini App | 3 sprints |
| | Advanced Analytics | P2 | App / Mini App | 2 sprints |

### 2.2 Detailed Feature Specifications

#### F-001: User Registration & KYC

**User Story:** As a new user, I want to register with my phone number and verify my identity so that I can join or create a chama on Twende Chama.

**Acceptance Criteria:**

| # | Criteria | Priority |
|---|---|---|
| 1 | User enters mobile number; system sends OTP via SMS within 30 seconds | P0 |
| 2 | User enters OTP; account created with phone number as primary identifier | P0 |
| 3 | System auto-fetches M-Pesa registered name via Daraja API for display name | P0 |
| 4 | User completes KYC tier 1: full name, national ID number, date of birth | P0 |
| 5 | System verifies national ID against Huduma Namba API (Kenya) or NIDA (Tanzania) | P1 |
| 6 | KYC tier 2 (required for loan access): selfie liveness check + ID document upload | P1 |
| 7 | KYC tier 3 (required for large loans >$500): address verification + CRB check | P2 |
| 8 | USSD users can complete registration entirely via *384*77# menu flow | P0 |
| 9 | Registration completes in under 3 minutes on app; under 5 minutes on USSD | P0 |

**UI Flow:**

```
[Welcome Screen] → [Enter Phone Number] → [OTP Input] → [Auto-fetch M-Pesa Name] 
→ [Enter National ID] → [ID Verification] → [Set PIN] → [KYC Tier Selection] 
→ [Dashboard / Create or Join Chama]
```

**Business Rules:**
- One phone number = one account. Duplicate numbers rejected.
- M-Pesa registered name used as default display name; user can customize.
- National ID must be unique per account; duplicate ID triggers manual review.
- KYC tier determines product access: Tier 1 = contributions only; Tier 2 = loans up to $200; Tier 3 = loans up to $1,000.
- Users under 18 cannot create or administer groups; can join as members with guardian consent.

---

#### F-002: Group Creation

**User Story:** As a chama organizer, I want to create a digital chama, set its rules, and invite members so that our group can start saving and lending transparently.

**Acceptance Criteria:**

| # | Criteria | Priority |
|---|---|---|
| 1 | User taps "Create Chama"; enters group name (3–50 chars), description (optional) | P0 |
| 2 | User sets contribution amount (min $5, max $500 per cycle) and frequency (weekly/bi-weekly/monthly) | P0 |
| 3 | User sets group type: savings-only, savings + loans, or investment chama | P0 |
| 4 | User configures loan rules: max loan amount (1×–3× contributions), interest rate (0%–10%/month), repayment period (1–12 months) | P0 |
| 5 | User sets governance rules: approval threshold (simple majority / 2/3 / unanimous), admin roles (1–3 admins), auto-approval for loans under threshold | P1 |
| 6 | User sets penalty rules: late contribution fee (0%–5%), loan default grace period (7–30 days) | P1 |
| 7 | System generates unique shortcode (5-digit number) for M-Pesa C2B contributions | P0 |
| 8 | System generates invite link (SMS/WhatsApp shareable) and QR code for member onboarding | P0 |
| 9 | Group created and active within 60 seconds of completion | P0 |

**UI Mockup Reference:** Group creation uses a 4-step wizard: (1) Basic Info, (2) Contribution Rules, (3) Loan Rules, (4) Governance & Invite.

**Business Rules:**
- Maximum 50 members per group (performance and governance optimization).
- Group shortcode is unique system-wide and permanently assigned.
- Creator becomes default admin; can assign up to 2 additional admins and 1 treasurer.
- Free tier: up to 15 members, basic features. Premium tier ($1/member/month): unlimited members, investment marketplace, group insurance, advanced analytics.
- Group rules can be amended by admin vote with 2/3 majority; amendments logged on blockchain.

---

#### F-003: M-Pesa C2B Contribution

**User Story:** As a chama member, I want to contribute my savings via M-Pesa so that my payment is instantly recorded and visible to all group members.

**Acceptance Criteria:**

| # | Criteria | Priority |
|---|---|---|
| 1 | Member taps "Contribute" on dashboard; system displays contribution amount input with presets | P0 |
| 2 | Member enters amount (must be >= group minimum contribution) | P0 |
| 3 | System displays payment confirmation with amount, group name, and M-Pesa phone number | P0 |
| 4 | Member taps "Pay via M-Pesa"; system initiates STK Push to member's registered phone | P0 |
| 5 | Member enters M-Pesa PIN on phone; payment processed via Safaricom | P0 |
| 6 | System receives C2B callback within 30 seconds; contribution recorded on group ledger | P0 |
| 7 | All group members receive real-time push notification + SMS: "[Name] contributed $[Amount] to [Group]" | P0 |
| 8 | Member's individual contribution tracker updates; group total updates; progress toward target recalculates | P0 |
| 9 | USSD users contribute by dialing *384*77# → Select Group → Enter Amount → Confirm → Enter M-Pesa PIN | P0 |
| 10 | Failed payments (insufficient balance, wrong PIN, timeout) trigger clear error message with retry option | P0 |

**UI Mockup:**

![Contribute Screen](twende_chama_ui_contribute.png)

**Business Rules:**
- Contribution amounts below group minimum are rejected with explanation.
- Contribution amounts above group maximum are accepted but flagged for admin review (may indicate error).
- Contributions are irreversible once confirmed on M-Pesa (no refunds except for system errors).
- Each contribution is assigned a unique transaction ID and anchored to the blockchain ledger within 5 minutes.
- Contribution timestamp uses EAT (UTC+3) for all records.
- System maintains a 30-second payment timeout; if callback not received, status shows "Processing" with auto-retry.

**Error Handling:**

| Error Code | User Message | Resolution |
|---|---|---|
| E001 | "Insufficient M-Pesa balance. Your balance is $X. Please top up and try again." | User tops up M-Pesa; retry |
| E002 | "M-Pesa PIN incorrect. Please try again. (2 attempts remaining)" | Re-enter PIN |
| E003 | "Payment timed out. Please check your network and try again." | Auto-retry once; then manual retry |
| E004 | "Contribution amount below minimum ($X). Please enter at least $X." | Enter valid amount |
| E005 | "M-Pesa service temporarily unavailable. Please try again in 5 minutes." | Retry with exponential backoff |

---

#### F-004: Real-Time Group Ledger

**User Story:** As a chama member, I want to see all group transactions in real time so that I can verify my contributions and monitor group financial health.

**Acceptance Criteria:**

| # | Criteria | Priority |
|---|---|---|
| 1 | Dashboard displays current group balance, total contributions this cycle, and progress toward monthly target | P0 |
| 2 | Transaction history shows all contributions, loan disbursements, loan repayments, and penalties with timestamps | P0 |
| 3 | Each transaction shows: member name, amount, type (contribution/loan/repayment/penalty), timestamp, transaction ID | P0 |
| 4 | Members can filter transactions by type, date range, and member name | P1 |
| 5 | Members can tap any transaction to view details including M-Pesa receipt number and blockchain anchor hash | P1 |
| 6 | Ledger updates within 5 seconds of transaction confirmation | P0 |
| 7 | Offline members see cached ledger data with "Last updated" timestamp | P1 |
| 8 | Treasurers and admins can export ledger as PDF or CSV | P1 |
| 9 | USSD users can view last 5 transactions via menu option | P0 |

**UI Mockup:**

![Dashboard Screen](twende_chama_ui_dashboard.png)

**Business Rules:**
- Ledger data is immutable after 24 hours (prevents retroactive tampering).
- All financial transactions include a blockchain anchor hash for auditability.
- Transaction history retained for 7 years (regulatory compliance).
- Members can dispute a transaction within 7 days; disputes trigger admin review workflow.
- System calculates and displays: total contributions per member, outstanding loans, interest accrued, and group net worth.

---

#### F-005: Group Loan Request & Digital Voting

**User Story:** As a chama member, I want to request a loan from my group's savings and have it approved through a transparent digital vote so that I can access funds quickly for emergencies or opportunities.

**Acceptance Criteria:**

| # | Criteria | Priority |
|---|---|---|
| 1 | Member taps "Request Loan"; enters amount (max determined by group rules: 1×–3× total contributions) | P0 |
| 2 | Member provides loan purpose (select from categories: emergency, business, education, medical, agriculture, other) | P0 |
| 3 | Member selects repayment period (within group-configured range: 1–12 months) | P0 |
| 4 | System displays loan terms: interest rate, total repayment amount, installment amount, due dates | P0 |
| 5 | System auto-calculates credit score boost if loan is repaid on time | P1 |
| 6 | Member confirms request; system initiates digital vote to all eligible members | P0 |
| 7 | Members receive vote notification (push + SMS) with loan details and Approve/Reject buttons | P0 |
| 8 | Voting period: 24 hours (configurable by group: 6–72 hours) | P0 |
| 9 | Vote reaches configured threshold (simple majority / 2/3 / unanimous); system auto-disburses via M-Pesa B2C | P0 |
| 10 | If approved, funds reach borrower's M-Pesa within 5 minutes of vote completion | P0 |
| 11 | If rejected, borrower receives explanation with option to reapply with modifications | P0 |
| 12 | USSD users can request loans and vote entirely via *384*77# | P0 |

**UI Flow:**

```
[Dashboard] → [Request Loan] → [Enter Amount] → [Select Purpose] → [Select Repayment Period]
→ [Review Terms] → [Confirm Request] → [Vote Initiated] → [Wait for Votes]
→ [Approved: Funds Disbursed] OR [Rejected: Reapply]
```

**Business Rules:**
- Loan amount cannot exceed 3× member's total contributions to the group.
- Members with outstanding loans >30 days overdue cannot request new loans.
- Members who have missed 2+ consecutive contributions lose loan eligibility until caught up.
- Auto-approval: loans under $50 (configurable) approved instantly if borrower's credit score >600 and no delinquencies.
- Interest accrues daily from disbursement date; early repayment reduces total interest.
- Default handling: after 30-day grace period, admin can vote to extend, restructure, or write off (with penalty to borrower's credit score).

---

#### F-006: Alternative Credit Scoring

**User Story:** As a chama member, I want my savings discipline to build a credit score that unlocks better loan terms and access to other financial products.

**Acceptance Criteria:**

| # | Criteria | Priority |
|---|---|---|
| 1 | System generates credit score (300–850 scale) for every member after 30 days of activity | P1 |
| 2 | Score is based on: contribution consistency (40%), contribution amount vs. commitment (25%), loan repayment history (25%), group tenure (10%) | P1 |
| 3 | Score updates in real time after each contributing event | P1 |
| 4 | Member can view score, score history graph, and factors affecting score | P1 |
| 5 | Score unlocks pre-qualified loan offers: 500+ = loans up to $100; 600+ = loans up to $300; 700+ = loans up to $1,000 | P1 |
| 6 | Score improvement tips displayed ("Contribute consistently for 3 more months to unlock $500 loans") | P2 |
| 7 | Score is portable across all TWENDE products (Biashara, Kazi, Linda) | P1 |
| 8 | Score shared with partner lenders (with member consent) for preferential rates | P2 |

**Scoring Algorithm (V1):**

| Factor | Weight | Calculation |
|---|---|---|
| **Contribution Consistency** | 40% | % of scheduled contributions made on time over last 6 months. Score = (on-time contributions / total due) × 340 + 300 |
| **Contribution Amount** | 25% | Average contribution as % of committed amount. Score = (avg contribution / committed) × 212.5 + 300 |
| **Loan Repayment** | 25% | On-time repayment rate. Score = (on-time repayments / total repayments) × 212.5 + 300 |
| **Group Tenure** | 10% | Months as active member. Score = min(tenure months × 5, 85) + 300 |

**Example:** A member who contributed on time 90% of the time (score component: 606), at 100% of committed amount (512), with 100% loan repayment (512), and 12 months tenure (360) = weighted average of approximately **680**.

---

### 2.3 User Flow Diagrams

#### Primary Flow: New Member Onboarding & First Contribution

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Discovers   │────▶│  2. Downloads   │────▶│  3. Registers   │
│   Twende Chama  │     │   App / Opens   │     │  with Phone +   │
│  (via friend /  │     │   Mini App /    │     │      OTP        │
│  agent / M-Pesa │     │   Dials USSD    │     │                 │
│    Super App)   │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                              ┌──────────────────────────┘
                              ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. Makes First │◀────│  5. Joins Group │◀────│  4. Completes   │
│   Contribution  │     │  (via invite    │     │   KYC Tier 1    │
│   via M-Pesa    │     │   link / search │     │  (Name + ID)    │
│                 │     │   / USSD code)  │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 7. Receives     │────▶│ 8. Sees Ledger  │────▶│ 9. Receives     │
│   Confirmation  │     │   Update with   │     │   Welcome SMS   │
│   (Push + SMS)  │     │   Their Payment │     │   + Next Due    │
│                 │     │                 │     │   Date          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### Loan Request & Disbursement Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Member taps │────▶│  2. System      │────▶│  3. Member      │
│  "Request Loan" │     │  validates      │     │  enters amount, │
│                 │     │  eligibility    │     │  purpose, term  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │ (checks: KYC,
                                 │  contribution
                                 │  history, no
                                 │  delinquencies)
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
           ┌──────────────┐          ┌──────────────┐
           │   ELIGIBLE   │          │  INELIGIBLE  │
           │  (proceed)   │          │ (show reason │
           └──────┬───────┘          │  + next steps)│
                  │                  └──────────────┘
                  ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  4. System      │────▶│  5. Digital vote│────▶│  6. Vote        │
│  displays loan  │     │  sent to all    │     │  reaches        │
│  terms; member  │     │  eligible       │     │  threshold      │
│  confirms       │     │  members        │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                              ┌──────────────────────────┘
                              ▼
                    ┌──────────────┐
                    │   APPROVED   │
                    │  B2C disburse│
                    │  within 5min │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │   REJECTED   │
                    │  (notify with│
                    │   reason)    │
                    └──────────────┘
```

---

## 3. UI/UX Requirements

### 3.1 Design System

Twende Chama follows a **consistent design system** optimized for East African users with varying levels of digital literacy.

| Element | Specification | Rationale |
|---|---|---|
| **Primary Color** | #0A2463 (Deep Ocean Blue) | Trust, stability, professionalism |
| **Secondary Color** | #FF6B35 (Sunrise Orange) | Action, energy, distinctly African warmth |
| **Success Color** | #2ECC71 (Fresh Green) | Contributions, approvals, positive actions |
| **Error Color** | #E74C3C (Alert Red) | Failures, warnings, overdue payments |
| **Background** | #F8F9FA (Light Gray) | Clean, reduces eye strain |
| **Card Background** | #FFFFFF (White) | Content separation, depth |
| **Typography** | Inter ( headings ), Roboto ( body ) | Highly legible, supports Swahili/English |
| **Base Font Size** | 16px (body), 14px (secondary), 24px (headings) | Readable for users 35+ with vision challenges |
| **Touch Target** | Minimum 48×48dp | Accessible for users with motor control limitations |
| **Border Radius** | 12px (cards), 8px (buttons), 24px (floating elements) | Friendly, approachable aesthetic |
| **Shadow** | 0 2px 8px rgba(0,0,0,0.08) | Subtle depth without heaviness |
| **Animation** | 200ms ease-in-out transitions | Fast enough to feel responsive; slow enough to perceive |

### 3.2 Screen Specifications

#### Screen 1: Dashboard (Home)

![Dashboard](twende_chama_ui_dashboard.png)

| Component | Specification |
|---|---|
| **Header** | Group name + member count (left); Total savings (right); hamburger menu for group switcher |
| **Progress Ring** | Large circular progress indicator showing % of monthly target reached; center displays dollar amount saved |
| **Action Buttons** | Three primary CTAs in a row: "Contribute" (green, full-width on mobile), "Request Loan" (blue), "Invite Member" (orange) |
| **Activity Feed** | Scrollable list of last 10 transactions; each item: avatar, name, action type + amount, timestamp, transaction status icon |
| **Bottom Nav** | 5 tabs: Home (active), Members, Loans, History, Settings |
| **Pull-to-refresh** | Refreshes all dashboard data from server |
| **Empty State** | "No activity yet. Be the first to contribute!" with CTA button |

#### Screen 2: Contribution Flow

![Contribute](twende_chama_ui_contribute.png)

| Component | Specification |
|---|---|
| **Header** | "Make Contribution" with back arrow |
| **Balance Card** | Two-column layout: Group Balance (left), Your Share (right) |
| **Amount Input** | Large, prominent input field with $ prefix; numeric keyboard; presets ($10, $25, $50, $100) as quick-select chips |
| **Payment Method** | M-Pesa card showing masked phone number (****6789) with checkmark; "Change" option to select alternate M-Pesa number |
| **Confirm Button** | Full-width green "Confirm & Pay" button with M-Pesa logo |
| **Disclosure** | Small text: "Your contribution will be recorded on the group ledger and visible to all members" |
| **Loading State** | "Processing payment..." with M-Pesa spinner animation |
| **Success State** | Green checkmark animation + "Contribution successful!" + updated balance |
| **Error State** | Red banner with error code, message, and retry button |

#### Screen 3: Members List

![Members](twende_chama_ui_members.png)

| Component | Specification |
|---|---|
| **Header** | Group name + "Members" + total count |
| **Search Bar** | Filter members by name |
| **Member Cards** | Horizontal card: circular avatar, name, role badge (Admin/Treasurer/Member), contribution status (Paid/Pending/Overdue), individual contribution amount, mini progress bar |
| **Sorting** | Default: admin first, then alphabetical; toggle: by contribution status |
| **FAB** | Orange floating "+" button to invite new member |
| **Member Detail** | Tap card → full profile: contribution history, loan status, credit score, admin actions (promote, remove, view KYC) |

### 3.3 Accessibility Requirements

| Requirement | Implementation |
|---|---|
| **Screen reader support** | All UI elements labeled with content descriptions (TalkBack/VoiceOver compatible) |
| **Color contrast** | All text meets WCAG 2.1 AA standard (4.5:1 for normal text, 3:1 for large text) |
| **Font scaling** | App supports system font scaling up to 200% without layout breakage |
| **High contrast mode** | Support for Android/iOS high contrast accessibility settings |
| **Reduced motion** | Respect system reduced-motion preference; disable animations |
| **Touch targets** | All interactive elements minimum 48×48dp |
| **USSD accessibility** | Menu options numbered (1, 2, 3...); spoken via phone's TTS if enabled |
| **Language** | Primary: English; Secondary: Swahili (all UI strings externalized for i18n); Future: Luo, Kikuyu, Kamba |

---

## 4. Business Logic & Rules

### 4.1 Group Lifecycle State Machine

```
[CREATED] ──(first member joins)──▶ [ACTIVE]
   │                                    │
   │                              (all members leave)
   │                                    ▼
   │                              [ARCHIVED]
   │                                    │
   │                              (admin reactivates)
   │                                    ▼
   │                              [ACTIVE]
   │
   └──(creator deletes within 24h, no members)──▶ [DELETED]
```

| State | Description | Allowed Actions |
|---|---|---|
| **CREATED** | Group configured, no members yet | Invite members, edit settings, delete |
| **ACTIVE** | Group has 2+ members, accepting contributions | All features enabled |
| **ARCHIVED** | All members left or admin archived | Read-only ledger view; can be reactivated |
| **DELETED** | Permanently removed (soft delete) | None; data retained for 7 years per regulation |
| **SUSPENDED** | Admin suspended due to dispute or fraud investigation | Read-only; admin appeal process |

### 4.2 Financial Calculation Engine

#### Contribution Tracking

```
member_contribution_balance = SUM(all confirmed contributions) 
                              - SUM(all loan principal taken)
                              + SUM(all loan principal repaid)
                              - SUM(all penalties paid)

group_total_balance = SUM(all member contribution balances)

group_monthly_target = member_count × contribution_amount

group_monthly_progress = SUM(current month contributions) / group_monthly_target × 100
```

#### Loan Interest Calculation (Reducing Balance)

```
monthly_interest_rate = group_configured_rate (e.g., 5% = 0.05)

monthly_installment = (principal × monthly_rate × (1 + monthly_rate)^term) 
                       / ((1 + monthly_rate)^term - 1)

total_repayment = monthly_installment × term
total_interest = total_repayment - principal

# Example: $100 loan, 5% monthly, 3 months
# monthly_installment = (100 × 0.05 × 1.05^3) / (1.05^3 - 1) = $36.72
# total_repayment = $110.16
# total_interest = $10.16
```

#### Late Payment Penalty

```
days_overdue = current_date - due_date

if days_overdue <= grace_period:
    penalty = 0
elif days_overdue <= 30:
    penalty = contribution_amount × 0.02 × days_overdue
else:
    penalty = contribution_amount × 0.05 × days_overdue  # escalated
    + member credit score reduction: -50 points
    + loan eligibility suspension
```

### 4.3 Notification Matrix

| Event | SMS | Push | In-App | Email | Timing |
|---|---|---|---|---|---|
| Contribution received | Yes | Yes | Yes | No | Instant |
| Contribution failed | Yes | Yes | Yes | No | Instant |
| Contribution due (reminder) | Yes | Yes | Yes | No | 24h before due |
| Contribution overdue | Yes | Yes | Yes | No | Day after due |
| Loan request submitted | Yes | Yes | Yes | No | Instant |
| Loan vote requested | Yes | Yes | Yes | No | Instant |
| Loan approved / rejected | Yes | Yes | Yes | No | Instant |
| Loan disbursement | Yes | Yes | Yes | No | Instant |
| Loan repayment due | Yes | Yes | Yes | No | 3 days before |
| Member joined group | No | Yes | Yes | No | Instant |
| Member left group | No | Yes | Yes | No | Instant |
| Group rules changed | Yes | No | Yes | No | Within 1 hour |
| Credit score updated | No | Yes | Yes | No | Weekly digest |
| Weekly summary | Yes | No | Yes | No | Every Monday 8am |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Requirement | Measurement |
|---|---|---|
| **App launch time** | < 3 seconds (cold start) | Firebase Performance Monitoring |
| **Screen transition** | < 200ms | Manual + automated testing |
| **Contribution processing** | < 30 seconds end-to-end (tap to confirmation) | Transaction logs |
| **Loan disbursement** | < 5 minutes (vote complete to M-Pesa receipt) | Transaction logs |
| **Ledger refresh** | < 5 seconds after transaction | Real-time monitoring |
| **API response time (p95)** | < 500ms | APM (Datadog/New Relic) |
| **USSD session timeout** | 2 minutes per menu interaction | Gateway logs |
| **Offline mode** | Core data cached; contributions queued for sync | Manual testing |

### 5.2 Reliability & Availability

| Metric | Requirement |
|---|---|
| **Uptime SLA** | 99.9% (max 43 minutes downtime/month) |
| **M-Pesa integration uptime** | 99.5% (degraded gracefully during outages) |
| **Data backup** | Real-time replication; point-in-time recovery to 24 hours |
| **Disaster recovery** | RPO < 1 hour, RTO < 4 hours |
| **Transaction integrity** | Zero data loss for financial transactions; all-or-nothing atomic operations |

### 5.3 Security

| Requirement | Implementation |
|---|---|
| **Data encryption at rest** | AES-256 for all database storage |
| **Data encryption in transit** | TLS 1.3 for all API communications |
| **PIN protection** | 4-digit app PIN + biometric (fingerprint/face) option |
| **M-Pesa PIN** | Never stored; always entered by user on device |
| **Session management** | JWT tokens with 24-hour expiry; refresh token rotation |
| **Rate limiting** | 100 requests/minute per user; 1000/hour |
| **Fraud detection** | Velocity checks (max 5 contributions/minute); anomaly detection on transaction patterns |
| **Audit logging** | All admin actions, rule changes, and financial transactions logged immutably |
| **Blockchain anchoring** | Daily hash of all transactions anchored to Hyperledger for tamper-proof audit trail |

### 5.4 Scalability

| Metric | Year 1 Target | Year 3 Target |
|---|---|---|
| **Concurrent users** | 1,000 | 10,000 |
| **Transactions per second** | 50 | 500 |
| **Active groups** | 2,000 | 50,000 |
| **Registered members** | 40,000 | 500,000 |
| **Data storage** | 500 GB | 10 TB |

---

## 6. Integration Requirements

### 6.1 M-Pesa Daraja 3.0 APIs

| Integration | API Endpoint | Purpose | Frequency |
|---|---|---|---|
| **STK Push** | `POST /mpesa/stkpush/v1/processrequest` | Initiate contribution payment from app | Per contribution |
| **C2B Register URL** | `POST /mpesa/c2b/v2/registerurl` | Register validation and confirmation URLs for group shortcode | Once per group |
| **C2B Validation** | Webhook `POST /webhook/c2b/validation` | Validate incoming contribution before processing | Per C2B payment |
| **C2B Confirmation** | Webhook `POST /webhook/c2b/confirmation` | Receive confirmation of successful contribution | Per C2B payment |
| **B2C Disbursement** | `POST /mpesa/b2c/v1/paymentrequest` | Disburse approved loan to borrower's M-Pesa | Per loan approval |
| **Transaction Status** | `POST /mpesa/transactionstatus/v1/query` | Query status of pending transactions | Every 30s for pending |
| **Account Balance** | `POST /mpesa/accountbalance/v1/query` | Monitor group float balance | Hourly |
| **Ratiba (Recurring)** | `POST /mpesa/ratiba/v1/schedule` | Schedule automatic recurring contributions | Per schedule creation |

### 6.2 Third-Party Integrations

| Service | Purpose | Integration Type |
|---|---|---|
| **Huduma Namba API (Kenya)** | KYC identity verification | REST API |
| **NIDA API (Tanzania)** | KYC identity verification | REST API |
| **CRB Kenya / Metropol** | Credit bureau check for Tier 3 KYC | REST API |
| **SMS Gateway (Twilio / Africa's Talking)** | SMS notifications and OTP | REST API |
| **Firebase Cloud Messaging** | Push notifications | SDK |
| **Hyperledger Fabric** | Blockchain transaction anchoring | REST API / SDK |
| **S3 / CloudFront** | Document storage and CDN | SDK |
| **Mixpanel / Amplitude** | Product analytics | SDK |
| **Datadog / New Relic** | Application performance monitoring | Agent |

---

## 7. Analytics & Reporting

### 7.1 Product Analytics Events

| Event Name | Trigger | Properties |
|---|---|---|
| `user_registered` | Account creation | `channel`, `kyc_tier`, `device_type`, `referral_source` |
| `group_created` | Group creation complete | `group_type`, `member_limit`, `contribution_frequency`, `has_loans` |
| `member_joined_group` | Member accepts invite | `invite_method`, `time_to_join`, `group_size_before` |
| `contribution_initiated` | User taps "Contribute" | `amount`, `group_id`, `channel` |
| `contribution_successful` | C2B confirmation received | `amount`, `mpesa_receipt`, `processing_time_ms` |
| `contribution_failed` | C2B failed or timeout | `amount`, `error_code`, `failure_reason` |
| `loan_requested` | Loan request submitted | `amount`, `purpose`, `term`, `credit_score` |
| `loan_approved` | Vote reaches threshold | `amount`, `voter_count`, `approval_percentage`, `disbursement_time_ms` |
| `loan_repaid` | Repayment confirmation | `amount`, `days_early_or_late`, `payment_method` |
| `credit_score_updated` | Score recalculation | `old_score`, `new_score`, `change_reason` |
| `premium_upgraded` | Group upgrades to premium | `previous_tier`, `new_tier`, `payment_method` |

### 7.2 Business Dashboards (Internal)

| Dashboard | Metrics | Audience |
|---|---|---|
| **Executive Summary** | Revenue, active groups, total AUM, NPS, churn rate | C-suite, Investors |
| **Growth Funnel** | Registration → KYC → Group join → First contribution → Recurring contribution | Product, Growth |
| **Transaction Health** | Success rate, processing time, failure reasons, M-Pesa uptime | Engineering, Ops |
| **Loan Performance** | Disbursement volume, NPL rate, default rate by group type, recovery rate | Risk, Finance |
| **Credit Scoring** | Score distribution, score improvement trajectories, loan performance by score band | Data Science, Risk |
| **User Engagement** | DAU/MAU, session duration, feature usage, cross-product adoption | Product |

---

## 8. Release Plan

### 8.1 MVP Scope (Month 1–3)

| Feature | Status |
|---|---|
| User registration (phone + OTP) | Included |
| KYC Tier 1 (name + national ID) | Included |
| Group creation (basic: name, contribution amount, frequency) | Included |
| Member invitation (SMS link) | Included |
| M-Pesa C2B contribution (STK Push) | Included |
| Real-time group ledger | Included |
| Basic loan request + digital voting | Included |
| M-Pesa B2C loan disbursement | Included |
| SMS notifications (contributions, loans, votes) | Included |
| USSD basic contribution flow (*384*77#) | Included |
| Admin dashboard (member list, basic reports) | Included |

### 8.2 Post-MVP Roadmap

| Phase | Timeline | Features |
|---|---|---|
| **v1.1** | Month 4 | Push notifications, contribution scheduling (Ratiba), credit scoring v1, late payment tracking |
| **v1.2** | Month 5 | M-Pesa Super App mini program, KYC Tier 2 (selfie + ID upload), loan repayment tracking |
| **v1.3** | Month 6 | Premium tier launch, group insurance integration, advanced analytics dashboard |
| **v2.0** | Month 8 | Investment marketplace, multi-group membership, WhatsApp Business integration |
| **v2.1** | Month 10 | Tanzania expansion (NIDA KYC, Vodacom M-Pesa API), Swahili full localization |
| **v2.2** | Month 12 | Uganda expansion, API platform for third-party developers, advanced credit scoring v2 |

---

## 9. Open Questions & Assumptions

| # | Question | Impact | Owner | Target Resolution |
|---|---|---|---|---|
| 1 | Will Safaricom approve our M-Pesa shortcode application within 4 weeks? | Blocks all contribution functionality | CEO / Compliance | Month 1 |
| 2 | What is the exact pricing for Daraja 3.0 Ratiba API? | Affects contribution scheduling feature prioritization | CTO | Month 2 |
| 3 | Can we get direct API access to Huduma Namba for KYC verification? | Affects KYC flow design and fraud risk | Compliance | Month 1 |
| 4 | What are CBK's specific requirements for Digital Credit Provider licensing? | Determines regulatory timeline and capital requirements | Compliance | Month 1 |
| 5 | Should we build our own USSD gateway or use Africa's Talking / Twilio? | Affects USSD architecture and cost | CTO | Month 1 |
| 6 | What is the optimal group size limit for governance and performance? | Affects group creation rules | Product | Month 2 |
| 7 | Will M-Pesa Mini App approval process add >2 weeks to launch timeline? | Affects v1.2 timeline | Product | Month 3 |

### 9.1 Key Assumptions

1. **M-Pesa C2B callback reliability:** We assume 95%+ callback success rate from Safaricom; fallback polling mechanism will handle the remaining 5%.
2. **User smartphone penetration:** We assume 60% of target chama members have smartphones (Android primarily); USSD serves the remaining 40%.
3. **Agent network willingness:** We assume M-Pesa agents will onboard chama groups for $1–2 per group commission; pilot will validate this.
4. **Group treasurer acceptance:** We assume treasurers will adopt the platform when shown time savings and fraud protection; free tier reduces friction.
5. **M-Pesa transaction cost pass-through:** We assume members accept paying standard M-Pesa fees for contributions; group may optionally subsidize.

---

*PRD Version 1.0 — July 2026*  
*Next Review Date: August 2026*  
*Document Owner: Product Team, TWENDE*
