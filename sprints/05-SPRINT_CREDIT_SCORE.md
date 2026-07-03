# Sprint 05: Credit Scoring & Trust Engine

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-05 |
| **Title** | Credit Scoring & Trust Engine |
| **Duration** | 3 weeks |
| **Priority** | P0 — Core Differentiator |
| **Dependency** | SPRINT-02 (Backend API), SPRINT-04 (M-Pesa) |
| **Parallelizable** | Partial — UI components can be built in parallel with engine |
| **Owner** | Data Science + Backend Team |

---

## 1. Objective

Build the **Trust Engine** — TWENDE's alternative credit scoring system that evaluates financial trustworthiness for users excluded from formal credit bureaus. This is the single most important technical differentiator: it transforms M-Pesa transaction history, chama savings behavior, Soko sales patterns, gig work completion rates, and insurance payment discipline into a **300-850 credit score** that unlocks lending across all products.

The Trust Engine must be **explainable** (users see WHY their score is what it is), **fair** (no bias against informal workers), and **real-time** (score updates within 15 minutes of new data).

---

## 2. User Stories

### Story 5.1 — View My Credit Score
> **As a** TWENDE user, **I want** to see my credit score and understand what factors influence it, **so that** I can take actions to improve my financial standing.

**Acceptance Criteria:**
- Score displayed as 3-digit number (300-850) with color coding (red <500, yellow 500-650, green 650-750, gold 750+)
- Circular progress visualization showing score position
- Breakdown of 7 factor categories with individual sub-scores
- "What-If" simulator: "If I save KES 5,000 more monthly, my score could improve by X points"
- Trend line showing score history over 6 months
- Shareable score card for loan applications (PDF generation)

**UI Flow:** `/trust/score` → Load score page → Fetch `/api/v1/trust/score` → Display visualization

### Story 5.2 — Score-Based Loan Eligibility
> **As a** Biashara user, **I want** the system to automatically calculate my maximum loan amount and interest rate based on my Trust Score, **so that** I get fair, personalized credit offers.

**Acceptance Criteria:**
- Loan calculator pre-fills max amount based on score tier
- Interest rates: Tier 1 (24% p.a.), Tier 2 (18% p.a.), Tier 3 (14% p.a.), Tier 4 (10% p.a.)
- Max loan amounts: Tier 1 (KES 5,000), Tier 2 (KES 50,000), Tier 3 (KES 200,000), Tier 4 (KES 500,000)
- Real-time API: `POST /api/v1/biashara/eligibility` returns `{maxAmount, interestRate, tenureOptions, monthlyRepayment}`
- Decision rendered in <2 seconds
- Declined applications show specific improvement actions

### Story 5.3 — Chama-Based Credit Boost
> **As a** chama member, **I want** my consistent savings and group participation to improve my credit score, **so that** my discipline is rewarded with better loan terms.

**Acceptance Criteria:**
- Chama savings history contributes 20% to total score
- On-time contributions tracked monthly
- Group officer role adds bonus points (+15 points)
- Cross-guarantee: chama members can co-guarantee loans (reduces interest by 2%)
- API: `POST /api/v1/trust/chama-boost` calculates chama contribution
- Score update triggered within 15 minutes of contribution

### Story 5.4 — Soko Sales Credit Factor
> **As a** Soko merchant, **I want** my sales volume and customer ratings to count toward my credit score, **so that** my business performance unlocks working capital loans.

**Acceptance Criteria:**
- Soko GMV (Gross Merchandise Value) contributes up to 20% of score
- Customer rating average (1-5 stars) weighted into score
- Order fulfillment rate (>95% = bonus, <80% = penalty)
- Inventory turnover ratio tracked
- API: `POST /api/v1/trust/soko-factor` processes daily sales data
- Merchant score displayed in Soko dashboard

### Story 5.5 — Gig Work Income Verification
> **As a** Kazi gig worker, **I want** my completed gigs and employer ratings to build my credit profile, **so that** I can access credit even without a formal payslip.

**Acceptance Criteria:**
- Completed gigs count as income verification (10% of score)
- Employer ratings (1-5 stars) weighted
- Gig category diversity bonus (multiple skills = higher score)
- On-time completion rate tracked
- API: `POST /api/v1/trust/kazi-factor` processes gig completion events
- Income trend visualization (3-month rolling average)

---

## 3. Technical Specification

### 3.1 Credit Scoring Algorithm

The **TWENDE Trust Score** is calculated using a weighted multi-factor model:

```typescript
interface TrustScoreFactors {
  // 1. Chama Savings Behavior (20% weight)
  chama: {
    contributionConsistency: number;   // 0-100, monthly on-time %
    savingsVolume: number;             // normalized KES amount
    groupTenure: number;               // months in chama
    leadershipRole: boolean;           // officer = bonus
  };

  // 2. M-Pesa Transaction History (15% weight)
  mpesa: {
    transactionVolume: number;         // normalized monthly volume
    transactionFrequency: number;      // transactions per week
    balanceStability: number;          // coefficient of variation
    airtimePurchase: number;           // consistent small purchases
  };

  // 3. Soko Sales Performance (20% weight)
  soko: {
    gmv: number;                       // gross merchandise value
    customerRating: number;            // 1-5 average
    fulfillmentRate: number;           // % orders fulfilled
    inventoryTurnover: number;         // days to sell inventory
  };

  // 4. Loan Repayment History (25% weight — HIGHEST)
  loans: {
    repaymentRate: number;             // % on-time repayments
    activeLoans: number;               // count (penalty if >2)
    defaultHistory: boolean;           // any defaults
    creditUtilization: number;         % of available credit used
  };

  // 5. Gig Work Income (10% weight)
  kazi: {
    gigsCompleted: number;             // monthly count
    employerRating: number;            // 1-5 average
    incomeStability: number;           // coefficient of variation
    skillDiversity: number;            // unique categories
  };

  // 6. Insurance Payment Discipline (5% weight)
  linda: {
    premiumConsistency: number;        // % on-time payments
    claimsHistory: number;             // claim frequency (negative)
    policyTenure: number;              // months insured
    noClaimBonus: boolean;             // 12 months no claims
  };

  // 7. KYC Verification Depth (5% weight)
  kyc: {
    tier: 1 | 2 | 3;                   // verification level
    idVerified: boolean;
    addressVerified: boolean;
    biometricEnrolled: boolean;
  };
}
```

### 3.2 Score Calculation Formula

```typescript
function calculateTrustScore(factors: TrustScoreFactors): number {
  // Each factor produces a 0-100 sub-score
  const chamaScore = calculateChamaScore(factors.chama);           // 0-100
  const mpesaScore = calculateMpesaScore(factors.mpesa);           // 0-100
  const sokoScore = calculateSokoScore(factors.soko);              // 0-100
  const loanScore = calculateLoanScore(factors.loans);             // 0-100
  const kaziScore = calculateKaziScore(factors.kazi);              // 0-100
  const lindaScore = calculateLindaScore(factors.linda);           // 0-100
  const kycScore = calculateKycScore(factors.kyc);                 // 0-100

  // Weighted composite (maps to 300-850 range)
  const rawScore =
    chamaScore * 0.20 +
    mpesaScore * 0.15 +
    sokoScore * 0.20 +
    loanScore * 0.25 +
    kaziScore * 0.10 +
    lindaScore * 0.05 +
    kycScore * 0.05;

  // Map 0-100 to 300-850
  return Math.round(300 + (rawScore / 100) * 550);
}
```

### 3.3 Score Tiers

| Tier | Score Range | Risk Level | Max Loan | Interest Rate | Loan Tenure | Features Unlocked |
|------|------------|------------|----------|---------------|-------------|-------------------|
| **Tier 1** | 300-499 | High Risk | KES 5,000 | 24% p.a. | 1-4 weeks | Emergency micro-loans only |
| **Tier 2** | 500-649 | Medium Risk | KES 50,000 | 18% p.a. | 1-6 months | Standard loans, chama credit |
| **Tier 3** | 650-749 | Low Risk | KES 200,000 | 14% p.a. | 1-12 months | Premium rates, overdraft, insurance premium financing |
| **Tier 4** | 750-850 | Very Low Risk | KES 500,000 | 10% p.a. | 1-24 months | Best rates, revolving credit, business loans, co-guarantee |

### 3.4 Score Update Triggers

The Trust Score is **recalculated** on these events:

| Event | Latency | Weight Affected |
|-------|---------|-----------------|
| Chama contribution recorded | 15 min | Chama (20%) |
| M-Pesa transaction received | 1 hour | M-Pesa (15%) |
| Soko order completed | 30 min | Soko (20%) |
| Loan repayment made | Real-time | Loans (25%) |
| Gig marked complete | 15 min | Kazi (10%) |
| Insurance premium paid | 1 hour | Linda (5%) |
| KYC tier upgraded | Real-time | KYC (5%) |
| Daily batch recalculation | Daily midnight | All (recency decay) |

### 3.5 Database Schema

```sql
-- Trust Score table (one row per user, updated in-place)
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Overall score
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
  tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 4),
  
  -- Factor sub-scores (0-100 each)
  chama_score INTEGER NOT NULL DEFAULT 0,
  mpesa_score INTEGER NOT NULL DEFAULT 0,
  soko_score INTEGER NOT NULL DEFAULT 0,
  loan_score INTEGER NOT NULL DEFAULT 0,
  kazi_score INTEGER NOT NULL DEFAULT 0,
  linda_score INTEGER NOT NULL DEFAULT 0,
  kyc_score INTEGER NOT NULL DEFAULT 0,
  
  -- Score history (last 6 months, monthly snapshots)
  history JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_scheduled_calculation TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 day',
  calculation_reason VARCHAR(50) NOT NULL DEFAULT 'initial',
  
  -- Versioning for audit
  version INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Score events (audit trail — append-only)
CREATE TABLE trust_score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,  -- 'chama_contribution', 'loan_repayment', etc.
  factor VARCHAR(20) NOT NULL,      -- which factor was affected
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_trust_scores_user ON trust_scores(user_id);
CREATE INDEX idx_trust_score_events_user ON trust_score_events(user_id, created_at DESC);
CREATE INDEX idx_trust_score_events_type ON trust_score_events(event_type, created_at DESC);

-- Loan eligibility cache (pre-computed for fast API response)
CREATE TABLE loan_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product VARCHAR(20) NOT NULL,     -- 'biashara', 'chama', 'soko'
  max_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_options INTEGER[] NOT NULL, -- [1, 3, 6, 12] months
  monthly_repayment DECIMAL(12,2) NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, product)
);
```

### 3.6 API Endpoints

```yaml
# Trust Score API
GET /api/v1/trust/score
  Response: { score, tier, factors: {...}, history: [...], lastUpdated }
  Auth: Bearer token (own score only, admin can view any)
  Cache: 5 minutes client-side

POST /api/v1/trust/recalculate
  Body: { userId, reason }
  Response: { score, tier, changes: [...] }
  Auth: Admin or system service account
  Rate limit: 10/minute per user

POST /api/v1/trust/simulate
  Body: { scenario: "increase_savings", amount: 5000 }
  Response: { projectedScore, projectedTier, confidenceInterval }
  Auth: Bearer token (own score only)

# Loan Eligibility API
POST /api/v1/biashara/eligibility
  Body: { amount?, tenure? }
  Response: { approved, maxAmount, interestRate, monthlyRepayment, reasons }
  Auth: Bearer token
  
GET /api/v1/biashara/eligibility
  Response: { maxAmount, interestRate, tenureOptions, monthlyRepayment, validUntil }
  Auth: Bearer token
  Cache: 1 hour (recalculated on score change)

# Score Events API (audit trail)
GET /api/v1/trust/events
  Query: { limit: 50, offset: 0, factor? }
  Response: { events: [...], total }
  Auth: Bearer token (own events only, admin for any)
```

### 3.7 Score Visualization Component

```typescript
// React component for score display
// File: src/components/trust/TrustScoreCard.tsx

interface TrustScoreCardProps {
  score: number;
  tier: number;
  factors: TrustScoreFactors;
  history: ScoreHistoryPoint[];
  onSimulate?: (scenario: string) => void;
}

// Features:
// - Animated circular gauge (SVG) with color-coded ring
// - Score number with count-up animation on load
// - Tier badge with icon
// - 7-factor radar chart (Recharts)
// - 6-month trend line chart
// - "Improve My Score" action cards
// - What-If simulator modal
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** use gender, ethnicity, location, or marital status as scoring factors — this violates fairness principles and Kenya's Data Protection Act 2019
- **NEVER** allow score manipulation by any user including admins — scores must be purely algorithmic
- **NEVER** store raw M-Pesa transaction details in the scoring database — only aggregated, anonymized metrics
- **NEVER** share a user's score with third parties without explicit consent
- **NEVER** use black-box ML models — all scoring factors must be explainable
- **NEVER** allow real-time score queries to hit the database directly — always use cached eligibility
- **NEVER** recalculate scores synchronously in API requests — always queue via background job
- **NEVER** hardcode scoring weights — store in configuration table for A/B testing

### 4.2 MUST

- **MUST** log every score change with before/after values and reason in `trust_score_events`
- **MUST** provide a "Why is my score X?" explanation for every user
- **MUST** recalculate scores within 15 minutes of trigger events
- **MUST** cache loan eligibility for 1 hour to ensure <500ms API response time
- **MUST** implement score recalculation as idempotent background jobs (BullMQ)
- **MUST** store scoring weights in database for runtime adjustment
- **MUST** provide a dispute mechanism: users can flag incorrect score factors
- **MUST** comply with Kenya Credit Reference Bureau regulations (CBK Act)
- **MUST** implement feature flags for each scoring factor (enable/disable per factor)
- **MUST** run daily batch recalculation for all active users (recency decay)

### 4.3 TECHNICAL CONSTRAINTS

| Constraint | Rule |
|------------|------|
| Score calculation | Must complete in <5 seconds per user |
| API response time | Loan eligibility <500ms (cached) |
| Database | Score updates via background queue, never synchronous |
| Audit trail | Append-only, 7-year retention |
| Cache | Redis for eligibility cache (1-hour TTL) |
| Algorithm version | Stored with each score for reproducibility |
| Bias testing | Monthly audit for demographic bias |

---

## 5. Testing Strategy

### 5.1 Unit Tests (Algorithm)

```typescript
// tests/trust/calculateScore.test.ts
describe('Trust Score Calculation', () => {
  it('returns 300 for completely new user (all zeros)', () => {
    const score = calculateTrustScore(NEW_USER_FACTORS);
    expect(score).toBe(300);
  });

  it('returns 850 for perfect behavior across all factors', () => {
    const score = calculateTrustScore(PERFECT_USER_FACTORS);
    expect(score).toBe(850);
  });

  it('penalizes loan defaults heavily (-100 points)', () => {
    const before = calculateTrustScore(GOOD_USER);
    const after = calculateTrustScore({...GOOD_USER, loans: {...GOOD_USER.loans, defaultHistory: true}});
    expect(before - after).toBeGreaterThan(80);
  });

  it('correctly maps to tiers', () => {
    expect(getTier(300)).toBe(1);
    expect(getTier(499)).toBe(1);
    expect(getTier(500)).toBe(2);
    expect(getTier(649)).toBe(2);
    expect(getTier(650)).toBe(3);
    expect(getTier(749)).toBe(3);
    expect(getTier(750)).toBe(4);
    expect(getTier(850)).toBe(4);
  });

  it('chama officer bonus adds exactly 15 points', () => {
    const regular = calculateTrustScore({...USER, chama: {...USER.chama, leadershipRole: false}});
    const officer = calculateTrustScore({...USER, chama: {...USER.chama, leadershipRole: true}});
    expect(officer - regular).toBe(15);
  });
});
```

### 5.2 Integration Tests

| Test | Scenario | Expected Result |
|------|----------|-----------------|
| Score update on contribution | User makes chama contribution | Score recalculated within 15 min |
| Loan eligibility cache | Request eligibility twice | Second request <100ms (cached) |
| Score history | View 6-month history | 6 data points returned |
| Dispute flow | User disputes chama score | Flag created, admin notified |
| Tier boundary | Score moves from 649 to 650 | Tier upgrades from 2 to 3, max loan jumps |
| Concurrent updates | Two events trigger simultaneously | No race condition, correct final score |

### 5.3 Bias Audit Tests

```typescript
// Monthly bias audit
it('shows no gender bias in score distribution', () => {
  const maleScores = getScoresByGender('M');
  const femaleScores = getScoresByGender('F');
  const diff = Math.abs(mean(maleScores) - mean(femaleScores));
  expect(diff).toBeLessThan(10); // Max 10-point difference acceptable
});

it('shows no location bias (urban vs rural)', () => {
  const urbanScores = getScoresByLocationType('urban');
  const ruralScores = getScoresByLocationType('rural');
  const diff = Math.abs(mean(urbanScores) - mean(ruralScores));
  expect(diff).toBeLessThan(15);
});
```

---

## 6. Data Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Chama Service  │────▶│                 │     │                 │
└─────────────────┘     │                 │     │                 │
┌─────────────────┐     │   Kafka Event   │────▶│  Trust Engine   │
│  M-Pesa Service │────▶│     Topics      │     │   (BullMQ Jobs) │
└─────────────────┘     │                 │     │                 │
┌─────────────────┐     │  trust.score    │     │  ┌───────────┐  │
│  Soko Service   │────▶│  .recalculate   │────▶│  │ Calculate │  │
└─────────────────┘     │                 │     │  │   Score   │  │
┌─────────────────┐     │                 │     │  └─────┬─────┘  │
│  Biashara Loan  │────▶│                 │     │        │        │
└─────────────────┘     └─────────────────┘     │  ┌─────▼─────┐  │
┌─────────────────┐                             │  │  Update   │  │
│  Kazi Service   │────────────────────────────▶│  │  Score    │  │
└─────────────────┘                             │  │  + Cache  │  │
┌─────────────────┐                             │  └─────┬─────┘  │
│  Linda Service  │────────────────────────────▶│        │        │
└─────────────────┘                             └────────┼────────┘
                                                         │
                              ┌──────────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  PostgreSQL     │
                    │  trust_scores   │
                    │  trust_score_   │
                    │  events         │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Redis Cache    │
                    │  loan_eligibility│
                    │  (1-hour TTL)   │
                    └─────────────────┘
```

---

## 7. Deliverables Checklist

- [ ] `trust_scores` table schema migration
- [ ] `trust_score_events` audit table migration
- [ ] `loan_eligibility` cache table migration
- [ ] Score calculation algorithm implementation (TypeScript)
- [ ] 7 factor calculation functions (one per category)
- [ ] BullMQ background job processor for score recalculation
- [ ] API endpoints: GET /trust/score, POST /trust/recalculate, POST /trust/simulate
- [ ] API endpoints: POST /biashara/eligibility, GET /biashara/eligibility
- [ ] TrustScoreCard React component (circular gauge, radar chart, trend line)
- [ ] Score breakdown modal (7-factor detail view)
- [ ] What-If simulator component
- [ ] Score history page (6-month trend)
- [ ] Shareable score card (PDF generation)
- [ ] Redis caching layer for eligibility
- [ ] Feature flag system for scoring factors
- [ ] Score dispute flow (UI + API)
- [ ] Unit tests: 100% coverage of scoring algorithm
- [ ] Integration tests: end-to-end score update flow
- [ ] Bias audit test suite
- [ ] Documentation: Scoring methodology (for regulators)

---

## 8. Definition of Done

- [ ] User can view their Trust Score with 7-factor breakdown
- [ ] Score updates within 15 minutes of trigger events (tested)
- [ ] Loan eligibility API responds in <500ms (cached)
- [ ] Score history shows 6 months of data
- [ ] What-If simulator works for all 7 factors
- [ ] All scoring logic covered by unit tests
- [ ] Bias audit shows <10 point gender gap, <15 point location gap
- [ ] Score dispute flow functional end-to-end
- [ ] Audit trail captures all score changes with metadata
- [ ] Feature flags operational for each scoring factor
- [ ] Documentation approved by product team
