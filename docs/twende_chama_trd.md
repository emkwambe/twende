# Twende Chama — Technical Requirements Document (TRD)

**Document Version:** 1.0  
**Date:** July 2026  
**Status:** Draft for Engineering Review  
**Owner:** Engineering Team, TWENDE  
**Audience:** Backend Engineers, Mobile Engineers, DevOps, QA, Security Team

---

## 1. System Architecture Overview

### 1.1 Architectural Philosophy

Twende Chama is built on a **microservices architecture** deployed on AWS, designed for horizontal scalability, fault tolerance, and regional expansion. The architecture follows the **12-Factor App methodology** with stateless services, externalized configuration, and disposable processes. All services communicate via **REST APIs** (synchronous) and **Apache Kafka** (asynchronous events), ensuring loose coupling and independent deployability.

The core principle is **"M-Pesa as the source of truth for money movement; Twende as the source of truth for group logic and user state."** All financial transactions flow through M-Pesa Daraja APIs, while Twende's platform manages group rules, member relationships, loan workflows, credit scoring, and ledger aggregation.

### 1.2 High-Level Architecture

![System Architecture](twende_chama_architecture.png)

| Layer | Components | Technology |
|---|---|---|
| **Client Layer** | iOS/Android App, M-Pesa Mini Program, USSD Gateway | Flutter, Ant Mini Program Framework, Africa's Talking USSD |
| **API Gateway** | Request routing, rate limiting, authentication, request transformation | Kong / AWS API Gateway |
| **Application Layer** | User Service, Chama Service, Transaction Service, Loan Service, Notification Service | Node.js / Python (FastAPI), containerized on ECS/EKS |
| **Integration Layer** | M-Pesa Daraja 3.0, KYC APIs, Credit Bureau, SMS Gateway, Blockchain | REST APIs, webhooks, SDKs |
| **Data Layer** | Primary database, cache, event streaming, object storage | PostgreSQL 15, Redis 7, Apache Kafka, AWS S3 |
| **Observability** | Logging, metrics, tracing, alerting | Datadog, AWS CloudWatch, PagerDuty |

---

## 2. Technology Stack

### 2.1 Stack Selection Rationale

| Layer | Technology | Alternative Considered | Rationale |
|---|---|---|---|
| **Mobile App** | Flutter 3.22 | React Native, native Kotlin/Swift | Single codebase for iOS + Android; excellent performance; strong M-Pesa SDK integration support; hot reload for rapid iteration |
| **Mini Program** | Ant Mini Program Framework | Custom webview | Native M-Pesa Super App integration; Ant Group's proven framework (1M+ apps on Alipay); shared JS runtime |
| **USSD** | Africa's Talking USSD API | Custom USSD gateway | Proven in African market; handles *384*77# routing; built-in session management; pay-per-session pricing |
| **Backend Services** | Node.js 20 (Express/Fastify) + Python 3.11 (FastAPI) | Go, Java Spring Boot | Node.js for I/O-heavy services (API gateway, notifications); Python for data-heavy services (credit scoring, ML); large talent pool in Nairobi |
| **API Gateway** | Kong Gateway (self-hosted on ECS) | AWS API Gateway, NGINX | Cost-effective at scale; plugin ecosystem (rate limiting, auth, caching); multi-region deployment flexibility |
| **Primary Database** | PostgreSQL 15 (RDS Multi-AZ) | MySQL 8, MongoDB | ACID compliance for financial transactions; excellent JSON support for flexible group rules; mature replication; strong Kenyan developer familiarity |
| **Read Replicas** | PostgreSQL 15 (RDS Read Replicas) | — | Offload read-heavy queries (ledger views, reports); 2 replicas in production |
| **Cache** | Redis 7 (ElastiCache Cluster) | Memcached | Session storage, rate limiting, leaderboard caching, real-time ledger caching; pub/sub for notifications |
| **Event Streaming** | Apache Kafka 3.6 (MSK) | AWS SNS/SQS, RabbitMQ | Event sourcing for transaction integrity; replay capability for debugging; decoupled service communication; exactly-once semantics for financial events |
| **Object Storage** | AWS S3 + CloudFront | MinIO, Google Cloud Storage | Document storage (KYC uploads, reports); CDN for static assets; 11 9's durability |
| **Blockchain** | Hyperledger Fabric 2.5 | Ethereum, custom solution | Permissioned ledger for transaction anchoring; no gas fees; regulatory-friendly; enterprise-grade |
| **Container Orchestration** | Amazon ECS (Fargate) | EKS, self-managed Kubernetes | Serverless containers; automatic scaling; no cluster management overhead; cost-efficient for variable workloads |
| **CI/CD** | GitHub Actions + AWS CodeDeploy | GitLab CI, Jenkins | Native GitHub integration; matrix builds (Flutter iOS + Android); automated testing pipeline |
| **Monitoring** | Datadog + AWS CloudWatch | Grafana + Prometheus, New Relic | Full-stack observability; APM for Node.js/Python; custom dashboards; anomaly detection |
| **Secrets Management** | AWS Secrets Manager + HashiCorp Vault | AWS Parameter Store | Rotation for M-Pesa credentials; audit logging; fine-grained access control |

### 2.2 Development Environment

| Component | Specification |
|---|---|
| **IDE** | VS Code (recommended extensions: Flutter, Python, PostgreSQL, Docker) |
| **Local Database** | PostgreSQL 15 (Docker), Redis 7 (Docker), Kafka (Docker Compose) |
| **Local M-Pesa** | Daraja Sandbox (sandbox.safaricom.co.ke) |
| **API Documentation** | OpenAPI 3.1 (Swagger UI hosted at /docs) |
| **Code Quality** | ESLint (JS), Black + Ruff (Python), Dart Analyze (Flutter) |
| **Testing** | Jest (JS unit), pytest (Python unit), Flutter Test (widget), Postman/Newman (API integration), k6 (load) |
| **Git Workflow** | GitHub Flow (feature branches → PR → review → merge to main) |
| **Branch Naming** | `feature/TC-123-contribution-flow`, `bugfix/TC-456-fix-race-condition` |

---

## 3. Service Specifications

### 3.1 Service Decomposition

```
┌─────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Kong)                   │
│  Auth (JWT) │ Rate Limit │ Request ID │ Logging │ Routing   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ User Service │ │ Chama Service│ │ Transaction  │ │ Loan Service │
│  (Node.js)   │ │  (Node.js)   │ │  (Python)    │ │  (Python)    │
│              │ │              │ │              │ │              │
│ - Auth/JWT   │ │ - Group CRUD │ │ - C2B contrib│ │ - Loan req   │
│ - KYC flow   │ │ - Member mgmt│ │ - B2C disburs│ │ - Voting     │
│ - Profile    │ │ - Rules eng  │ │ - Ledger     │ │ - Repayment  │
│ - Credit scor│ │ - Governance │ │ - M-Pesa int │ │ - Interest   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌──────────────┐      ┌──────────────┐
       │Notification  │      │  Kafka       │
       │Service       │      │  (Event Bus) │
       │(Node.js)     │      │              │
       │              │      │ - contrib_evt│
       │ - SMS        │      │ - loan_evt   │
       │ - Push       │      │ - vote_evt   │
       │ - Email      │      │ - score_evt  │
       └──────────────┘      └──────────────┘
```

### 3.2 User Service

**Responsibility:** Authentication, authorization, KYC, user profiles, credit scoring.

**API Endpoints:**

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/v1/auth/register` | POST | Register with phone + OTP | None |
| `/api/v1/auth/verify-otp` | POST | Verify OTP and create account | None |
| `/api/v1/auth/login` | POST | Login with phone + PIN | None |
| `/api/v1/auth/refresh` | POST | Refresh JWT access token | Refresh token |
| `/api/v1/users/me` | GET | Get current user profile | JWT |
| `/api/v1/users/me` | PATCH | Update user profile | JWT |
| `/api/v1/users/me/kyc` | POST | Submit KYC documents | JWT |
| `/api/v1/users/me/kyc/status` | GET | Check KYC verification status | JWT |
| `/api/v1/users/me/credit-score` | GET | Get current credit score + history | JWT |
| `/api/v1/users/{id}/profile` | GET | Get public profile (name, avatar, groups) | JWT |

**Data Model (Key Tables):**

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,          -- +2547XXXXXXXX
    mpesa_name VARCHAR(100),                           -- Auto-fetched from Daraja
    display_name VARCHAR(100),
    email VARCHAR(255),
    pin_hash VARCHAR(255) NOT NULL,                    -- bcrypt hashed
    biometric_enabled BOOLEAN DEFAULT FALSE,
    kyc_tier SMALLINT DEFAULT 1 CHECK (kyc_tier IN (1,2,3)),
    kyc_verified_at TIMESTAMPTZ,
    national_id VARCHAR(20),
    national_id_verified BOOLEAN DEFAULT FALSE,
    date_of_birth DATE,
    credit_score INTEGER DEFAULT 300 CHECK (credit_score BETWEEN 300 AND 850),
    credit_score_history JSONB DEFAULT '[]',           -- Array of {date, score, reason}
    device_tokens TEXT[],                              -- FCM tokens for push
    preferred_language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- kyc_documents table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,                -- 'national_id_front', 'national_id_back', 'selfie'
    document_url VARCHAR(500) NOT NULL,                -- S3 URL
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_provider VARCHAR(50),                 -- ' Huduma Namba', 'manual'
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_kyc_tier ON users(kyc_tier) WHERE status = 'active';
CREATE INDEX idx_kyc_docs_user ON kyc_documents(user_id);
```

**Key Business Logic:**
- OTP generation: 6-digit numeric, expires in 5 minutes, max 3 attempts
- PIN: 4-digit numeric, bcrypt hashed with salt rounds = 12
- JWT access token: 24-hour expiry, RS256 signing
- JWT refresh token: 30-day expiry, stored in Redis with rotation
- Credit score recalculation: triggered by Kafka event after each contribution/loan/repayment

### 3.3 Chama Service

**Responsibility:** Group lifecycle, member management, governance rules, role permissions.

**API Endpoints:**

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/v1/chamas` | POST | Create new chama | JWT |
| `/api/v1/chamas` | GET | List user's chamas | JWT |
| `/api/v1/chamas/{id}` | GET | Get chama details | JWT (member only) |
| `/api/v1/chamas/{id}` | PATCH | Update chama settings | JWT (admin only) |
| `/api/v1/chamas/{id}/members` | GET | List members | JWT (member only) |
| `/api/v1/chamas/{id}/members` | POST | Invite member | JWT (admin only) |
| `/api/v1/chamas/{id}/members/{userId}` | DELETE | Remove member | JWT (admin only) |
| `/api/v1/chamas/{id}/members/{userId}/role` | PATCH | Change member role | JWT (admin only) |
| `/api/v1/chamas/{id}/rules` | GET | Get group rules | JWT (member only) |
| `/api/v1/chamas/{id}/rules` | PATCH | Update rules (triggers vote) | JWT (admin only) |
| `/api/v1/chamas/{id}/invite` | POST | Generate invite link/QR | JWT (admin only) |
| `/api/v1/chamas/join` | POST | Join chama via invite code | JWT |
| `/api/v1/chamas/{id}/reports` | GET | Generate financial report | JWT (admin/treasurer) |

**Data Model:**

```sql
-- chamas table
CREATE TABLE chamas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    shortcode VARCHAR(10) UNIQUE NOT NULL,             -- M-Pesa C2B shortcode
    group_type VARCHAR(20) DEFAULT 'savings_loans' 
        CHECK (group_type IN ('savings_only', 'savings_loans', 'investment')),
    contribution_amount DECIMAL(12,2) NOT NULL,        -- Min $5
    contribution_frequency VARCHAR(20) NOT NULL 
        CHECK (contribution_frequency IN ('weekly', 'bi_weekly', 'monthly')),
    contribution_day SMALLINT,                         -- Day of week (1-7) or day of month (1-31)
    max_loan_multiplier DECIMAL(3,1) DEFAULT 2.0,      -- 1x to 3x contributions
    loan_interest_rate_monthly DECIMAL(5,2) DEFAULT 5.00, -- 0% to 10%
    max_loan_term_months SMALLINT DEFAULT 6,           -- 1 to 12
    approval_threshold VARCHAR(20) DEFAULT 'simple_majority' 
        CHECK (approval_threshold IN ('simple_majority', 'two_thirds', 'unanimous')),
    auto_approve_threshold DECIMAL(12,2) DEFAULT 50.00, -- Loans under this auto-approved
    late_contribution_penalty_rate DECIMAL(5,2) DEFAULT 2.00,
    grace_period_days SMALLINT DEFAULT 7,
    max_members SMALLINT DEFAULT 50,
    current_member_count SMALLINT DEFAULT 0,
    total_contributions DECIMAL(15,2) DEFAULT 0,
    total_loans_disbursed DECIMAL(15,2) DEFAULT 0,
    total_loans_repaid DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'created' 
        CHECK (status IN ('created', 'active', 'archived', 'suspended', 'deleted')),
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    premium_expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- chama_members table (junction)
CREATE TABLE chama_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' 
        CHECK (role IN ('admin', 'treasurer', 'secretary', 'member')),
    individual_contribution_balance DECIMAL(12,2) DEFAULT 0,
    total_contributed DECIMAL(12,2) DEFAULT 0,
    total_loans_taken DECIMAL(12,2) DEFAULT 0,
    total_loans_repaid DECIMAL(12,2) DEFAULT 0,
    consecutive_on_time_contributions SMALLINT DEFAULT 0,
    consecutive_missed_contributions SMALLINT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(chama_id, user_id)
);

-- chama_rules_history table (blockchain-anchored)
CREATE TABLE chama_rules_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    previous_rules JSONB NOT NULL,
    new_rules JSONB NOT NULL,
    vote_id UUID,                                      -- Reference to governance vote
    blockchain_anchor_hash VARCHAR(128),
    anchored_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chamas_shortcode ON chamas(shortcode);
CREATE INDEX idx_chamas_status ON chamas(status) WHERE status = 'active';
CREATE INDEX idx_chama_members_chama ON chama_members(chama_id) WHERE left_at IS NULL;
CREATE INDEX idx_chama_members_user ON chama_members(user_id) WHERE left_at IS NULL;
CREATE INDEX idx_rules_history_chama ON chama_rules_history(chama_id);
```

### 3.4 Transaction Service

**Responsibility:** All M-Pesa integrations, contribution processing, ledger management, financial reporting.

**API Endpoints:**

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/v1/transactions/contribute` | POST | Initiate contribution (returns STK Push) | JWT |
| `/api/v1/transactions` | GET | List transactions for user's groups | JWT |
| `/api/v1/transactions/{id}` | GET | Get transaction details | JWT (member of group) |
| `/api/v1/transactions/chama/{chamaId}` | GET | Get all transactions for a chama | JWT (member) |
| `/api/v1/transactions/chama/{chamaId}/ledger` | GET | Get aggregated ledger | JWT (member) |
| `/api/v1/webhooks/mpesa/c2b/validation` | POST | M-Pesa C2B validation webhook | IP whitelist |
| `/api/v1/webhooks/mpesa/c2b/confirmation` | POST | M-Pesa C2B confirmation webhook | IP whitelist |
| `/api/v1/webhooks/mpesa/b2c/result` | POST | M-Pesa B2C result webhook | IP whitelist |
| `/api/v1/webhooks/mpesa/stk/callback` | POST | M-Pesa STK Push callback webhook | IP whitelist |
| `/api/v1/transactions/{id}/status` | GET | Check transaction status | JWT |
| `/api/v1/transactions/chama/{chamaId}/balance` | GET | Get group balance | JWT (member) |
| `/api/v1/transactions/chama/{chamaId}/reports/monthly` | GET | Generate monthly report | JWT (admin/treasurer) |

**Data Model:**

```sql
-- transactions table (the financial ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    transaction_type VARCHAR(30) NOT NULL 
        CHECK (transaction_type IN (
            'contribution', 'loan_disbursement', 'loan_repayment', 
            'penalty', 'interest', 'withdrawal', 'refund', 'fee'
        )),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
    
    -- M-Pesa specific fields
    mpesa_receipt_number VARCHAR(50),
    mpesa_transaction_id VARCHAR(50),
    mpesa_phone_number VARCHAR(15),
    mpesa_shortcode VARCHAR(15),
    mpesa_callback_payload JSONB,
    
    -- Internal tracking
    initiated_via VARCHAR(20) NOT NULL 
        CHECK (initiated_via IN ('app', 'mini_app', 'ussd', 'api', 'auto')),
    processed_by_service VARCHAR(50),                    -- Service that processed
    
    -- Blockchain anchoring
    blockchain_anchor_hash VARCHAR(128),
    anchored_at TIMESTAMPTZ,
    
    -- Audit
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- transaction_status_history table (audit trail)
CREATE TABLE transaction_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL for system
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_chama ON transactions(chama_id, created_at DESC);
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status) WHERE status = 'pending';
CREATE INDEX idx_transactions_mpesa_receipt ON transactions(mpesa_receipt_number);
CREATE INDEX idx_transactions_type_status ON transactions(transaction_type, status);
CREATE INDEX idx_txn_history_txn ON transaction_status_history(transaction_id);

-- Partial index for pending transactions (used by retry job)
CREATE INDEX idx_transactions_pending_retry 
    ON transactions(created_at) 
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes';
```

**M-Pesa Integration Flow (Contribution):**

```
1. User taps "Contribute $50" in app
   └─▶ POST /api/v1/transactions/contribute
       └─▶ Transaction Service validates: user is member, amount >= min, KYC tier sufficient
           └─▶ Generates transaction record (status: 'pending')
               └─▶ Calls M-Pesa STK Push API (Daraja)
                   └─▶ M-Pesa sends push to user's phone
                       └─▶ User enters M-Pesa PIN
                           └─▶ M-Pesa processes payment
                               └─▶ M-Pesa sends C2B callback to /webhooks/mpesa/c2b/confirmation
                                   └─▶ Transaction Service validates callback signature
                                       └─▶ Updates transaction status: 'completed'
                                           └─▶ Updates member balance, group total
                                               └─▶ Publishes event to Kafka: 'contribution.completed'
                                                   └─▶ Notification Service sends SMS + Push
                                                       └─▶ Credit Scoring Service recalculates score
                                                           └─▶ Blockchain Service anchors transaction hash
```

**Idempotency Key Pattern:** All financial API calls include an `Idempotency-Key` header (UUID generated client-side). The server stores processed keys in Redis with 24-hour TTL, ensuring duplicate requests (network retries, user double-taps) never create duplicate transactions.

### 3.5 Loan Service

**Responsibility:** Loan lifecycle — request, voting, disbursement, repayment, default handling.

**API Endpoints:**

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/v1/loans` | POST | Submit loan request | JWT |
| `/api/v1/loans` | GET | List loans for user's groups | JWT |
| `/api/v1/loans/{id}` | GET | Get loan details | JWT (member of group) |
| `/api/v1/loans/{id}/vote` | POST | Cast vote (approve/reject) | JWT (eligible voter) |
| `/api/v1/loans/{id}/repay` | POST | Make repayment | JWT (borrower) |
| `/api/v1/loans/{id}/schedule` | GET | Get repayment schedule | JWT (borrower or admin) |
| `/api/v1/chamas/{id}/loans` | GET | List all loans for chama | JWT (member) |
| `/api/v1/chamas/{id}/loans/active` | GET | List active loans | JWT (member) |
| `/api/v1/loans/{id}/restructure` | POST | Request loan restructuring | JWT (borrower + admin) |

**Data Model:**

```sql
-- loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
    borrower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Loan terms
    principal_amount DECIMAL(12,2) NOT NULL,
    interest_rate_monthly DECIMAL(5,2) NOT NULL,
    term_months SMALLINT NOT NULL,
    total_repayment_amount DECIMAL(12,2) NOT NULL,     -- Calculated
    monthly_installment DECIMAL(12,2) NOT NULL,        -- Calculated
    
    -- Status workflow
    status VARCHAR(30) DEFAULT 'pending' 
        CHECK (status IN (
            'pending', 'voting', 'approved', 'rejected', 'disbursed', 
            'active', 'repaid', 'defaulted', 'restructured', 'written_off'
        )),
    
    -- Purpose and metadata
    purpose VARCHAR(50) NOT NULL,
    purpose_description TEXT,
    
    -- Voting
    voting_started_at TIMESTAMPTZ,
    voting_ends_at TIMESTAMPTZ,
    votes_required SMALLINT,
    votes_approved SMALLINT DEFAULT 0,
    votes_rejected SMALLINT DEFAULT 0,
    
    -- Disbursement
    disbursed_at TIMESTAMPTZ,
    disbursed_via VARCHAR(20),                         -- 'mpesa_b2c'
    mpesa_b2c_transaction_id UUID REFERENCES transactions(id),
    
    -- Repayment tracking
    total_repaid DECIMAL(12,2) DEFAULT 0,
    total_interest_paid DECIMAL(12,2) DEFAULT 0,
    remaining_balance DECIMAL(12,2),
    next_due_date DATE,
    installments_paid SMALLINT DEFAULT 0,
    installments_missed SMALLINT DEFAULT 0,
    days_overdue SMALLINT DEFAULT 0,
    
    -- Default handling
    defaulted_at TIMESTAMPTZ,
    default_reason TEXT,
    restructured_at TIMESTAMPTZ,
    restructured_terms JSONB,
    written_off_at TIMESTAMPTZ,
    write_off_reason TEXT,
    
    -- Credit impact
    credit_score_at_disbursement INTEGER,
    credit_score_impact INTEGER DEFAULT 0,             -- + for on-time, - for default
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_votes table
CREATE TABLE loan_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote VARCHAR(10) NOT NULL CHECK (vote IN ('approve', 'reject')),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(loan_id, voter_id)
);

-- loan_repayments table
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    principal_portion DECIMAL(12,2) NOT NULL,
    interest_portion DECIMAL(12,2) NOT NULL,
    mpesa_transaction_id UUID REFERENCES transactions(id),
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    due_date DATE,
    days_early_or_late SMALLINT DEFAULT 0,             -- Negative = early, positive = late
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'reversed'))
);

-- Indexes
CREATE INDEX idx_loans_chama ON loans(chama_id, status);
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status) WHERE status IN ('active', 'defaulted');
CREATE INDEX idx_loans_due ON loans(next_due_date) WHERE status = 'active';
CREATE INDEX idx_loan_votes_loan ON loan_votes(loan_id);
CREATE INDEX idx_loan_repayments_loan ON loan_repayments(loan_id);
```

**Loan Voting Engine Logic:**

```python
def process_loan_vote(loan_id: UUID, voter_id: UUID, vote: str) -> LoanStatus:
    loan = get_loan(loan_id)
    
    # Validate voting period
    if timezone.now() > loan.voting_ends_at:
        raise VotingClosedError("Voting period has ended")
    
    # Validate voter eligibility
    if not is_eligible_voter(loan.chama_id, voter_id):
        raise IneligibleVoterError("Member is not eligible to vote")
    
    # Record vote
    record_vote(loan_id, voter_id, vote)
    
    # Check if threshold reached
    total_votes = loan.votes_approved + loan.votes_rejected
    
    if loan.chama.approval_threshold == 'simple_majority':
        if loan.votes_approved > loan.votes_required / 2:
            return approve_loan(loan)
        elif loan.votes_rejected >= loan.votes_required / 2:
            return reject_loan(loan)
    
    elif loan.chama.approval_threshold == 'two_thirds':
        if loan.votes_approved >= loan.votes_required * 2 / 3:
            return approve_loan(loan)
        elif loan.votes_rejected > loan.votes_required / 3:
            return reject_loan(loan)
    
    elif loan.chama.approval_threshold == 'unanimous':
        if loan.votes_rejected > 0:
            return reject_loan(loan)
        elif loan.votes_approved == loan.votes_required:
            return approve_loan(loan)
    
    # Threshold not yet reached
    return LoanStatus.VOTING

def approve_loan(loan: Loan) -> LoanStatus:
    # Check group has sufficient balance
    group_balance = get_chama_balance(loan.chama_id)
    if group_balance < loan.principal_amount:
        raise InsufficientFundsError("Group balance insufficient for disbursement")
    
    # Initiate B2C disbursement
    transaction = initiate_b2c_disbursement(
        phone_number=loan.borrower.phone_number,
        amount=loan.principal_amount,
        description=f"Loan from {loan.chama.name}"
    )
    
    # Update loan status
    loan.status = LoanStatus.DISBURSED
    loan.disbursed_at = timezone.now()
    loan.mpesa_b2c_transaction_id = transaction.id
    loan.save()
    
    # Deduct from group balance
    deduct_from_chama_balance(loan.chama_id, loan.principal_amount)
    
    # Publish events
    publish_event('loan.disbursed', loan)
    
    return LoanStatus.DISBURSED
```

### 3.6 Notification Service

**Responsibility:** Multi-channel notification delivery (SMS, Push, In-app, Email).

**Architecture:** Event-driven via Kafka. Each service publishes notification events; Notification Service consumes and routes to appropriate channels.

**Kafka Consumer Groups:**

| Event Topic | Channels | Priority |
|---|---|---|
| `notifications.sms.critical` | SMS only | Immediate (loan disbursement, fraud alert) |
| `notifications.sms.standard` | SMS | Within 1 minute (contribution confirmation, vote request) |
| `notifications.push` | FCM Push | Within 30 seconds |
| `notifications.inapp` | In-app notification center | Real-time via WebSocket |
| `notifications.batch` | SMS + Push | Daily digest, weekly summary (scheduled) |

**SMS Template Examples:**

```
CONTRIBUTION_SUCCESS:
"Twende: [Name] contributed KES [Amount] to [Group]. 
New balance: KES [Balance]. Txn ID: [ID]"

LOAN_VOTE_REQUEST:
"Twende: [Borrower] requests KES [Amount] loan from [Group]. 
Vote now: Dial *384*77# or open app. Voting closes in 24hrs."

LOAN_APPROVED:
"Twende: Your loan of KES [Amount] was approved! 
Funds sent to your M-Pesa. Repayment: KES [Installment]/month for [Term] months."

CONTRIBUTION_DUE_REMINDER:
"Twende Reminder: Your KES [Amount] contribution to [Group] is due tomorrow. 
Pay via M-Pesa: Send to Paybill [Shortcode], Account [YourPhone]"
```

---

## 4. Database Architecture

### 4.1 Entity Relationship Diagram (Core Entities)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │◄──────┤ chama_members├──────►│   chamas    │
│  (1)        │   N   │    (N)      │   N   │   (1)       │
└──────┬──────┘       └─────────────┘       └──────┬──────┘
       │                                            │
       │ 1                                          │ 1
       │                                            │
       ▼ N                                          ▼ N
┌─────────────┐                            ┌─────────────┐
│transactions │◄───────────────────────────┤    loans    │
│  (N)        │                            │   (N)       │
└─────────────┘                            └──────┬──────┘
                                                  │
                                                  │ 1
                                                  │
                                                  ▼ N
                                           ┌─────────────┐
                                           │loan_repayments│
                                           │   (N)       │
                                           └─────────────┘
```

### 4.2 Database Scaling Strategy

| Strategy | Implementation | When |
|---|---|---|
| **Read Replicas** | 2 RDS read replicas in production | From Day 1 (read-heavy app) |
| **Connection Pooling** | PgBouncer (transaction mode), max 100 connections per service | From Day 1 |
| **Table Partitioning** | Partition `transactions` by `created_at` (monthly partitions) | When table > 10M rows (Year 2) |
| **Sharding** | Shard by `chama_id` (consistent hashing) | When single DB can't handle write load (Year 3) |
| **Archival** | Move transactions older than 2 years to S3 (Parquet format) | Year 2 |
| **Caching** | Redis for: session store, rate limits, credit scores, ledger summaries | From Day 1 |

### 4.3 Redis Cache Strategy

| Key Pattern | TTL | Data |
|---|---|---|
| `session:{jwt_token}` | 24 hours | User session data |
| `refresh:{token}` | 30 days | Refresh token mapping |
| `rate_limit:{user_id}:{endpoint}` | 1 hour | Request count per endpoint |
| `credit_score:{user_id}` | 1 hour | Cached credit score |
| `chama_balance:{chama_id}` | 5 minutes | Aggregated group balance |
| `ledger_summary:{chama_id}` | 1 minute | Recent transactions (last 50) |
| `mpesa_callback:{transaction_id}` | 24 hours | Idempotency key for callbacks |
| `otp:{phone_number}` | 5 minutes | Pending OTP code |
| `vote:{loan_id}` | 24 hours | Vote tally during active voting |

---

## 5. API Specifications

### 5.1 Authentication Flow

```
Client                          API Gateway                    User Service
  │                                  │                              │
  │── POST /auth/register ──────────▶│                              │
  │  {phone: "+254712345678"}        │                              │
  │                                  │── POST /auth/register ──────▶│
  │                                  │                              │── Generate OTP
  │                                  │                              │── Store OTP in Redis (5min TTL)
  │                                  │                              │── Send OTP via SMS Gateway
  │◀──────── {status: "otp_sent"} ───│◀──────── {status: "otp_sent"}──│
  │                                  │                              │
  │── POST /auth/verify-otp ────────▶│                              │
  │  {phone: "+254712345678",        │                              │
  │   otp: "123456", pin: "1234"}   │                              │
  │                                  │── POST /auth/verify-otp ────▶│
  │                                  │                              │── Validate OTP from Redis
  │                                  │                              │── Hash PIN with bcrypt
  │                                  │                              │── Create user record
  │                                  │                              │── Fetch M-Pesa name via Daraja
  │                                  │                              │── Generate JWT pair
  │◀──── {access_token, refresh} ────│◀──── {user, tokens} ─────────│
  │                                  │                              │
  │── GET /users/me ────────────────▶│                              │
  │  Authorization: Bearer {jwt}     │── Validate JWT (RS256)       │
  │                                  │── GET /users/me ────────────▶│
  │◀────────── {user profile} ───────│◀──── {user data} ────────────│
```

### 5.2 Key API Request/Response Examples

#### Contribution Initiation

**Request:**
```http
POST /api/v1/transactions/contribute
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "chama_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "amount": 50.00,
  "currency": "KES",
  "initiated_via": "app"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "tx-uuid-123",
    "status": "pending",
    "amount": 50.00,
    "currency": "KES",
    "mpesa_checkout_request_id": "ws_CO_270720261234567890",
    "message": "STK Push sent to your phone. Please enter M-Pesa PIN to complete.",
    "expires_at": "2026-07-27T12:39:00Z"
  }
}
```

**Callback (M-Pesa → Twende):**
```http
POST /api/v1/webhooks/mpesa/stk/callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "mr-uuid-456",
      "CheckoutRequestID": "ws_CO_270720261234567890",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 50.00},
          {"Name": "MpesaReceiptNumber", "Value": "MBE7N1Y2Z3"},
          {"Name": "TransactionDate", "Value": 20260727123500},
          {"Name": "PhoneNumber", "Value": "254712345678"}
        ]
      }
    }
  }
}
```

#### Loan Request

**Request:**
```http
POST /api/v1/loans
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "chama_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "amount": 200.00,
  "purpose": "business",
  "purpose_description": "Restocking inventory for holiday season",
  "term_months": 3
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "loan_id": "loan-uuid-789",
    "status": "voting",
    "principal_amount": 200.00,
    "interest_rate_monthly": 5.00,
    "term_months": 3,
    "total_repayment_amount": 210.25,
    "monthly_installment": 70.08,
    "votes_required": 15,
    "votes_approved": 0,
    "votes_rejected": 0,
    "voting_ends_at": "2026-07-28T12:35:00Z",
    "message": "Loan request submitted. Voting is now open for 24 hours."
  }
}
```

### 5.3 API Rate Limits

| Endpoint Category | Limit | Scope |
|---|---|---|
| Authentication (register, login, OTP) | 5 requests/minute | Per IP |
| General API | 100 requests/minute | Per user |
| Contribution initiation | 10 requests/minute | Per user |
| Loan requests | 2 requests/hour | Per user |
| Webhooks (M-Pesa callbacks) | 10,000 requests/minute | Per shortcode |

### 5.4 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_GROUP_BALANCE",
    "message": "Group balance (KES 1,500) is insufficient for loan disbursement (KES 2,000).",
    "details": {
      "group_balance": 1500.00,
      "requested_amount": 2000.00,
      "shortfall": 500.00
    },
    "request_id": "req-uuid-trace-123",
    "timestamp": "2026-07-27T12:35:00Z"
  }
}
```

---

## 6. Security Architecture

### 6.1 Threat Model

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **M-Pesa callback spoofing** | High | Critical | HMAC-SHA256 signature validation on all callbacks; IP whitelist Safaricom servers |
| **Replay attacks** | Medium | High | Idempotency keys in Redis (24h TTL); nonce validation |
| **Man-in-the-middle** | Medium | High | TLS 1.3 for all communications; certificate pinning in mobile app |
| **Account takeover** | Medium | Critical | OTP + PIN + optional biometric; rate limiting on auth endpoints; suspicious activity alerts |
| **Insider fraud (employee)** | Low | Critical | Role-based access control (RBAC); all admin actions logged and require 2-person approval for financial ops |
| **Data breach** | Low | Critical | AES-256 encryption at rest; field-level encryption for PII; regular penetration testing |
| **DDoS attack** | Medium | Medium | Kong rate limiting + AWS WAF + CloudFlare (DDoS protection); auto-scaling |
| **SIM swap fraud** | Medium | High | Device fingerprinting; anomaly detection (login from new device/location triggers additional verification) |

### 6.2 Authentication & Authorization

**JWT Token Structure:**
```json
{
  "sub": "user-uuid-123",
  "phone": "+254712345678",
  "kyc_tier": 2,
  "credit_score": 650,
  "iat": 1690454400,
  "exp": 1690540800,
  "jti": "unique-token-id-456"
}
```

**Role-Based Access Control (RBAC):**

| Role | Permissions |
|---|---|
| `anonymous` | Register, login, verify OTP |
| `member` | View group ledger, contribute, request loans, vote, view own profile |
| `treasurer` | All member permissions + view all member balances, generate reports, manage contributions |
| `secretary` | All member permissions + manage member records, meeting minutes |
| `admin` | All permissions + edit group rules, remove members, assign roles, approve premium upgrades |
| `system` | Internal service-to-service communication (machine-to-machine JWT) |

### 6.3 M-Pesa Security

| Control | Implementation |
|---|---|
| **Consumer Key / Secret** | Stored in AWS Secrets Manager; rotated quarterly |
| **Passkey** | Stored in AWS Secrets Manager; never logged or exposed in code |
| **Shortcode** | Dedicated shortcode per group; registered with Safaricom |
| **Callback validation** | HMAC-SHA256 signature verification on every callback; reject if signature mismatch |
| **IP whitelisting** | Callback endpoints accept requests only from Safaricom IP ranges |
| **Callback timeout** | 30-second timeout on callback processing; async processing for heavy operations |

### 6.4 Data Protection

| Data Type | Storage | Encryption | Retention |
|---|---|---|---|
| User PII (name, phone, ID) | PostgreSQL | AES-256 (field-level) | 7 years post-account deletion |
| M-Pesa PIN | Never stored | N/A | N/A |
| App PIN hash | PostgreSQL | bcrypt (salt rounds: 12) | Until account deletion |
| JWT tokens | Redis | N/A (already signed) | Access: 24h, Refresh: 30d |
| KYC documents | S3 | AES-256 (server-side) + bucket encryption | 7 years |
| Transaction records | PostgreSQL | AES-256 (TDE) | 7 years |
| Blockchain anchors | Hyperledger | Native encryption | Permanent |
| Application logs | CloudWatch / Datadog | N/A (no PII in logs) | 90 days |

---

## 7. Infrastructure & Deployment

### 7.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                               │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Route 53   │───▶│ CloudFront   │───▶│   WAF        │          │
│  │   (DNS)      │    │ (CDN)        │    │ (Firewall)   │          │
│  └──────────────┘    └──────────────┘    └──────┬───────┘          │
│                                                  │                   │
│                           ┌──────────────────────┘                   │
│                           ▼                                          │
│                  ┌─────────────────┐                                 │
│                  │  Kong Gateway   │                                 │
│                  │  (ECS Fargate)  │                                 │
│                  │  x2 tasks       │                                 │
│                  └────────┬────────┘                                 │
│                           │                                          │
│       ┌───────────────────┼───────────────────┐                     │
│       ▼                   ▼                   ▼                     │
│  ┌─────────┐      ┌─────────────┐      ┌─────────────┐             │
│  │User Svc │      │Chama Svc    │      │Transaction  │             │
│  │ECS x2   │      │ECS x2       │      │Svc (Python) │             │
│  └─────────┘      └─────────────┘      │ECS x2       │             │
│                                         └─────────────┘             │
│  ┌─────────┐      ┌─────────────┐      ┌─────────────┐             │
│  │Loan Svc │      │Notif Svc    │      │Credit Svc   │             │
│  │ECS x2   │      │ECS x2       │      │ECS x2       │             │
│  └─────────┘      └─────────────┘      └─────────────┘             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │RDS PostgreSQL│  │ ElastiCache  │  │   MSK Kafka  │              │
│  │Primary + 2 RR│  │Redis Cluster │  │  (3 brokers) │              │
│  │Multi-AZ      │  │              │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     S3       │  │ Secrets Mgr  │  │CloudWatch/   │              │
│  │  (Documents) │  │              │  │  Datadog      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  Region: af-south-1 (Cape Town) for data residency compliance        │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Deployment Pipeline

| Stage | Trigger | Actions | Environment |
|---|---|---|---|
| **Build** | PR merge to `main` | Docker image build, unit tests, linting | CI (GitHub Actions) |
| **Staging Deploy** | Build success | Deploy to staging ECS cluster, run integration tests, API contract tests | Staging |
| **Manual QA** | Staging deploy success | QA team runs manual test suite on staging | Staging |
| **Production Deploy** | QA pass + approval | Blue-green deployment to production ECS, health checks, traffic switch | Production |
| **Rollback** | Incident or failure | Automatic rollback if health checks fail; manual rollback via CodeDeploy | Production |

**Deployment Frequency Target:** Daily to staging; 2× per week to production (with feature flags for gradual rollout).

### 7.3 Environment Configuration

| Environment | Purpose | Scale |
|---|---|---|
| **Local** | Developer workstations | Docker Compose: 1 instance each |
| **Dev** | Feature branch testing | ECS: 1 task per service; shared RDS dev instance |
| **Staging** | Pre-production QA | ECS: 1 task per service; dedicated RDS staging; full M-Pesa sandbox |
| **Production** | Live users | ECS: 2+ tasks per service; RDS Multi-AZ + 2 read replicas; full M-Pesa production |

### 7.4 Disaster Recovery

| Scenario | RPO | RTO | Procedure |
|---|---|---|---|
| **Database failure** | < 1 hour | < 30 minutes | Automatic RDS Multi-AZ failover; read replicas promoted if needed |
| **Region failure** | < 4 hours | < 4 hours | Cross-region backup to eu-west-1; manual failover to standby region |
| **M-Pesa outage** | N/A | N/A | Queue transactions; process when M-Pesa returns; notify users of delay |
| **Code deployment failure** | N/A | < 5 minutes | Blue-green rollback; automatic health check failure detection |
| **Data corruption** | < 1 hour | < 2 hours | Point-in-time recovery from RDS snapshots (max 35 days) |

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

| Level | Coverage Target | Tools | Responsibility |
|---|---|---|---|
| **Unit Tests** | 80%+ | Jest (JS), pytest (Python), Flutter Test | Developers (pre-commit) |
| **Integration Tests** | 60%+ | Postman/Newman, Supertest, TestContainers | QA + Developers |
| **Contract Tests** | 100% of API contracts | Pact | Backend team |
| **E2E Tests** | Critical user flows | Maestro (mobile), Playwright (web) | QA |
| **Load Tests** | 2× expected peak | k6, Artillery | Performance team |
| **Security Tests** | Quarterly | OWASP ZAP, Burp Suite | Security team |
| **Penetration Testing** | Bi-annually | External security firm | Security team |

### 8.2 Critical Test Scenarios

| Scenario | Test Type | Validation |
|---|---|---|
| Contribution processed end-to-end | E2E | STK Push → M-Pesa PIN → callback → ledger update → notification → balance update |
| Duplicate contribution (network retry) | Integration | Same idempotency key rejected; only one transaction recorded |
| M-Pesa callback timeout | Integration | Transaction stays "pending"; polling job retries; eventual resolution |
| Loan vote reaching threshold | Integration | All vote combinations tested; auto-disbursement verified; B2C confirmation |
| Insufficient group balance for loan | Integration | Loan approved but disbursement blocked; admin notification sent |
| Credit score recalculation | Unit | All scoring factors weighted correctly; score bounded 300–850 |
| USSD full flow | E2E | Dial *384*77# → navigate menus → contribute → receive confirmation SMS |
| Offline mode (app) | E2E | App launches with cached data; contributions queued; sync when online |
| 100 concurrent contributions | Load | All 100 processed within 60 seconds; no data inconsistency |
| JWT token expiry mid-session | E2E | Automatic refresh; seamless user experience |
| SQL injection attempt | Security | All inputs parameterized; WAF blocks malicious requests |
| M-Pesa callback spoofing | Security | Invalid signature rejected; IP not whitelisted rejected |

---

## 9. Monitoring & Observability

### 9.1 Metrics Dashboard

| Metric | Type | Alert Threshold | Tool |
|---|---|---|---|
| **API response time (p95)** | Gauge | > 500ms for 5 minutes | Datadog |
| **API error rate** | Gauge | > 1% for 5 minutes | Datadog |
| **M-Pesa callback success rate** | Gauge | < 95% for 10 minutes | Datadog |
| **Transaction processing lag** | Gauge | > 60 seconds for 5 minutes | Datadog |
| **Database connection pool** | Gauge | > 80% utilization | CloudWatch |
| **Redis cache hit rate** | Gauge | < 85% | Datadog |
| **Kafka consumer lag** | Gauge | > 1000 messages for 10 minutes | Datadog |
| **ECS task CPU/memory** | Gauge | > 80% for 10 minutes | CloudWatch |
| **Failed login attempts** | Counter | > 10/minute from single IP | Datadog (security alert) |
| **Contribution success rate** | Gauge | < 90% for 15 minutes | PagerDuty (critical) |
| **Loan disbursement failures** | Counter | Any failure | PagerDuty (critical) |

### 9.2 Logging Standards

All services use **structured JSON logging** with the following standard fields:

```json
{
  "timestamp": "2026-07-27T12:35:00.123Z",
  "level": "INFO",
  "service": "transaction-service",
  "request_id": "req-uuid-trace-123",
  "user_id": "user-uuid-456",
  "chama_id": "chama-uuid-789",
  "event": "contribution.completed",
  "message": "Contribution processed successfully",
  "data": {
    "transaction_id": "tx-uuid-111",
    "amount": 50.00,
    "mpesa_receipt": "MBE7N1Y2Z3"
  },
  "duration_ms": 2345,
  "error": null
}
```

**Log Retention:** Application logs → 90 days in CloudWatch; archived to S3 for 1 year. Audit logs (financial transactions, admin actions) → 7 years in S3 (regulatory compliance).

### 9.3 Distributed Tracing

All requests carry a `X-Request-ID` header from Kong Gateway through all downstream services. Traces are collected via **OpenTelemetry** and visualized in Datadog APM, enabling:

- End-to-end request latency breakdown by service
- Error trace analysis (which service failed and why)
- Dependency mapping between services
- Performance bottleneck identification

---

## 10. Open Issues & Technical Debt

| # | Issue | Impact | Proposed Resolution | Timeline |
|---|---|---|---|---|
| 1 | M-Pesa Daraja 3.0 Ratiba API documentation incomplete | Blocks auto-scheduling feature | Engage Safaricom developer relations; build on Daraja 2.0 C2B as fallback | Month 2 |
| 2 | USSD session state management across 2-minute timeout | Poor UX for multi-step flows | Implement session persistence in Redis with resume capability | Month 2 |
| 3 | Hyperledger Fabric operator expertise scarce in team | Blockchain anchoring may be delayed | Consider HashiCorp Vault as interim audit solution; hire Fabric dev | Month 3 |
| 4 | Multi-region database replication latency | Cross-country expansion may have stale reads | Implement CRDT patterns for ledger; regional read replicas | Month 6 |
| 5 | M-Pesa Mini Program framework debugging tools immature | Longer development cycles for mini app | Build comprehensive logging; request Ant Group dev tools access | Month 3 |
| 6 | Credit scoring model needs training data | Initial scores may be inaccurate | Start with rule-based scoring; transition to ML after 6 months of data | Month 1–6 |
| 7 | Load testing with M-Pesa sandbox limitations | Cannot simulate production scale | Build M-Pesa mock service for load testing; validate with limited production canary | Month 2 |

---

*TRD Version 1.0 — July 2026*  
*Next Review Date: August 2026 (post-MVP architecture review)*  
*Document Owner: Engineering Team, TWENDE*
