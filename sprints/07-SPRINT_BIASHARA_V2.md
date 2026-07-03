# Sprint 07: Merchant Super-App (Biashara v2)

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-07 |
| **Title** | Merchant Super-App (Biashara v2) |
| **Duration** | 3 weeks |
| **Priority** | P1 — Revenue Driver |
| **Dependency** | SPRINT-05 (Credit Score), SPRINT-06 (Event Bus) |
| **Parallelizable** | Yes — UI work independent of backend |
| **Owner** | Full-Stack Team |

---

## 1. Objective

Transform Biashara from a basic loan product into a **Merchant Super-App** — a comprehensive business toolkit for informal traders and SMEs. This goes beyond lending to include: working capital loans, inventory financing, supplier payments, sales analytics, M-Pesa till integration, and business health dashboards. The goal is to make Biashara the single financial operating system for East African merchants.

This sprint builds on the credit scoring foundation (Sprint 05) and event bus (Sprint 06) to deliver a full merchant experience.

---

## 2. User Stories

### Story 7.1 — Working Capital Loan
> **As a** market vendor, **I want** to borrow money against my daily sales to buy more inventory, **so that** I can grow my business without waiting for cash flow.

**Acceptance Criteria:**
- Loan application pre-fills from Soko sales data and M-Pesa history
- Loan amounts: KES 5,000 - 500,000 based on Trust Score tier
- Interest rates: 10-24% p.a. based on tier
- Tenure options: 1 week to 24 months
- Disbursement to M-Pesa within 5 minutes of approval
- Repayment via M-Pesa STK Push (auto-reminder 3 days before due)
- Early repayment bonus: 2% interest rebate
- Loan calculator shows total cost, monthly payment, APR

### Story 7.2 — Inventory Financing
> **As a** shop owner, **I want** to pay my suppliers directly from a TWENDE credit line, **so that** I can stock up without upfront cash.

**Acceptance Criteria:**
- "Pay Supplier" feature in Biashara dashboard
- Send money directly to supplier's M-Pesa (B2C transfer)
- Supplier saved in address book for repeat payments
- Credit line separate from cash loan (combined limit)
- 30-day interest-free period for supplier payments
- After 30 days: interest accrues at standard rate
- Supplier payment history tracked for credit scoring

### Story 7.3 — Business Health Dashboard
> **As a** business owner, **I want** to see my revenue, expenses, profit margins, and cash flow in one place, **so that** I can make informed decisions.

**Acceptance Criteria:**
- Revenue chart: daily/weekly/monthly sales (from Soko + M-Pesa)
- Expense tracking: categorize spending (inventory, rent, transport, etc.)
- Profit margin calculation: (Revenue - COGS) / Revenue
- Cash flow projection: next 30 days based on historical patterns
- Top products/services by revenue
- Business health score (0-100) based on profitability, growth, consistency
- Export reports as PDF (weekly, monthly)
- Comparison to similar businesses (anonymized benchmarks)

### Story 7.4 — M-Pesa Till Integration
> **As a** merchant with an M-Pesa till number, **I want** my till transactions to automatically appear in TWENDE, **so that** I have complete sales records without manual entry.

**Acceptance Criteria:**
- Link M-Pesa till number to TWENDE account
- All till transactions synced automatically (via C2B API)
- Transactions categorized by type (sale, refund, withdrawal)
- Daily till summary: total sales, transaction count, average ticket
- Till balance displayed in real-time
- Alert when till balance exceeds threshold (security)
- Reconcile till transactions with Soko orders

### Story 7.5 — Loan Top-Up
> **As a** borrower with an active loan, **I want** to request additional funds without a full new application, **so that** I can access more capital quickly.

**Acceptance Criteria:**
- "Top Up" button visible if: 50%+ of loan repaid, no missed payments, score maintained
- Top-up amount: up to remaining credit limit
- New loan created with combined principal, old loan marked consolidated
- Interest calculated only on new principal from top-up date
- Single monthly repayment for combined loan
- Approval in <2 minutes for eligible users

### Story 7.6 — Business Goals & Savings
> **As a** business owner, **I want** to set savings goals (e.g., "expand shop by December") and track progress, **so that** I stay disciplined with business growth.

**Acceptance Criteria:**
- Create savings goal: name, target amount, target date
- Auto-deduct percentage of daily sales toward goal
- Visual progress tracker (thermometer/chart)
- Goal-specific sub-account (segregated from operating funds)
- Withdraw from goal with 48-hour delay (prevent impulse)
- Share goal with chama for group accountability

---

## 3. Technical Specification

### 3.1 Loan Product Types

```typescript
interface LoanProduct {
  id: string;
  name: string;                    // "Working Capital", "Inventory Finance", "Emergency"
  type: 'working_capital' | 'inventory' | 'emergency' | 'topup';
  
  // Eligibility
  minScore: number;                // minimum Trust Score
  minTier: number;                 // minimum tier (1-4)
  maxAmount: number;               // maximum loan amount
  minAmount: number;               // minimum loan amount
  
  // Pricing
  baseInterestRate: number;        // annual %
  interestType: 'reducing_balance' | 'flat';
  processingFee: number;           // % of principal
  lateFee: number;                 // % per day overdue
  
  // Terms
  minTenure: number;               // weeks
  maxTenure: number;               // weeks
  repaymentFrequency: 'weekly' | 'biweekly' | 'monthly';
  
  // Features
  allowsTopUp: boolean;
  allowsEarlyRepayment: boolean;
  earlyRepaymentRebate: number;    // % interest rebate
  requiresGuarantor: boolean;
}

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'working_capital',
    name: 'Working Capital Loan',
    type: 'working_capital',
    minScore: 300,
    minTier: 1,
    minAmount: 5000,
    maxAmount: 500000,
    baseInterestRate: 0.24,        // 24% max (Tier 1)
    interestType: 'reducing_balance',
    processingFee: 0.025,          // 2.5%
    lateFee: 0.005,                // 0.5% per day
    minTenure: 1,                  // 1 week
    maxTenure: 104,                // 24 months
    repaymentFrequency: 'weekly',
    allowsTopUp: true,
    allowsEarlyRepayment: true,
    earlyRepaymentRebate: 0.02,    // 2%
    requiresGuarantor: false,
  },
  {
    id: 'inventory_finance',
    name: 'Inventory Finance',
    type: 'inventory',
    minScore: 500,
    minTier: 2,
    minAmount: 10000,
    maxAmount: 200000,
    baseInterestRate: 0.18,
    interestType: 'reducing_balance',
    processingFee: 0.015,
    lateFee: 0.005,
    minTenure: 4,                  // 1 month
    maxTenure: 52,                 // 12 months
    repaymentFrequency: 'monthly',
    allowsTopUp: false,
    allowsEarlyRepayment: true,
    earlyRepaymentRebate: 0.02,
    requiresGuarantor: false,
  },
  {
    id: 'emergency_micro',
    name: 'Emergency Micro-Loan',
    type: 'emergency',
    minScore: 300,
    minTier: 1,
    minAmount: 1000,
    maxAmount: 5000,
    baseInterestRate: 0.24,
    interestType: 'flat',
    processingFee: 0.05,
    lateFee: 0.01,
    minTenure: 1,
    maxTenure: 4,                  // 1 month max
    repaymentFrequency: 'weekly',
    allowsTopUp: false,
    allowsEarlyRepayment: false,
    earlyRepaymentRebate: 0,
    requiresGuarantor: false,
  },
];
```

### 3.2 Interest Calculation (Reducing Balance)

```typescript
function calculateReducingBalanceSchedule(
  principal: number,
  annualRate: number,
  tenureWeeks: number,
  repaymentFrequency: 'weekly' | 'biweekly' | 'monthly'
): RepaymentSchedule {
  const weeklyRate = annualRate / 52;
  const installment = (principal * weeklyRate) / 
    (1 - Math.pow(1 + weeklyRate, -tenureWeeks));
  
  const schedule: Installment[] = [];
  let balance = principal;
  
  for (let week = 1; week <= tenureWeeks; week++) {
    const interest = balance * weeklyRate;
    const principalPaid = installment - interest;
    balance -= principalPaid;
    
    schedule.push({
      week,
      dueDate: addWeeks(startDate, week),
      installment: Math.round(installment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });
  }
  
  return {
    principal,
    totalInterest: schedule.reduce((sum, i) => sum + i.interest, 0),
    totalRepayment: schedule.reduce((sum, i) => sum + i.installment, 0),
    installments: schedule,
  };
}
```

### 3.3 Database Schema

```sql
-- Loan applications
CREATE TABLE loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id VARCHAR(30) NOT NULL,
  
  -- Requested terms
  requested_amount DECIMAL(12,2) NOT NULL,
  requested_tenure INTEGER NOT NULL, -- weeks
  purpose TEXT NOT NULL,
  
  -- Assessment
  trust_score_at_application INTEGER NOT NULL,
  tier_at_application INTEGER NOT NULL,
  max_eligible_amount DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2),
  interest_rate DECIMAL(5,4) NOT NULL,
  
  -- Status workflow
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'closed', 'defaulted')),
  
  -- Decision
  decision_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active loans
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Terms
  principal DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL,
  tenure_weeks INTEGER NOT NULL,
  total_repayable DECIMAL(12,2) NOT NULL,
  total_interest DECIMAL(12,2) NOT NULL,
  
  -- Disbursement
  disbursed_amount DECIMAL(12,2) NOT NULL,
  disbursement_date TIMESTAMPTZ NOT NULL,
  disbursement_method VARCHAR(20) NOT NULL DEFAULT 'mpesa',
  disbursement_reference VARCHAR(100),
  
  -- Repayment tracking
  total_repaid DECIMAL(12,2) NOT NULL DEFAULT 0,
  principal_repaid DECIMAL(12,2) NOT NULL DEFAULT 0,
  interest_repaid DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_balance DECIMAL(12,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paid_off', 'defaulted', 'restructured', 'written_off')),
  
  -- Schedule
  next_due_date TIMESTAMPTZ,
  next_due_amount DECIMAL(12,2),
  installments_paid INTEGER NOT NULL DEFAULT 0,
  total_installments INTEGER NOT NULL,
  
  -- Top-up tracking
  is_topup BOOLEAN NOT NULL DEFAULT FALSE,
  parent_loan_id UUID REFERENCES loans(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Repayment schedule
CREATE TABLE loan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  installment_number INTEGER NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  principal_portion DECIMAL(12,2) NOT NULL,
  interest_portion DECIMAL(12,2) NOT NULL,
  
  -- Payment tracking
  paid_amount DECIMAL(12,2) DEFAULT 0,
  paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(100),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  
  UNIQUE(loan_id, installment_number)
);

-- Business health metrics
CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Revenue
  daily_revenue DECIMAL(12,2),
  weekly_revenue DECIMAL(12,2),
  monthly_revenue DECIMAL(12,2),
  
  -- Expenses
  daily_expenses DECIMAL(12,2),
  weekly_expenses DECIMAL(12,2),
  monthly_expenses DECIMAL(12,2),
  
  -- Calculated
  profit_margin DECIMAL(5,4),
  cash_flow_30d DECIMAL(12,2),
  business_health_score INTEGER CHECK (business_health_score >= 0 AND business_health_score <= 100),
  
  -- Date
  metric_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Business savings goals
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  target_date DATE NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  auto_deduct_percentage DECIMAL(5,2), -- % of daily sales to auto-save
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.4 API Endpoints

```yaml
# Loan Management
POST /api/v1/biashara/loans/apply
  Body: { productId, amount, tenure, purpose }
  Response: { applicationId, status, estimatedApprovalTime }
  
GET /api/v1/biashara/loans
  Response: { loans: [{ id, principal, status, remainingBalance, nextDueDate }] }
  
GET /api/v1/biashara/loans/:id
  Response: { loan details, repaymentSchedule, paymentHistory }
  
POST /api/v1/biashara/loans/:id/repay
  Body: { amount }
  Response: { paymentReference, remainingBalance }
  
POST /api/v1/biashara/loans/:id/topup
  Body: { amount }
  Response: { newLoanId, approvedAmount, combinedBalance }

# Loan Calculator
POST /api/v1/biashara/calculate
  Body: { amount, tenure, productId }
  Response: { monthlyPayment, totalInterest, totalRepayment, apr }

# Business Dashboard
GET /api/v1/biashara/dashboard
  Response: { revenue, expenses, profitMargin, cashFlow, healthScore, recentTransactions }
  
GET /api/v1/biashara/revenue
  Query: { period: 'daily' | 'weekly' | 'monthly', startDate, endDate }
  Response: { labels, data, growthRate }

# Supplier Payments
POST /api/v1/biashara/suppliers/pay
  Body: { supplierId, amount, description }
  Response: { transactionId, status, reference }
  
GET /api/v1/biashara/suppliers
  Response: { suppliers: [{ id, name, phone, totalPaid, lastPayment }] }

# Savings Goals
POST /api/v1/biashara/goals
  Body: { name, targetAmount, targetDate, autoDeductPercentage }
  
GET /api/v1/biashara/goals
  Response: { goals: [{ id, name, progress, targetDate, status }] }
```

### 3.5 React Components

```typescript
// Business Dashboard
// File: src/pages/BiasharaDashboard.tsx
// Features:
// - Revenue/Expense line chart (Recharts)
// - Profit margin gauge
// - Cash flow projection chart
// - Quick actions: Apply Loan, Pay Supplier, Set Goal
// - Active loans summary cards
// - Business health score badge

// Loan Application Flow
// File: src/components/biashara/LoanApplication.tsx
// Steps:
// 1. Select loan product (cards with features)
// 2. Enter amount + tenure → live calculator updates
// 3. Review repayment schedule table
// 4. Confirm + e-signature (checkbox)
// 5. Submit → track application status

// Repayment Schedule Table
// File: src/components/biashara/RepaymentSchedule.tsx
// Features:
// - Table with: Due Date, Installment, Principal, Interest, Balance, Status
// - Color coding: paid (green), upcoming (blue), overdue (red)
// - Pay button on pending installments
// - Export to PDF
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** approve loans without Trust Score check — all loans must verify score/tier
- **NEVER** disburse more than approved amount — strict amount validation
- **NEVER** allow overlapping top-ups — one top-up at a time per loan
- **NEVER** store supplier M-Pesa PINs — use Daraja API tokens only
- **NEVER** show user's exact loan data to other users — even chama guarantors see only amounts
- **NEVER** process loan applications without idempotency key — prevent double-disbursement
- **NEVER** auto-approve loans >KES 100,000 — manual review required
- **NEVER** charge interest on defaulted loans without legal compliance notice

### 4.2 MUST

- **MUST** generate repayment schedule at disbursement and store immutably
- **MUST** send repayment reminders: 3 days before, 1 day before, on due date
- **MUST** process M-Pesa repayments via C2B (callback updates loan balance)
- **MUST** implement loan status state machine with audit logging
- **MUST** calculate interest daily (reducing balance) for accurate early repayment
- **MUST** freeze borrowing privileges after 2 consecutive missed payments
- **MUST** provide loan statement PDF (monthly, on-demand)
- **MUST** integrate with Trust Engine for real-time eligibility updates
- **MUST** cap total interest at 100% of principal (regulatory compliance)
- **MUST** display APR prominently — Kenya Central Bank requirement

### 4.3 COMPLIANCE REQUIREMENTS

| Requirement | Implementation |
|-------------|---------------|
| CBK interest rate cap | Max 24% p.a. (already compliant) |
| APR disclosure | Displayed on all loan calculators |
| Cooling-off period | 24-hour cancellation window after disbursement |
| Default reporting | Report to CRB after 90 days overdue |
| Data protection | Loan data encrypted, access logged |
| Anti-usury | Total interest never exceeds principal |

---

## 5. Testing Strategy

### 5.1 Loan Calculation Tests

```typescript
describe('Loan Calculations', () => {
  it('calculates reducing balance correctly', () => {
    const schedule = calculateReducingBalanceSchedule(50000, 0.24, 12, 'weekly');
    expect(schedule.totalRepayment).toBeGreaterThan(50000);
    expect(schedule.installments).toHaveLength(12);
    expect(schedule.installments[11].balance).toBe(0);
  });

  it('early repayment reduces total interest', () => {
    const full = calculateReducingBalanceSchedule(50000, 0.24, 12, 'weekly');
    const early = calculateReducingBalanceSchedule(50000, 0.24, 6, 'weekly');
    expect(early.totalInterest).toBeLessThan(full.totalInterest);
  });

  it('caps total interest at 100% of principal', () => {
    const schedule = calculateReducingBalanceSchedule(5000, 0.24, 52, 'weekly');
    expect(schedule.totalInterest).toBeLessThanOrEqual(5000);
  });
});
```

### 5.2 Integration Tests

| Test | Flow | Expected |
|------|------|----------|
| Full loan lifecycle | Apply → Approve → Disburse → Repay → Close | All statuses correct, balance = 0 |
| Top-up flow | Active loan → Request top-up → Approved → Combined balance | Old loan consolidated, new schedule generated |
| M-Pesa repayment | Pay via STK Push → Callback received → Balance updated | Loan balance reduced, installment marked paid |
| Default flow | Miss 3 payments → Status = defaulted → CRB flag | Borrowing frozen, collection process initiated |
| Supplier payment | Pay supplier → B2C transfer → Transaction logged | Supplier receives funds, credit line reduced |

---

## 6. UI Mock Description

### Biashara Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Business Health Score: 78/100  [Green badge]               │
│  "Your business is performing well!"                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Revenue     │  │   Expenses   │  │Profit Margin │      │
│  │  KES 145,000 │  │  KES 89,000  │  │    38.6%     │      │
│  │   ▲ 12%      │  │   ▲ 5%       │  │   ▲ 3.2%     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  [Revenue Chart - 30 day line chart]                        │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions:                                             │
│  [ Apply Loan ] [ Pay Supplier ] [ Set Goal ] [Reports]    │
├─────────────────────────────────────────────────────────────┤
│  Active Loans:                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Working Capital  KES 50,000  Balance: KES 32,400    │  │
│  │ Next due: Jan 15, 2026  [Pay Now]                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Inventory Finance KES 100,000 Balance: KES 78,200   │  │
│  │ Next due: Jan 20, 2026  [Pay Now]                   │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Savings Goals:                                             │
│  [████████░░░░░░░░░░] Expand Shop - KES 80K / KES 200K    │
│  [██████░░░░░░░░░░░░] New Fridge - KES 45K / KES 120K     │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Deliverables Checklist

- [ ] Loan product configuration (3 products with terms)
- [ ] Loan application API + flow
- [ ] Loan approval workflow (auto + manual)
- [ ] Disbursement integration with M-Pesa B2C
- [ ] Repayment schedule calculation engine
- [ ] Repayment processing via M-Pesa C2B callbacks
- [ ] Top-up loan feature
- [ ] Business dashboard with revenue/expense charts
- [ ] Profit margin + cash flow calculations
- [ ] Business health score algorithm
- [ ] Supplier payment feature (B2C integration)
- [ ] Supplier address book management
- [ ] Savings goals feature with auto-deduct
- [ ] M-Pesa till integration (C2B transaction sync)
- [ ] Loan calculator with live updates
- [ ] Repayment schedule table component
- [ ] Loan status tracking page
- [ ] Monthly loan statement PDF generation
- [ ] Repayment reminder notifications (SMS + Push)
- [ ] Compliance: APR display, cooling-off, CRB reporting

---

## 8. Definition of Done

- [ ] User can apply for and receive a working capital loan end-to-end
- [ ] Repayment schedule generated correctly (reducing balance verified)
- [ ] M-Pesa disbursement completes within 5 minutes
- [ ] M-Pesa repayment updates loan balance in real-time
- [ ] Business dashboard displays revenue, expenses, profit margin
- [ ] Loan calculator shows accurate total cost including fees
- [ ] Top-up feature works for eligible borrowers
- [ ] Supplier payment completes via B2C
- [ ] Savings goals track progress with auto-deduction
- [ ] Repayment reminders sent at 3-day, 1-day, due date intervals
- [ ] APR displayed prominently on all loan offers
- [ ] Loan statements generate as downloadable PDFs
- [ ] All interest calculations pass unit tests
- [ ] Integration tests pass for full loan lifecycle
