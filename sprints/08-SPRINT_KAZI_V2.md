# Sprint 08: Gig Worker SDK (Kazi v2)

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-08 |
| **Title** | Gig Worker SDK (Kazi v2) |
| **Duration** | 3 weeks |
| **Priority** | P1 — Acquisition Channel |
| **Dependency** | SPRINT-05 (Credit Score), SPRINT-06 (Event Bus) |
| **Parallelizable** | Yes — matching algorithm and UI separate |
| **Owner** | Full-Stack + Mobile Team |

---

## 1. Objective

Transform Kazi from a basic gig listing board into a comprehensive **Gig Worker SDK** — a two-sided marketplace that matches informal workers with employers, verifies skills, ensures instant payment on completion, and provides worker protections including accident insurance and dispute resolution. This is a key user acquisition channel: gig workers who earn through Kazi become Biashara borrowers and Chama savers.

The SDK enables third-party platforms (delivery apps, construction platforms, cleaning services) to post gigs and pay workers through TWENDE's infrastructure.

---

## 2. User Stories

### Story 8.1 — Create Worker Profile
> **As an** informal worker, **I want** to create a profile showcasing my skills, experience, and availability, **so that** employers can find and hire me.

**Acceptance Criteria:**
- Profile: photo, bio, skills (multi-select: plumbing, electrical, cleaning, driving, etc.), years of experience
- Skill badges: verified (tested) vs. self-reported
- Availability calendar: set working days and hours
- Service areas: select wards/neighborhoods
- Portfolio: upload photos of past work
- Hourly/daily rate by skill category
- Languages spoken
- ID verification (Tier 2 KYC) for "Verified" badge
- Profile completeness progress bar (100% = higher search ranking)

### Story 8.2 — Smart Gig Matching
> **As a** worker, **I want** to receive gig recommendations matched to my skills, location, and availability, **so that** I don't waste time browsing irrelevant jobs.

**Acceptance Criteria:**
- Matching algorithm considers: skill match (40%), proximity (25%), availability (20%), rating (15%)
- Push notification when new matching gig is posted
- "Quick Apply" — one-tap application with pre-filled profile
- Match score displayed (e.g., "95% match")
- Filter gigs by: category, pay range, distance, duration
- Sort by: relevance, newest, highest pay, nearest
- Daily digest: "5 new gigs match your profile"

### Story 8.3 — Employer Post Gig
> **As a** small business owner, **I want** to post a gig with requirements and budget, **so that** qualified workers can apply.

**Acceptance Criteria:**
- Gig form: title, description, skill required, location, date/time, budget, duration
- Budget options: fixed price or hourly rate
- Urgency flag (premium listing for faster matching)
- Photos/description of work required
- Require verified workers only (optional)
- Multiple applicants: review profiles, ratings, past work
- Direct hire (skip application) for previous workers
- Gig posting fee: free for first 3/month, KES 50 after

### Story 8.4 — Instant Payment on Completion
> **As a** gig worker, **I want** to be paid immediately when I mark a gig complete, **so that** I don't wait weeks for my money.

**Acceptance Criteria:**
- Worker marks gig "Complete" → employer confirms within 24 hours
- Auto-payment released to worker's M-Pesa if employer doesn't respond in 24h
- Payment processed via M-Pesa B2C within 5 minutes
- TWENDE fee: 5% of gig value (deducted before payment)
- Payment receipt generated with gig details
- Earnings tracked: daily, weekly, monthly summaries
- Instant payment available for gigs under KES 10,000
- Larger gigs: 50% upfront, 50% on completion

### Story 8.5 — Worker Ratings & Reviews
> **As an** employer, **I want** to rate and review workers after gig completion, **so that** the platform maintains quality.

**Acceptance Criteria:**
- 5-star rating + text review (optional)
- Rating categories: punctuality, quality, communication, professionalism
- Worker rating displayed on profile (average of last 20 gigs)
- Reviews visible on worker profile
- Worker can respond to reviews
- Dispute mechanism for unfair ratings
- Rating affects: search ranking, Trust Score, eligibility for premium gigs

### Story 8.6 — Gig Worker Insurance
> **As a** gig worker, **I want** automatic accident insurance when I accept a gig, **so that** I'm protected if I get injured on the job.

**Acceptance Criteria:**
- Micro-policy auto-created for each gig (KES 20-100 premium)
- Premium based on risk category (office = low, construction = high)
- Coverage: medical expenses up to KES 50,000, disability up to KES 200,000
- Premium deducted from gig payment automatically
- Policy active from gig start time + 2 hours buffer
- Claim filing via app: photo upload, description, medical receipts
- Claim approved within 48 hours for straightforward cases

---

## 3. Technical Specification

### 3.1 Gig Matching Algorithm

```typescript
interface GigMatchScore {
  gigId: string;
  workerId: string;
  overallScore: number;        // 0-100
  breakdown: {
    skillMatch: number;        // 40% weight
    proximity: number;         // 25% weight  
    availability: number;      // 20% weight
    rating: number;            // 15% weight
  };
}

function calculateMatchScore(gig: Gig, worker: Worker): GigMatchScore {
  // 1. Skill Match (40%)
  const requiredSkills = new Set(gig.requiredSkills);
  const workerSkills = new Set(worker.skills.map(s => s.category));
  const intersection = [...requiredSkills].filter(s => workerSkills.has(s));
  const skillMatch = (intersection.length / requiredSkills.size) * 100;
  
  // 2. Proximity (25%) — haversine distance
  const distance = haversine(gig.location, worker.location);
  const proximity = distance < 2 ? 100 : 
                    distance < 5 ? 80 : 
                    distance < 10 ? 60 : 
                    distance < 20 ? 40 : 20;
  
  // 3. Availability (20%)
  const isAvailable = worker.availability.includes(gig.scheduledDate);
  const availability = isAvailable ? 100 : 0;
  
  // 4. Rating (15%)
  const rating = (worker.averageRating / 5) * 100;
  
  // Weighted composite
  const overallScore = 
    skillMatch * 0.40 +
    proximity * 0.25 +
    availability * 0.20 +
    rating * 0.15;
  
  return { gigId: gig.id, workerId: worker.id, overallScore, 
           breakdown: { skillMatch, proximity, availability, rating } };
}
```

### 3.2 Gig Lifecycle State Machine

```
DRAFT → PUBLISHED → APPLICATIONS_OPEN → WORKER_SELECTED → CONFIRMED 
                                                                   ↓
COMPLETED ← DISPUTED ← IN_PROGRESS ← WORKER_ARRIVED ← STARTED
   ↓
PAID → REVIEWED → CLOSED

Alternative paths:
- PUBLISHED → EXPIRED (no applications after 7 days)
- CONFIRMED → CANCELLED (by either party, with penalty rules)
- IN_PROGRESS → CANCELLED (partial payment based on work done)
- DISPUTED → RESOLVED (admin decision) → PAID or REFUNDED
```

### 3.3 Database Schema

```sql
-- Worker profiles
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Profile
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  languages TEXT[],
  service_area JSONB, -- geojson polygon or point+radius
  
  -- Verification
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  id_verified BOOLEAN NOT NULL DEFAULT FALSE,
  skills_tested BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Stats
  total_gigs_completed INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0, -- % of invites accepted
  
  -- Availability
  availability JSONB NOT NULL DEFAULT '{}', -- { "monday": ["08:00-17:00"], ... }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Skills
CREATE TABLE worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id),
  category VARCHAR(50) NOT NULL,   -- 'plumbing', 'electrical', 'cleaning', etc.
  subcategory VARCHAR(50),         -- 'residential', 'commercial'
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  years_experience INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gigs
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES users(id),
  
  -- Details
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  
  -- Location
  location JSONB NOT NULL,         -- { lat, lng, address, ward }
  
  -- Schedule
  scheduled_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_hours INTEGER,
  
  -- Compensation
  budget_type VARCHAR(20) NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
  budget_amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'applications_open', 'worker_selected', 
                      'confirmed', 'started', 'in_progress', 'completed', 'disputed',
                      'paid', 'reviewed', 'closed', 'cancelled', 'expired')),
  
  -- Selected worker
  selected_worker_id UUID REFERENCES worker_profiles(id),
  
  -- Requirements
  requires_verified_worker BOOLEAN NOT NULL DEFAULT FALSE,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  view_count INTEGER NOT NULL DEFAULT 0,
  application_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gig applications
CREATE TABLE gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id),
  
  -- Application
  cover_note TEXT,
  proposed_rate DECIMAL(10,2),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  
  -- Match score at time of application
  match_score DECIMAL(5,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(gig_id, worker_id)
);

-- Gig payments
CREATE TABLE gig_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id),
  
  -- Amounts
  gig_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,      -- 5%
  insurance_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_payment DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method VARCHAR(20) NOT NULL DEFAULT 'mpesa',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_reference VARCHAR(100),
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE gig_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  
  -- Rating
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  
  -- Review
  review_text TEXT,
  
  -- Dispute
  is_disputed BOOLEAN NOT NULL DEFAULT FALSE,
  dispute_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.4 API Endpoints

```yaml
# Worker Profile
POST /api/v1/kazi/workers/profile
  Body: { bio, skills[], hourlyRate, dailyRate, languages[], serviceArea, availability }
  
GET /api/v1/kazi/workers/profile/:id
  Response: { profile, skills, stats, reviews, portfolio }
  
PUT /api/v1/kazi/workers/profile
  Body: partial profile update

# Gig Management (Employer)
POST /api/v1/kazi/gigs
  Body: { title, description, requiredSkills[], location, scheduledDate, budgetType, budgetAmount }
  
GET /api/v1/kazi/gigs/employer
  Response: { gigs: [{ id, title, status, applicationCount, selectedWorker }] }
  
PUT /api/v1/kazi/gigs/:id/status
  Body: { status, workerId? }

# Gig Discovery (Worker)
GET /api/v1/kazi/gigs
  Query: { lat, lng, radius, skills[], budgetMin, budgetMax, date }
  Response: { gigs: [{ id, title, budget, distance, matchScore }] }
  
POST /api/v1/kazi/gigs/:id/apply
  Body: { coverNote, proposedRate? }

# Gig Lifecycle
POST /api/v1/kazi/gigs/:id/start
POST /api/v1/kazi/gigs/:id/complete
POST /api/v1/kazi/gigs/:id/confirm-completion  (employer)
POST /api/v1/kazi/gigs/:id/dispute
  Body: { reason, evidence }

# Payments
GET /api/v1/kazi/earnings
  Query: { period: 'daily' | 'weekly' | 'monthly' }
  Response: { total, breakdown, gigs[] }

# Reviews
POST /api/v1/kazi/gigs/:id/review
  Body: { overallRating, punctualityRating, qualityRating, communicationRating, reviewText }
```

### 3.5 React Components

```typescript
// Worker Profile Card
// File: src/components/kazi/WorkerProfileCard.tsx
// - Photo, name, verified badge, rating stars
// - Skills chips
// - Stats: gigs completed, earnings, response rate
// - "Hire" / "View Profile" buttons

// Gig Posting Form
// File: src/components/kazi/GigPostingForm.tsx
// - Step 1: Basic info (title, description)
// - Step 2: Requirements (skills, location picker)
// - Step 3: Schedule (date/time picker)
// - Step 4: Budget (fixed/hourly toggle)
// - Step 5: Review & Post

// Gig Discovery Feed
// File: src/components/kazi/GigDiscoveryFeed.tsx
// - Filter sidebar (skills, distance, budget, date)
// - Gig cards with match score badge
// - Map view toggle
// - Quick apply button

// Earnings Dashboard
// File: src/components/kazi/EarningsDashboard.tsx
// - Daily/weekly/monthly toggle
// - Earnings chart
// - Gig history table
// - Withdraw to M-Pesa button
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** release payment without employer confirmation OR 24-hour auto-release
- **NEVER** allow workers to apply to gigs outside their service area (>50km)
- **NEVER** display worker's exact home address — show only general area
- **NEVER** allow gig postings without skill requirements specified
- **NEVER** charge workers to apply — only employers pay posting fees
- **NEVER** share worker contact info before gig is confirmed
- **NEVER** allow ratings to be deleted — only disputed and flagged
- **NEVER** process payments without idempotency key

### 4.2 MUST

- **MUST** verify worker ID before "Verified" badge (Tier 2 KYC)
- **MUST** geocode all gig locations for distance calculation
- **MUST** send push notifications for: new matching gig, application accepted, payment received
- **MUST** implement dispute resolution with admin mediation
- **MUST** deduct platform fee (5%) and insurance premium before worker payment
- **MUST** generate payment receipt with gig details and deductions breakdown
- **MUST** update Trust Score within 15 minutes of gig completion
- **MUST** cache gig search results for 5 minutes
- **MUST** rate-limit gig applications: max 10/day per worker
- **MUST** provide employer with worker's past reviews before hiring

### 4.3 PAYMENT FLOW

| Step | Actor | Action | Timing |
|------|-------|--------|--------|
| 1 | Worker | Marks gig complete | T+0 |
| 2 | System | Notifies employer to confirm | T+0 |
| 3 | Employer | Confirms completion (or auto-confirm after 24h) | T+0 to T+24h |
| 4 | System | Calculates: gig amount - 5% fee - insurance premium | T+confirm |
| 5 | System | Initiates M-Pesa B2C to worker | T+confirm |
| 6 | M-Pesa | Callback confirms payment | T+confirm + 2min |
| 7 | System | Updates gig status to PAID, triggers score update | T+confirm + 2min |
| 8 | System | Generates receipt, sends notification | T+confirm + 2min |

---

## 5. Testing Strategy

### 5.1 Matching Algorithm Tests

```typescript
describe('Gig Matching', () => {
  it('perfect skill match scores 100 on skill dimension', () => {
    const gig = { requiredSkills: ['plumbing'], location: NAIROBI_CBD };
    const worker = { skills: [{ category: 'plumbing' }], location: NAIROBI_CBD, 
                     availability: ['2026-01-15'], averageRating: 5 };
    const score = calculateMatchScore(gig, worker);
    expect(score.breakdown.skillMatch).toBe(100);
  });

  it('worker without required skills scores 0 on skill dimension', () => {
    const gig = { requiredSkills: ['electrical'] };
    const worker = { skills: [{ category: 'plumbing' }] };
    const score = calculateMatchScore(gig, worker);
    expect(score.breakdown.skillMatch).toBe(0);
  });

  it('overall score is weighted correctly', () => {
    const score = calculateMatchScore(gig, worker);
    expect(score.overallScore).toBe(
      score.breakdown.skillMatch * 0.40 +
      score.breakdown.proximity * 0.25 +
      score.breakdown.availability * 0.20 +
      score.breakdown.rating * 0.15
    );
  });
});
```

### 5.2 Payment Flow Tests

| Test | Steps | Expected |
|------|-------|----------|
| Happy path payment | Complete → Confirm → Pay | Worker receives net amount in <5 min |
| Auto-release | Complete → No confirm for 24h | Auto-paid after 24h |
| Dispute | Complete → Dispute filed | Payment held, admin notified |
| Platform fee | KES 10,000 gig | Worker receives KES 9,500 |
| Insurance deduction | High-risk gig | Premium deducted, policy created |

---

## 6. Deliverables Checklist

- [ ] Worker profile creation with skills, rates, availability
- [ ] Skill verification system (self-reported + tested)
- [ ] Gig posting form for employers
- [ ] Smart matching algorithm (skill + proximity + availability + rating)
- [ ] Gig discovery feed with filters and map view
- [ ] Gig application flow (Quick Apply)
- [ ] Gig lifecycle state machine (10 states)
- [ ] Employer dashboard: posted gigs, applicants, hires
- [ ] Worker dashboard: applied gigs, upcoming gigs, earnings
- [ ] Instant payment via M-Pesa B2C on completion
- [ ] Payment receipt generation with fee breakdown
- [ ] Platform fee deduction (5%)
- [ ] Earnings tracking (daily/weekly/monthly)
- [ ] Rating and review system (4 dimensions)
- [ ] Dispute resolution workflow
- [ ] Push notifications for key events
- [ ] Gig worker auto-insurance integration with Linda
- [ ] Portfolio photo upload for workers
- [ ] Availability calendar management
- [ ] Geocoding and distance calculation

---

## 7. Definition of Done

- [ ] Worker can create complete profile with skills and availability
- [ ] Employer can post gig and receive applications
- [ ] Matching algorithm returns ranked results with scores
- [ ] Worker can apply to gigs and track application status
- [ ] Gig lifecycle flows through all states correctly
- [ ] Payment releases automatically on completion confirmation
- [ ] Worker receives net payment (after 5% fee) within 5 minutes
- [ ] Rating system captures 4-dimensional feedback
- [ ] Dispute resolution holds payment and notifies admin
- [ ] Earnings dashboard shows accurate income tracking
- [ ] Push notifications delivered for all key events
- [ ] Auto-insurance created for high-risk gigs
- [ ] All payment flows tested end-to-end
- [ ] Matching algorithm tested with 100+ scenarios
