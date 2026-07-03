# Sprint 09: Insurance AI (Linda v2)

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-09 |
| **Title** | Insurance AI (Linda v2) |
| **Duration** | 3 weeks |
| **Priority** | P1 — Trust Builder |
| **Dependency** | SPRINT-05 (Credit Score), SPRINT-06 (Event Bus), SPRINT-08 (Kazi) |
| **Parallelizable** | Partial — AI models need data, UI can be built |
| **Owner** | Data Science + Backend Team |

---

## 1. Objective

Build **Linda** — an AI-powered micro-insurance platform that makes insurance accessible to the informal economy. Traditional insurers exclude informal workers due to lack of payroll records and formal addresses. Linda solves this by using alternative data (Trust Score, gig work patterns, chama membership, M-Pesa history) to assess risk and underwrite policies automatically.

Linda offers: health micro-insurance, accident coverage for gig workers, crop insurance for farmers, livestock insurance, and business interruption coverage — all with premiums starting at KES 20/week and claims paid via M-Pesa within 48 hours.

---

## 2. User Stories

### Story 9.1 — Browse & Purchase Micro-Insurance
> **As a** TWENDE user, **I want** to browse affordable insurance products and purchase one in under 2 minutes, **so that** I can protect myself and my family without complex paperwork.

**Acceptance Criteria:**
- Insurance marketplace: 5+ products with clear descriptions
- Premium displayed as weekly amount (KES 20-500/week)
- Coverage details: what's covered, exclusions, claim process
- Personalized pricing based on Trust Score (Tier 4 = 20% discount)
- Purchase flow: select product → review terms → confirm → pay via M-Pesa
- Policy active immediately after payment
- Digital policy document generated
- Auto-renewal option (weekly deduction from M-Pesa)

### Story 9.2 — AI Risk Assessment
> **As the** insurance system, **I want** to assess each user's risk profile using alternative data, **so that** premiums are fair and claims predictable.

**Acceptance Criteria:**
- Risk score (1-100) calculated from: Trust Score, age, location risk, occupation, health indicators
- AI model trained on: claims history, payment discipline, gig categories, location weather data
- Risk score determines: premium multiplier (0.5x - 3.0x), coverage limits, waiting periods
- Low-risk users (score >70): instant approval, no medical exam
- High-risk users (score <40): require additional verification, higher premiums
- Model retrained monthly with new claims data
- Bias audit: no discrimination by gender, ethnicity, or religion

### Story 9.3 — Instant Claim Filing
> **As an** insured user, **I want** to file an insurance claim through the app with photo evidence, **so that** I don't need to visit an office or fill paper forms.

**Acceptance Criteria:**
- Claim form: incident type, date, description, photo upload (up to 5 images)
- AI image analysis: auto-categorizes damage type, estimates severity
- For health claims: upload hospital receipts, discharge summary
- For accident claims: upload police abstract (optional for claims <KES 10,000)
- Claim tracking: status updates (submitted → under review → approved/pending info → paid)
- Push notifications at each status change
- Simple claims (<KES 10,000): AI auto-approves within 2 hours
- Complex claims: human review within 48 hours

### Story 9.4 — Automated Claim Payout
> **As a** claimant, **I want** approved claims paid directly to my M-Pesa within 48 hours, **so that** I can access funds when I need them most.

**Acceptance Criteria:**
- Approved claim → M-Pesa B2C disbursement within 2 hours
- Payment notification with breakdown: claim amount - deductible = payout
- For large claims (>KES 50,000): staged payout (50% immediate, 50% after verification)
- Claim history: all past claims with status and amounts
- Yearly claim limit tracked per policy
- Fraud detection: flag claims with suspicious patterns (multiple claims in short period, inconsistent photos)

### Story 9.5 — Gig Worker Auto-Insurance
> **As a** Kazi gig worker, **I want** automatic accident coverage for every gig I book, **so that** I'm protected without thinking about insurance.

**Acceptance Criteria:**
- Auto-policy created when gig is confirmed (via event bus from Kazi)
- Premium: KES 20-100 based on gig risk category
- Coverage period: gig start time - 2 hours to gig end time + 24 hours
- Coverage: accidental death (KES 200K), permanent disability (KES 100K), medical (KES 50K)
- Premium deducted from gig payment automatically
- No-claim bonus: 10% premium reduction after 6 months claim-free
- Integration with Kazi event bus: `kazi.gig.confirmed` → `linda.policy.auto_created`

### Story 9.6 — Group Insurance (Chama)
> **As a** chama group, **I want** to purchase group health insurance at discounted rates, **so that** all members are covered affordably.

**Acceptance Criteria:**
- Group policy: covers all chama members + 1 dependent each
- Group discount: 15% off individual premiums (minimum 10 members)
- Premium paid from chama collective savings
- Voting required: 70% approval to purchase/renew
- Member can opt out (but loses group discount if they rejoin)
- Group claims affect next year's premium (experience rating)

---

## 3. Technical Specification

### 3.1 AI Risk Assessment Model

```typescript
interface RiskAssessmentInput {
  // Trust Engine data
  trustScore: number;
  trustTier: number;
  paymentConsistency: number;      // % on-time payments (all products)
  
  // Demographics
  age: number;
  gender: 'M' | 'F';
  location: { lat: number; lng: number; ward: string };
  
  // Occupation
  occupation: string;              // 'farmer', 'driver', 'construction', 'vendor', etc.
  gigCategories: string[];         // from Kazi
  yearsInWork: number;
  
  // Health indicators (self-reported)
  smoker: boolean;
  chronicConditions: string[];
  
  // Historical data
  previousClaims: number;          // count in last 2 years
  claimAmounts: number[];          // historical claim amounts
  policyTenure: number;            // months insured
}

interface RiskAssessmentOutput {
  riskScore: number;               // 1-100 (higher = riskier)
  riskCategory: 'low' | 'medium' | 'high' | 'uninsurable';
  premiumMultiplier: number;       // 0.5x - 3.0x
  recommendedCoverage: number;     // max coverage amount
  waitingPeriodDays: number;       // 0, 30, or 90
  requiresMedical: boolean;
  
  // Explainability
  factorBreakdown: {
    factor: string;
    contribution: number;          // +/- points to risk score
    explanation: string;
  }[];
}

// Model: Gradient Boosting (XGBoost) + logistic regression for interpretability
// Features: 25 engineered features from raw data
// Training data: synthetic + partner insurer historical data
// Retraining: monthly batch job
```

### 3.2 Insurance Products

```typescript
const INSURANCE_PRODUCTS = [
  {
    id: 'health_micro',
    name: 'Afya Bora (Health)',
    category: 'health',
    basePremium: 50,                    // KES/week
    coverage: {
      inpatient: 50000,                 // KES per year
      outpatient: 10000,
      maternity: 20000,
    },
    waitingPeriod: 30,                  // days
    baseRiskMultiplier: 1.0,
  },
  {
    id: 'accident_gig',
    name: 'Kazi Cover (Accident)',
    category: 'accident',
    basePremium: 30,
    coverage: {
      accidentalDeath: 200000,
      permanentDisability: 100000,
      medicalExpenses: 50000,
    },
    waitingPeriod: 0,
    baseRiskMultiplier: 1.2,
    autoTrigger: 'kazi.gig.confirmed',
  },
  {
    id: 'crop_weather',
    name: 'Kilimo Salama (Crop)',
    category: 'agriculture',
    basePremium: 100,                   // per acre per season
    coverage: {
      drought: 30000,                   // per acre
      flood: 30000,
      pestDamage: 15000,
    },
    waitingPeriod: 14,
    baseRiskMultiplier: 1.5,
    weatherIndex: true,                 // pays based on weather data, not individual assessment
  },
  {
    id: 'livestock',
    name: 'Mifugo Cover (Livestock)',
    category: 'livestock',
    basePremium: 75,                    // per animal per month
    coverage: {
      death: 25000,                     // per animal
      theft: 20000,
      disease: 15000,
    },
    waitingPeriod: 30,
    baseRiskMultiplier: 1.3,
  },
  {
    id: 'business_interruption',
    name: 'Biashara Shield',
    category: 'business',
    basePremium: 100,
    coverage: {
      fire: 100000,
      theft: 50000,
      flood: 75000,
      dailyIncome: 2000,                // per day of interruption
    },
    waitingPeriod: 14,
    baseRiskMultiplier: 1.0,
  },
];
```

### 3.3 Premium Calculation

```typescript
function calculatePremium(
  product: InsuranceProduct,
  riskAssessment: RiskAssessmentOutput,
  trustTier: number
): PremiumBreakdown {
  // Base premium * risk multiplier
  const riskAdjustedPremium = product.basePremium * riskAssessment.premiumMultiplier;
  
  // Trust tier discount
  const tierDiscount = trustTier === 4 ? 0.20 :
                       trustTier === 3 ? 0.10 :
                       trustTier === 2 ? 0.05 : 0;
  
  // No-claim bonus (from Linda payment history)
  const ncbDiscount = getNoClaimBonus(userId); // 0-20%
  
  // Group discount (if chama group policy)
  const groupDiscount = isGroupPolicy ? 0.15 : 0;
  
  const finalPremium = riskAdjustedPremium * 
    (1 - tierDiscount) * 
    (1 - ncbDiscount) * 
    (1 - groupDiscount);
  
  return {
    basePremium: product.basePremium,
    riskAdjustment: riskAssessment.premiumMultiplier,
    riskAdjustedPremium,
    tierDiscount,
    ncbDiscount,
    groupDiscount,
    finalPremium: Math.round(finalPremium),
    coverageLimit: riskAssessment.recommendedCoverage,
    waitingPeriod: product.waitingPeriod,
  };
}
```

### 3.4 AI Claims Processing

```typescript
// Automated claim assessment pipeline
interface ClaimAssessment {
  // Step 1: Validation
  validateClaim(claim: Claim): ValidationResult {
    // Check: policy active, within coverage period, under yearly limit
    // Check: waiting period satisfied
    // Check: no duplicate claim for same incident
  }
  
  // Step 2: Image Analysis (for property/accident claims)
  analyzeImages(images: Image[]): ImageAnalysis {
    // Use TensorFlow.js or API call to vision model
    // Classify damage type, estimate severity
    // Flag inconsistencies (e.g., timestamp metadata, duplicate images)
  }
  
  // Step 3: Fraud Detection
  detectFraud(claim: Claim, userHistory: ClaimHistory): FraudRisk {
    // Rules: >3 claims in 6 months = high risk
    // Rules: claim amount > 2x historical average = review
    // Rules: photo metadata inconsistent with claim = flag
    // ML model: anomaly detection on claim patterns
  }
  
  // Step 4: Payout Calculation
  calculatePayout(claim: Claim, policy: Policy): Payout {
    // Apply deductible (KES 500-2000 based on product)
    // Apply co-pay (10% for claims >KES 10,000)
    // Cap at coverage limit
    // Staged payout for large claims
  }
  
  // Step 5: Decision
  makeDecision(assessment: FullAssessment): ClaimDecision {
    // Simple claims + low fraud risk + AI confidence >80% = auto-approve
    // Complex claims or fraud risk >50% = human review
    // Auto-decision within 2 hours, human review within 48 hours
  }
}
```

### 3.5 Database Schema

```sql
-- Insurance products
CREATE TABLE insurance_products (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  base_premium DECIMAL(10,2) NOT NULL,
  coverage_details JSONB NOT NULL,
  waiting_period_days INTEGER NOT NULL DEFAULT 0,
  base_risk_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policies
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id VARCHAR(30) NOT NULL REFERENCES insurance_products(id),
  
  -- Premium
  premium_amount DECIMAL(10,2) NOT NULL,
  premium_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly',
  
  -- Coverage
  coverage_amount DECIMAL(12,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'lapsed', 'cancelled', 'expired')),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  next_premium_due DATE,
  
  -- Group policy
  is_group_policy BOOLEAN NOT NULL DEFAULT FALSE,
  chama_id UUID REFERENCES chamas(id),
  
  -- Risk assessment at purchase
  risk_score INTEGER,
  risk_category VARCHAR(20),
  
  -- Auto-renewal
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claims
CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Claim details
  claim_type VARCHAR(30) NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  claim_amount DECIMAL(12,2) NOT NULL,
  
  -- Evidence
  photos JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  
  -- AI Assessment
  ai_damage_severity VARCHAR(20),
  ai_fraud_risk DECIMAL(5,4),
  ai_recommended_payout DECIMAL(12,2),
  
  -- Decision
  status VARCHAR(20) NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'pending_info', 'approved', 'rejected', 'paid')),
  approved_amount DECIMAL(12,2),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  
  -- Payment
  paid_amount DECIMAL(12,2),
  paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(100),
  
  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Premium payments
CREATE TABLE insurance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES insurance_policies(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'mpesa',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(100),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Risk assessments (audit trail)
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  risk_score INTEGER NOT NULL,
  risk_category VARCHAR(20) NOT NULL,
  premium_multiplier DECIMAL(3,2) NOT NULL,
  factor_breakdown JSONB NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** auto-approve claims >KES 10,000 without human review
- **NEVER** use gender as a pricing factor — Kenya law prohibits this
- **NEVER** deny coverage based on HIV status — illegal in Kenya
- **NEVER** sell insurance without clear disclosure of exclusions
- **NEVER** auto-renew without 7-day advance notification
- **NEVER** process claim payments without fraud check
- **NEVER** store medical records without encryption at rest
- **NEVER** train AI models on biased data — monthly bias audit required

### 4.2 MUST

- **MUST** display cooling-off period (14 days to cancel for full refund)
- **MUST** provide policy document in Swahili and English
- **MUST** send premium due reminders 3 days and 1 day before
- **MUST** auto-lapse policy after 2 missed premium payments
- **MUST** pay approved claims via M-Pesa within 2 hours (simple) / 48 hours (complex)
- **MUST** log all claim decisions with AI confidence score
- **MUST** allow claim disputes with human escalation
- **MUST** comply with IRA (Insurance Regulatory Authority) Kenya requirements
- **MUST** partner with licensed underwriter — TWENDE is distributor, not insurer
- **MUST** implement no-claim bonus tracking (reduces premium up to 20%)

### 4.3 COMPLIANCE

| Requirement | Implementation |
|-------------|---------------|
| IRA licensing | Partner with licensed insurer (e.g., APA, Jubilee) |
| Cooling-off | 14-day cancellation with full refund |
| Claim settlement | Max 48 hours for valid claims (IRA requirement) |
| Policy wording | Approved by partner insurer's legal team |
| Data protection | Medical data encrypted, access logged |
| Anti-discrimination | No gender/health status in pricing |

---

## 5. Deliverables Checklist

- [ ] Insurance product catalog (5 products configured)
- [ ] AI risk assessment model (XGBoost) with 25 features
- [ ] Premium calculation engine with all discounts
- [ ] Policy purchase flow (browse → assess risk → quote → pay → activate)
- [ ] Claim filing form with photo upload
- [ ] AI image analysis for damage assessment
- [ ] Fraud detection rules + ML model
- [ ] Auto-claim approval for simple claims (<KES 10K)
- [ ] Human review queue for complex claims
- [ ] M-Pesa B2C claim payout integration
- [ ] Gig worker auto-insurance (Kazi integration via event bus)
- [ ] Group insurance for chamas
- [ ] Policy document generation (PDF, bilingual)
- [ ] Premium payment tracking and auto-renewal
- [ ] No-claim bonus tracking
- [ ] Claim status tracking for users
- [ ] Admin dashboard for claim review
- [ ] AI model retraining pipeline (monthly)
- [ ] Bias audit reporting
- [ ] Partner insurer API integration

---

## 6. Definition of Done

- [ ] User can browse and purchase insurance in <2 minutes
- [ ] AI risk assessment produces explainable score
- [ ] Premium calculation includes all discounts (tier, NCB, group)
- [ ] Policy activates immediately after M-Pesa payment
- [ ] Claim filing works with photo upload
- [ ] Simple claims auto-approved within 2 hours
- [ ] Approved claims paid via M-Pesa within 48 hours
- [ ] Gig worker auto-insurance triggers on gig confirmation
- [ ] Group insurance available for chamas with 15% discount
- [ ] Auto-renewal processes weekly with 3-day reminder
- [ ] Policy documents generated in English and Swahili
- [ ] Admin claim review dashboard operational
- [ ] AI model bias audit shows no demographic discrimination
- [ ] Fraud detection flags <5% of legitimate claims (low false positive)
