# Sprint 06: Event Bus & Cross-Product Integration

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-06 |
| **Title** | Event Bus & Cross-Product Integration |
| **Duration** | 2 weeks |
| **Priority** | P0 — Infrastructure Foundation |
| **Dependency** | SPRINT-02 (Backend API), SPRINT-05 (Credit Score) |
| **Parallelizable** | Yes — Kafka can be set up independently |
| **Owner** | Backend / DevOps Team |

---

## 1. Objective

Build the **central nervous system** of TWENDE — an Apache Kafka-based event bus that enables the 5 product pillars to communicate asynchronously, share data, and trigger cross-product workflows. Without this, each product is an isolated island. With it, Chama savings boost credit scores, Soko sales unlock Biashara loans, Kazi gig completion triggers insurance eligibility, and all events feed the Trust Engine.

This sprint also implements the **cross-product API layer** — the set of internal APIs and webhook handlers that allow products to call each other's services securely.

---

## 2. User Stories (System-Level)

### Story 6.1 — Cross-Product Score Updates
> **As the** Trust Engine, **I want** to receive events from all 5 products when user actions occur, **so that** credit scores are recalculated in near real-time.

**Acceptance Criteria:**
- Chama contribution events trigger score recalculation within 15 minutes
- Soko order completion events trigger merchant score updates
- Kazi gig completion events trigger worker score updates
- Loan repayment events trigger immediate score updates
- Insurance premium payment events trigger score updates
- All events are durable (survive service restarts)
- Failed events are retried 3x with exponential backoff, then sent to dead letter queue

### Story 6.2 — Unified User Activity Feed
> **As a** TWENDE user, **I want** to see a single timeline of all my activity across all products, **so that** I have a complete view of my financial life.

**Acceptance Criteria:**
- Activity feed shows events from all 5 products in chronological order
- Each event has product icon, description, timestamp, and amount (if applicable)
- Events are: chama contributions, loan disbursements/repayments, gig bookings/completions, insurance purchases/claims, Soko orders/sales
- Feed supports infinite scroll pagination
- New events appear in real-time (WebSocket push)
- API: `GET /api/v1/user/activity` with `{ limit, offset, product? }`

### Story 6.3 — Cross-Product Loan Eligibility
> **As a** Soko merchant, **I want** my Soko sales history to automatically make me eligible for Biashara working capital loans, **so that** I don't need to apply separately.

**Acceptance Criteria:**
- Soko GMV threshold triggers automatic loan pre-qualification event
- Biashara service consumes event and pre-approves loan offer
- User sees pre-approved loan in Biashara dashboard
- Loan amount based on 30% of average monthly Soko GMV
- Event: `soko.merchant.prequalified` → Biashara creates `loan.preapproved`

### Story 6.4 — Chama Loan Cross-Guarantee
> **As a** chama member, **I want** my group to act as a guarantor for my personal loan, **so that** I get lower interest rates and higher loan limits.

**Acceptance Criteria:**
- Chama votes to guarantee member's loan (50%+ approval)
- Guarantee event published to Biashara
- Biashara reduces interest rate by 2% and increases limit by 25%
- If member defaults, chama collective savings cover 50% of outstanding balance
- Event flow: `chama.guarantee.approved` → `biashara.loan.terms_adjusted`

### Story 6.5 — Gig Worker Insurance Auto-Enrollment
> **As a** Kazi gig worker, **I want** to automatically get accident insurance coverage when I book a high-risk gig, **so that** I'm protected without manual enrollment.

**Acceptance Criteria:**
- High-risk gig categories (construction, transportation) trigger insurance check
- If not insured, Linda creates micro-policy (KES 50/day premium)
- Premium deducted from gig payment automatically
- Coverage active for gig duration + 24 hours
- Event flow: `kazi.gig.high_risk_booked` → `linda.policy.auto_created`

---

## 3. Technical Specification

### 3.1 Kafka Topic Architecture

```yaml
# Core event topics (18 topics total)
# Format: {product}.{entity}.{action}

# Chama events
topics:
  - chama.contribution.created       # Member contributes to savings
  - chama.withdrawal.approved        # Group approves withdrawal
  - chama.guarantee.approved         # Group guarantees member loan
  - chama.member.joined              # New member joins
  - chama.officer.elected            # Leadership change

# Biashara events
  - biashara.loan.applied            # User applies for loan
  - biashara.loan.approved           # Loan approved
  - biashara.loan.disbursed          # Funds sent to M-Pesa
  - biashara.loan.repayment.received # Repayment received
  - biashara.loan.defaulted          # Loan defaulted

# Kazi events
  - kazi.gig.created                 # New gig posted
  - kazi.gig.booked                  # Worker books gig
  - kazi.gig.completed               # Gig marked complete
  - kazi.gig.cancelled               # Gig cancelled
  - kazi.worker.verified             # Worker KYC verified

# Linda events
  - linda.policy.purchased           # Insurance bought
  - linda.premium.paid               # Premium payment received
  - linda.claim.filed                # Claim submitted
  - linda.claim.approved             # Claim approved/paid

# Soko events
  - soko.order.created               # New order placed
  - soko.order.fulfilled             # Order delivered
  - soko.order.cancelled             # Order cancelled
  - soko.merchant.onboarded          # New merchant
  - soko.merchant.prequalified       # Merchant qualifies for loan

# Trust Engine events
  - trust.score.updated              # Score recalculated
  - trust.score.disputed             # User disputes score
  - trust.eligibility.changed        # Loan eligibility changed

# User lifecycle events
  - user.kyc.upgraded                # KYC tier increased
  - user.mpesa.linked                # M-Pesa account linked
  - user.deactivated                 # Account deactivated
```

### 3.2 Event Schema (Avro/JSON)

Every event follows the **CloudEvents 1.0** specification:

```typescript
interface TwendeEvent {
  // CloudEvents standard fields
  specversion: "1.0";
  type: string;              // e.g., "chama.contribution.created"
  source: string;            // e.g., "twende.chama-service"
  id: string;                // UUID
  time: string;              // ISO 8601 timestamp
  datacontenttype: "application/json";
  
  // TWENDE-specific fields
  data: {
    userId: string;          // Primary user (the actor)
    affectedUsers: string[]; // Other users affected (e.g., chama members)
    payload: object;         // Event-specific data
    metadata: {
      correlationId: string; // For tracing across services
      causationId: string;   // ID of event that caused this
      version: string;       // Schema version (semver)
    };
  };
  
  // Partitioning hint
  twendepartition: string;   // userId for user-scoped ordering
}
```

### 3.3 Partitioning Strategy

| Topic | Partitions | Partition Key | Ordering Guarantee |
|-------|-----------|---------------|-------------------|
| `chama.*` | 6 | `userId` | Per-user contribution order |
| `biashara.loan.*` | 6 | `userId` | Loan lifecycle per user |
| `kazi.gig.*` | 6 | `gigId` | Gig state machine order |
| `linda.*` | 3 | `userId` | Per-user policy events |
| `soko.order.*` | 6 | `orderId` | Order state transitions |
| `trust.*` | 3 | `userId` | Score updates per user |
| `user.*` | 3 | `userId` | User lifecycle events |

### 3.4 Consumer Groups

```yaml
consumer_groups:
  trust-engine:
    topics: [chama.*, biashara.loan.repayment.*, kazi.gig.completed, linda.premium.paid, soko.order.fulfilled, user.kyc.upgraded]
    instances: 3
    auto_offset_reset: earliest
    
  activity-feed:
    topics: [chama.*, biashara.*, kazi.*, linda.*, soko.*]
    instances: 2
    auto_offset_reset: latest  # Only new events
    
  biashara-loan-qualifier:
    topics: [soko.merchant.prequalified, chama.guarantee.approved, trust.eligibility.changed]
    instances: 2
    
  linda-auto-insure:
    topics: [kazi.gig.high_risk_booked]
    instances: 1
    
  notification-service:
    topics: [biashara.loan.approved, biashara.loan.disbursed, kazi.gig.booked, linda.claim.approved, soko.order.created]
    instances: 2
    
  analytics-pipeline:
    topics: [ALL]
    instances: 2
    auto_offset_reset: earliest
```

### 3.5 Cross-Product API Layer

Internal APIs for service-to-service communication:

```typescript
// Internal service client (service accounts only)
interface CrossProductAPI {
  // Chama → Biashara
  'POST /internal/biashara/guarantee': {
    request: { chamaId, memberId, guaranteeAmount, approvedBy: string[] };
    response: { loanTermsAdjusted: boolean, newInterestRate, newMaxAmount };
  };
  
  // Soko → Biashara
  'POST /internal/biashara/prequalify': {
    request: { merchantId, monthlyGmv, merchantScore };
    response: { prequalified: boolean, preapprovedAmount, reason };
  };
  
  // Kazi → Linda
  'POST /internal/linda/auto-policy': {
    request: { workerId, gigId, category, duration, riskLevel };
    response: { policyId, premium, coverageAmount, active };
  };
  
  // Trust → All Products
  'GET /internal/trust/score/:userId': {
    response: { score, tier, factors, lastUpdated };
  };
  
  // Any → User Activity
  'POST /internal/activity/log': {
    request: { userId, product, action, metadata };
    response: { activityId };
  };
}
```

### 3.6 WebSocket Real-Time Events

```typescript
// WebSocket events pushed to clients
interface WebSocketEvents {
  // Sent to specific user
  'user.activity.new': ActivityEvent;
  'user.score.updated': { oldScore, newScore, tier, reasons };
  'user.loan.approved': { loanId, amount, disbursementDate };
  'user.gig.booked': { gigId, title, startTime };
  
  // Sent to chama group
  'chama.contribution.new': { memberId, amount, runningTotal };
  'chama.guarantee.requested': { memberId, loanAmount, voteRequired: true };
  
  // Sent to merchants
  'soko.order.new': { orderId, items, total, customerId };
}
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** allow services to directly query each other's databases — always use Kafka events or internal APIs
- **NEVER** lose events — Kafka retention minimum 7 days, critical topics 30 days
- **NEVER** process events out of order for the same user — partition by userId
- **NEVER** expose internal topics to external consumers — internal authentication only
- **NEVER** block the event producer waiting for consumers — fire-and-forget with delivery confirmation
- **NEVER** deploy without dead letter queues — failed events must be inspectable
- **NEVER** use synchronous cross-service calls in user-facing APIs — always queue and respond

### 4.2 MUST

- **MUST** implement idempotent consumers — same event processed twice = same result
- **MUST** include correlationId in every event for distributed tracing
- **MUST** validate event schema before publishing (zod/jsonschema)
- **MUST** monitor consumer lag — alert if >1000 messages behind
- **MUST** have at least 2 consumers per critical consumer group (fault tolerance)
- **MUST** encrypt events in transit (TLS) and at rest
- **MUST** implement circuit breaker for cross-service API calls
- **MUST** log all cross-service calls with latency metrics
- **MUST** provide event replay capability for analytics/reconciliation

### 4.3 OPERATIONAL REQUIREMENTS

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Event publish latency | <10ms | >50ms |
| Consumer lag | <100 messages | >1000 messages |
| Event processing time | <5 seconds | >30 seconds |
| DLQ messages | 0 | >10/hour |
| Kafka broker availability | 99.9% | <99.5% |
| Cross-service API latency | <200ms | >1 second |

---

## 5. Testing Strategy

### 5.1 Event Flow Tests

```typescript
// Test: Chama contribution → Score update
describe('Cross-Product: Chama → Trust', () => {
  it('chama contribution event triggers score recalculation', async () => {
    // Publish event
    await publishEvent('chama.contribution.created', {
      userId: 'user-123',
      payload: { chamaId: 'chama-456', amount: 5000 }
    });
    
    // Wait for processing
    await waitForConsumer('trust-engine', 5000);
    
    // Verify score updated
    const score = await getTrustScore('user-123');
    expect(score.lastCalculatedAt).toBeRecent();
  });
});

// Test: Soko → Biashara pre-qualification
describe('Cross-Product: Soko → Biashara', () => {
  it('high GMV merchant gets prequalified for loan', async () => {
    await publishEvent('soko.merchant.prequalified', {
      userId: 'merchant-789',
      payload: { monthlyGmv: 150000, merchantScore: 720 }
    });
    
    await waitForConsumer('biashara-loan-qualifier', 5000);
    
    const eligibility = await getLoanEligibility('merchant-789');
    expect(eligibility.prequalified).toBe(true);
    expect(eligibility.maxAmount).toBeGreaterThan(0);
  });
});
```

### 5.2 Load Testing

| Scenario | Load | Expected Result |
|----------|------|-----------------|
| Peak M-Pesa transaction volume | 1000 events/sec | No message loss, <5s processing |
| Black Friday Soko orders | 500 orders/min | All events processed, no DLQ |
| Chama contribution day | 10,000 contributions/hour | Score updates complete within 15 min |

---

## 6. Deliverables Checklist

- [ ] Kafka cluster provisioned (local dev: Docker Compose, prod: managed service)
- [ ] All 18 topics created with correct partitioning
- [ ] Event schema registry (zod definitions for all event types)
- [ ] Producer library (`src/lib/events/producer.ts`) — typed, validated
- [ ] Consumer library (`src/lib/events/consumer.ts`) — with DLQ support
- [ ] Trust Engine consumer group (3 instances)
- [ ] Activity Feed consumer group (2 instances)
- [ ] Biashara Loan Qualifier consumer (2 instances)
- [ ] Linda Auto-Insurance consumer (1 instance)
- [ ] Notification Service consumer (2 instances)
- [ ] Internal Cross-Product API client with service auth
- [ ] WebSocket server for real-time client events
- [ ] Activity Feed API: `GET /api/v1/user/activity`
- [ ] Dead Letter Queue handler with admin dashboard
- [ ] Consumer lag monitoring + alerting
- [ ] Event replay tooling for analytics
- [ ] Distributed tracing (correlationId propagation)
- [ ] Circuit breaker for cross-service calls
- [ ] Integration tests for all major event flows
- [ ] Load testing scripts (k6/Artillery)

---

## 7. Definition of Done

- [ ] All 18 Kafka topics operational with correct partitioning
- [ ] Events published and consumed end-to-end for all 5 products
- [ ] Trust Engine receives and processes events within 15 minutes
- [ ] Activity Feed displays cross-product timeline correctly
- [ ] Soko → Biashara pre-qualification flow working
- [ ] Chama → Biashara guarantee flow working
- [ ] Kazi → Linda auto-insurance flow working
- [ ] Dead Letter Queue operational with retry logic
- [ ] Consumer lag monitoring active with alerts
- [ ] WebSocket real-time events pushed to clients
- [ ] All cross-product API calls include authentication
- [ ] Event schema validation on publish
- [ ] Idempotent consumer processing verified
- [ ] Load testing passed at 1000 events/sec
