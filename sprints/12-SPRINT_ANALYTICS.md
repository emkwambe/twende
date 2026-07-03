# Sprint 12: Analytics & Governance Dashboard

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-12 |
| **Title** | Analytics & Governance Dashboard |
| **Duration** | 3 weeks |
| **Priority** | P1 — Operational Necessity |
| **Dependency** | All previous sprints (needs data from all products) |
| **Parallelizable** | Yes — analytics pipeline and UI separate |
| **Owner** | Data Engineering + Frontend Team |

---

## 1. Objective

Build the **TWENDE Command Center** — a comprehensive analytics and governance dashboard that provides real-time visibility into platform performance, user behavior, financial metrics, risk indicators, and regulatory compliance. This is essential for: executive decision-making, regulatory reporting (CBK, IRA, data protection authority), fraud monitoring, and operational health monitoring.

The dashboard serves three user roles: **Executive** (high-level KPIs), **Operations** (day-to-day monitoring), and **Compliance** (regulatory reports and audits).

---

## 2. User Stories

### Story 12.1 — Executive Dashboard
> **As a** TWENDE executive, **I want** a real-time view of key business metrics, **so that** I can make informed strategic decisions.

**Acceptance Criteria:**
- Real-time KPIs: total users, active users (DAU/MAU), total GMV, total loans disbursed, default rate, revenue
- Trend charts: 7-day, 30-day, 90-day views
- Product breakdown: users and revenue by product (Chama, Biashara, Kazi, Linda, Soko)
- Geographic heatmap: user density by county/region
- Trust Score distribution: histogram of user scores
- Loan portfolio health: disbursements vs repayments vs defaults
- Revenue waterfall: interest income, fees, commissions by source
- Comparison to targets: monthly goals with progress indicators

### Story 12.2 — Operations Monitoring
> **As an** operations manager, **I want** to monitor system health and user activity in real-time, **so that** I can detect and respond to issues quickly.

**Acceptance Criteria:**
- Real-time event stream: recent user actions across all products
- System health: API response times, error rates, database connections
- M-Pesa integration status: success rate, pending transactions, failed callbacks
- Consumer lag monitoring: Kafka consumer lag per topic
- Active loans monitor: due today, overdue, at-risk
- Support ticket dashboard: open tickets, resolution time, categories
- Alert panel: configurable thresholds for key metrics
- Automated alerts: SMS/email to ops team when thresholds breached

### Story 12.3 — Regulatory Compliance Reports
> **As a** compliance officer, **I want** automated generation of regulatory reports, **so that** we meet Central Bank and Insurance Authority requirements.

**Acceptance Criteria:**
- CBK Digital Credit Provider report: loan book, interest income, default rates, borrower demographics
- IRA report: policies sold, claims paid, claim ratio, risk distribution
- Data Protection Act report: data access logs, consent management, breach incidents
- Financial statements: P&L, balance sheet, cash flow (automated from transaction data)
- All reports exportable as PDF and Excel
- Scheduled generation: monthly reports auto-generated and emailed
- Report archive: 7-year retention with audit trail

### Story 12.4 — Fraud Detection Monitor
> **As a** risk officer, **I want** to view flagged suspicious activities and manage fraud investigations, **so that** we protect the platform and users.

**Acceptance Criteria:**
- Fraud alerts dashboard: flagged transactions with risk scores
- Risk indicators: velocity checks, unusual patterns, device fingerprinting
- Case management: assign, investigate, resolve fraud cases
- Blacklist management: block users, devices, phone numbers
- Chargeback tracking: disputed M-Pesa transactions
- False positive feedback: mark legitimate transactions to improve model
- Monthly fraud report: detection rate, false positive rate, losses prevented

### Story 12.5 — User Segmentation & Cohorts
> **As a** product manager, **I want** to analyze user behavior by segments and cohorts, **so that** I can optimize product features and marketing.

**Acceptance Criteria:**
- Cohort analysis: retention by signup month, product adoption curves
- User segmentation: by Trust Score tier, product usage, geography, demographics
- Funnel analysis: onboarding completion, loan application → approval, cart → checkout
- A/B test results: feature flag impact on key metrics
- Churn prediction: users at risk of leaving with reasons
- LTV (Lifetime Value) calculation per user segment
- Export user segments for marketing campaigns

---

## 3. Technical Specification

### 3.1 Analytics Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA SOURCES                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ PostgreSQL│  │  Kafka   │  │  Redis   │  │ M-Pesa   │  │  App Logs │     │
│  │ (app DB) │  │ (events) │  │ (cache)  │  │ (Daraja) │  │ (events) │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │             │            │
│       └─────────────┴─────────────┴─────────────┴─────────────┘            │
│                                   │                                         │
│                          ┌────────▼────────┐                               │
│                          │  ETL Pipeline   │                               │
│                          │  (Apache Spark  │                               │
│                          │   or dbt)       │                               │
│                          └────────┬────────┘                               │
│                                   │                                         │
│                    ┌──────────────┼──────────────┐                         │
│                    │              │              │                         │
│             ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐                  │
│             │  Data       │ │  Real-time│ │   Compliance│                  │
│             │  Warehouse  │ │  Analytics│ │   Store     │                  │
│             │ (BigQuery/  │ │ (ClickHouse│ │ (PostgreSQL)│                  │
│             │  Snowflake) │ │  or Pinot) │ │             │                  │
│             └──────┬──────┘ └────┬─────┘ └─────┬──────┘                  │
│                    │             │              │                         │
│                    └─────────────┴──────────────┘                         │
│                                   │                                         │
│                          ┌────────▼────────┐                               │
│                          │  Analytics API  │                               │
│                          │  (Node.js)      │                               │
│                          └────────┬────────┘                               │
│                                   │                                         │
│                          ┌────────▼────────┐                               │
│                          │  Dashboard UI   │                               │
│                          │  (React +       │                               │
│                          │   Recharts)     │                               │
│                          └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Metrics Definitions

```typescript
// Core KPIs tracked
interface PlatformKPIs {
  // User metrics
  totalUsers: number;
  dau: number;                    // Daily Active Users
  mau: number;                    // Monthly Active Users
  userGrowthRate: number;         // % month-over-month
  activationRate: number;         // % who complete onboarding
  
  // Product metrics
  productMetrics: {
    chama: { activeGroups, totalMembers, totalSavings };
    biashara: { activeLoans, totalDisbursed, totalRepaid, defaultRate };
    kazi: { activeWorkers, totalGigs, totalEarnings };
    linda: { activePolicies, totalPremiums, totalClaims, claimRatio };
    soko: { activeMerchants, totalOrders, totalGmv };
  };
  
  // Financial metrics
  revenue: {
    interestIncome: number;
    platformFees: number;
    insuranceCommissions: number;
    transactionFees: number;
    totalRevenue: number;
  };
  
  // Risk metrics
  portfolioAtRisk: number;        // % loans >30 days overdue
  defaultRate: number;            // % loans charged off
  fraudDetectionRate: number;     // % fraudulent transactions caught
  fraudLossRate: number;          // % revenue lost to fraud
  
  // Operational metrics
  avgApiResponseTime: number;     // ms
  mpesaSuccessRate: number;       // %
  systemUptime: number;           // %
  supportTicketVolume: number;
  avgResolutionTime: number;      // hours
}
```

### 3.3 Real-Time Analytics Schema (ClickHouse)

```sql
-- Optimized for time-series analytical queries
CREATE TABLE events_analytics (
  event_id UUID,
  event_type String,
  user_id UUID,
  product String,           -- 'chama', 'biashara', 'kazi', 'linda', 'soko'
  country String,           -- 'KE', 'UG', 'ET', 'RW'
  
  -- Dimensions
  trust_tier UInt8,
  device_type String,       -- 'android', 'ios', 'web'
  os_version String,
  app_version String,
  
  -- Metrics
  amount Float64,           -- monetary value if applicable
  
  -- Location
  city String,
  region String,
  
  -- Time (ClickHouse optimized)
  event_time DateTime64(3),
  event_date Date DEFAULT toDate(event_time),
  
  -- Raw data
  properties String,        -- JSON string of event properties
  
  -- Partitioning and ordering
) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(event_date)
  ORDER BY (event_date, product, event_type, user_id);

-- Materialized views for common aggregations
CREATE MATERIALIZED VIEW daily_kpis_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, product, country)
AS SELECT
  event_date,
  product,
  country,
  count() as event_count,
  uniqExact(user_id) as unique_users,
  sum(amount) as total_amount
FROM events_analytics
GROUP BY event_date, product, country;
```

### 3.4 API Endpoints

```yaml
# Executive Dashboard
GET /api/v1/analytics/executive/summary
  Response: { kpis, trends, targets }
  Auth: Admin (Executive role)
  
GET /api/v1/analytics/executive/revenue
  Query: { period: '7d' | '30d' | '90d' | '1y' }
  Response: { revenue, breakdown, growth }

GET /api/v1/analytics/executive/products
  Response: { products: [{ name, users, revenue, growth }] }

# Operations Monitoring
GET /api/v1/analytics/operations/realtime
  Response: { activeUsers, recentEvents, systemHealth }
  
GET /api/v1/analytics/operations/mpesa
  Response: { successRate, pendingCount, failedCount, avgResponseTime }

GET /api/v1/analytics/operations/loans
  Response: { dueToday, overdue, atRisk, collectionRate }

GET /api/v1/analytics/operations/alerts
  Response: { alerts: [{ metric, threshold, current, severity }] }

# Compliance Reports
POST /api/v1/analytics/compliance/generate
  Body: { reportType: 'cbk' | 'ira' | 'data_protection' | 'financial', period }
  Response: { reportId, status, downloadUrl }

GET /api/v1/analytics/compliance/reports
  Query: { type?, status?, page? }
  Response: { reports: [{ id, type, period, status, createdAt }] }

# Fraud Detection
GET /api/v1/analytics/fraud/alerts
  Query: { status: 'open' | 'investigating' | 'resolved', riskLevel? }
  Response: { alerts: [{ id, userId, riskScore, type, status }] }

PUT /api/v1/analytics/fraud/alerts/:id
  Body: { status, notes, action }

GET /api/v1/analytics/fraud/stats
  Response: { detectionRate, falsePositiveRate, lossesPrevented, casesByType }

# User Analytics
GET /api/v1/analytics/users/cohorts
  Query: { cohortType: 'signup_month' | 'first_product', period }
  Response: { cohorts: [{ period, users, retention: [1, 2, 3... months] }] }

GET /api/v1/analytics/users/segments
  Response: { segments: [{ name, count, avgTrustScore, avgLtv }] }

GET /api/v1/analytics/users/funnel
  Query: { funnel: 'onboarding' | 'loan_application' | 'purchase' }
  Response: { steps: [{ name, users, conversionRate }] }
```

### 3.5 Dashboard UI Components

```typescript
// Executive Dashboard Layout
// File: src/pages/analytics/ExecutiveDashboard.tsx
// 
// Row 1: KPI Cards (4 cards)
// - Total Users (with growth %)
// - Total Revenue (with breakdown)
// - Active Loans (with default rate)
// - System Uptime
//
// Row 2: Charts (2 columns)
// - Revenue Trend (line chart, 90 days)
// - Product Breakdown (donut chart)
//
// Row 3: Maps & Distribution
// - Geographic Heatmap (Kenya map with user density)
// - Trust Score Distribution (histogram)
//
// Row 4: Tables
// - Top Performing Merchants
// - Recent Large Loans

// Operations Dashboard
// File: src/pages/analytics/OperationsDashboard.tsx
//
// - Real-time event stream (auto-refreshing list)
// - System health gauges (API, DB, M-Pesa, Kafka)
// - Alert panel (color-coded by severity)
// - Loan monitoring table (sortable, filterable)

// Compliance Dashboard
// File: src/pages/analytics/ComplianceDashboard.tsx
//
// - Report generation forms (by type, by period)
// - Report history table with download links
// - Regulatory deadline calendar
// - Audit trail viewer
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** expose raw user PII in analytics dashboards — aggregate and anonymize
- **NEVER** allow analytics queries to impact production database performance — use read replicas
- **NEVER** store analytics data longer than regulatory requirement (7 years max)
- **NEVER** share compliance reports externally without executive approval
- **NEVER** grant analytics access to non-admin users — role-based access control
- **NEVER** run unbounded queries — all queries must have time limits
- **NEVER** use production credentials for analytics ETL — separate service account

### 4.2 MUST

- **MUST** aggregate user data before storing in analytics warehouse — no individual records
- **MUST** use separate database connection pool for analytics queries
- **MUST** implement query timeouts (max 30 seconds for dashboard queries)
- **MUST** cache dashboard data: real-time KPIs (1 min), trends (5 min), reports (1 hour)
- **MUST** generate compliance reports automatically on schedule
- **MUST** encrypt analytics data at rest
- **MUST** log all access to compliance reports (audit trail)
- **MUST** implement row-level security — users see only their country's data
- **MUST** anonymize user IDs in analytics (hash with salt)
- **MUST** provide data retention policy documentation

### 4.3 ACCESS CONTROL MATRIX

| Feature | Executive | Operations | Compliance | Product Manager |
|---------|-----------|------------|------------|-----------------|
| Revenue dashboard | ✅ | ❌ | ❌ | 📊 (partial) |
| System health | ✅ | ✅ | ❌ | ❌ |
| User cohorts | ✅ | ❌ | ❌ | ✅ |
| Compliance reports | ✅ | ❌ | ✅ | ❌ |
| Fraud alerts | ✅ | ✅ | ✅ | ❌ |
| Loan monitoring | ✅ | ✅ | ❌ | ❌ |
| Raw user data | ❌ | ❌ | ❌ | ❌ |

---

## 5. Deliverables Checklist

- [ ] Analytics data warehouse setup (ClickHouse or BigQuery)
- [ ] ETL pipeline from PostgreSQL → warehouse
- [ ] Real-time event streaming from Kafka → warehouse
- [ ] Executive dashboard with KPI cards and trend charts
- [ ] Revenue breakdown by product and source
- [ ] Geographic heatmap of users
- [ ] Trust Score distribution visualization
- [ ] Operations dashboard with real-time monitoring
- [ ] System health gauges (API, DB, M-Pesa, Kafka)
- [ ] Alert panel with configurable thresholds
- [ ] M-Pesa integration status monitoring
- [ ] Loan portfolio monitoring (due, overdue, at-risk)
- [ ] Compliance report generation (CBK, IRA, data protection)
- [ ] Automated monthly report scheduling
- [ ] Report archive with 7-year retention
- [ ] Fraud detection dashboard with case management
- [ ] User cohort analysis (retention curves)
- [ ] User segmentation tool
- [ ] Funnel analysis (onboarding, loan, purchase)
- [ ] A/B test results dashboard
- [ ] Role-based access control for analytics
- [ ] Query performance optimization (<30s max)
- [ ] Data anonymization pipeline
- [ ] Audit logging for all report access

---

## 6. Definition of Done

- [ ] Executive dashboard displays all core KPIs with real-time data
- [ ] Revenue trends show accurate data for 7/30/90-day periods
- [ ] Geographic heatmap visualizes user distribution across regions
- [ ] Operations dashboard monitors system health in real-time
- [ ] M-Pesa integration status shows >99% success rate
- [ ] Compliance reports generate automatically (CBK, IRA, data protection)
- [ ] Fraud alerts display with risk scores and case management
- [ ] User cohort retention curves are accurate and actionable
- [ ] All dashboard queries complete in <30 seconds
- [ ] Role-based access control restricts data by user role
- [ ] Analytics data is anonymized (no individual PII)
- [ ] Audit trail logs all access to sensitive reports
- [ ] Automated monthly reports are generated and emailed
- [ ] ETL pipeline runs daily without errors
