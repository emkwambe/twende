# TWENDE — Unified Technical Requirements Document (TRD)

**Platform:** TWENDE Financial Wellness Ecosystem  
**Products:** Chama · Biashara · Kazi · Linda · Soko  
**Version:** 2.0 (Unified)  
**Date:** July 2026  
**Status:** Draft for Engineering Review  
**Owner:** Engineering Team, TWENDE  
**Audience:** Backend Engineers, Mobile Engineers, DevOps, QA, Security, Data Science

---

## 1. System Architecture Overview

### 1.1 Architectural Principles

TWENDE is built as a **unified microservices platform** where all five products share common infrastructure, data stores, and integration patterns. The architecture follows six core principles:

| Principle | Implementation |
|---|---|
| **Single Identity, Everywhere** | One user record, one KYC profile, one credit score — accessible by all products via the Trust Engine |
| **Event-Driven Cross-Product Communication** | All inter-product data flows via Kafka; no direct service-to-service coupling |
| **M-Pesa as Source of Truth for Money** | All financial transactions flow through Daraja; TWENDE owns the business logic layer above it |
| **Phone Number as Primary Key** | +2547XXXXXXXX is the universal identifier across all products, channels, and integrations |
| **Feature Phone First, Smartphone Optimized** | USSD and WhatsApp as baseline; Flutter app as enhanced experience |
| **Regional by Design** | Multi-currency, multi-KYC, multi-MNO from day one — not retrofitted |

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                                                                              │
│   ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │Flutter App   │  │M-Pesa Mini       │  │USSD Gateway  │  │WhatsApp    │  │
│   │(iOS/Android) │  │Program           │  │(*384*77#)    │  │Business API│  │
│   └──────┬───────┘  └────────┬─────────┘  └──────┬───────┘  └─────┬──────┘  │
│          │                   │                   │                │        │
└──────────┼───────────────────┼───────────────────┼────────────────┼────────┘
           │                   │                   │                │
           └───────────────────┴─────────┬─────────┴────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────┐
│                           API GATEWAY (Kong)                                 │
│  JWT Validation │ Rate Limiting │ Request Routing │ API Versioning │ Logging │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────┐
│                         APPLICATION SERVICES (ECS Fargate)                   │
│                                                                              │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│   │User Service│ │Chama Svc   │ │Biashara Svc│ │Kazi Svc    │ │Linda Svc │  │
│   │(Node.js)   │ │(Node.js)   │ │(Python)    │ │(Node.js)   │ │(Python)  │  │
│   └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘  │
│         │              │              │              │             │       │
│   ┌─────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐ ┌──┴─────┐  │
│   │Soko Svc    │ │Transaction │ │Credit Scoring│ │Notification│ │Ledger  │  │
│   │(Node.js)   │ │Svc (Python)│ │Engine (Py)  │ │Svc (Node)  │ │Svc (Py)│  │
│   └────────────┘ └────────────┘ └──────────────┘ └────────────┘ └────────┘  │
│                                                                              │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────┐
│                              TRUST ENGINE                                    │
│                                                                              │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────────┐│
│   │Identity Service│  │Credit Scoring  │  │Risk & Fraud Detection (ML)     ││
│   │(KYC Tiers 1-3) │  │Engine (300-850)│  │(Anomaly, Velocity, Biometric)  ││
│   └────────────────┘  └────────────────┘  └────────────────────────────────┘│
│                                                                              │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────────┐│
│   │Consent Mgmt    │  │Event Bus       │  │Blockchain Anchoring            ││
│   │(GDPR Compliant)│  │(Apache Kafka)  │  │(Hyperledger Fabric)            ││
│   └────────────────┘  └────────────────┘  └────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────┐
│                              DATA LAYER                                      │
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│   │PostgreSQL 15 │  │Redis Cluster │  │Apache Kafka  │  │AWS S3 +        │  │
│   │(RDS Multi-AZ)│  │(ElastiCache) │  │3.6 (MSK)     │  │CloudFront      │  │
│   │Primary + 2 RR│  │Session/Cache │  │Event Streaming│  │Documents/CDN   │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────┐
│                         EXTERNAL INTEGRATIONS                                │
│                                                                              │
│   M-Pesa Daraja 3.0 │ CRB/Metropol │ Huduma Namba │ NIDA │ MTN MoMo API    │
│   WhatsApp Business │ SMS Gateway  │ Satellite Data│ Insurance Partners    │
│   Gig Platform APIs │ PAPSS        │ Open Banking  │ EAC KYC Harmonization  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Unified Technology Stack

### 2.1 Stack Rationale

The stack is optimized for **developer velocity in Nairobi**, **operational cost efficiency at scale**, and **regulatory compliance** across multiple EAC jurisdictions.

| Layer | Technology | Alternative Considered | Selection Rationale |
|---|---|---|---|
| **Mobile App** | Flutter 3.22 | React Native | Single codebase; excellent M-Pesa SDK support; strong Nairobi talent pool |
| **Mini Program** | Ant Mini Program Framework | Custom webview | Native M-Pesa Super App integration; proven at Alipay scale |
| **USSD** | Africa's Talking + custom gateway | Twilio | Proven in African markets; handles *384*77# routing; local support |
| **WhatsApp Bot** | WhatsApp Business API (Meta) + custom orchestrator | Custom SMS bot | Buyers already on WhatsApp; rich media (photos, catalogs); no app download |
| **API Services** | Node.js 20 (Express/Fastify) | Go, Java Spring Boot | Large Nairobi talent pool; excellent async I/O for payment webhooks |
| **Data Services** | Python 3.11 (FastAPI) | Node.js | ML/AI ecosystem (scikit-learn, XGBoost, PyTorch); data science team preference |
| **API Gateway** | Kong Gateway | AWS API Gateway | Cost-effective at scale; plugin ecosystem; multi-region deployment |
| **Database** | PostgreSQL 15 (RDS Multi-AZ) | MySQL 8, MongoDB | ACID for financial transactions; JSONB for flexible product rules; strong replication |
| **Cache** | Redis 7 (ElastiCache Cluster) | Memcached | Sessions, rate limits, real-time leaderboards, pub/sub for notifications |
| **Event Streaming** | Apache Kafka 3.6 (MSK) | AWS SNS/SQS, RabbitMQ | Event sourcing for audit; replay capability; exactly-once for financial events |
| **Object Storage** | AWS S3 + CloudFront | MinIO, GCS | 11 9's durability; CDN for global listing photos; compliance certifications |
| **Blockchain** | Hyperledger Fabric 2.5 | Ethereum, custom | Permissioned (no gas fees); regulator-friendly; enterprise-grade consensus |
| **ML/AI Platform** | AWS SageMaker + custom pipelines | Google Vertex AI | Feature store for credit scoring; model versioning; A/B testing |
| **Containers** | Amazon ECS (Fargate) | EKS, self-managed K8s | No cluster management; auto-scaling; pay-per-use; fast deployments |
| **CI/CD** | GitHub Actions + AWS CodeDeploy | GitLab CI, Jenkins | Native GitHub integration; matrix builds (Flutter iOS + Android) |
| **Observability** | Datadog + AWS CloudWatch | Grafana/Prometheus, New Relic | Full-stack APM; custom dashboards; anomaly detection; PagerDuty integration |
| **Secrets** | AWS Secrets Manager + Vault | Parameter Store | Auto-rotation for M-Pesa credentials; audit logging; fine-grained RBAC |

### 2.2 Regional Infrastructure

| Environment | Region | Purpose | Compliance |
|---|---|---|---|
| **Production Primary** | af-south-1 (Cape Town) | Live traffic | Kenya CBK data residency guidance |
| **Production Standby** | eu-west-1 (Ireland) | Disaster recovery | Cross-region backup |
| **Staging** | af-south-1 | Pre-production QA | Full M-Pesa sandbox |
| **Development** | af-south-1 | Feature branch testing | Shared dev RDS instance |

---

## 3. Service Specifications

### 3.1 Service Inventory

TWENDE deploys **10 core microservices** plus **3 infrastructure services** (Kong, Kafka, Redis). All services are stateless, horizontally scalable, and communicate via REST (synchronous) and Kafka (asynchronous).

| Service | Language | Instances (Prod) | Responsibility | Products Served |
|---|---|---|---|---|
| **User Service** | Node.js 20 | 2–4 | Authentication, KYC, profile management, consent | All 5 |
| **Chama Service** | Node.js 20 | 2–4 | Group lifecycle, member management, governance rules, ledger aggregation | Chama |
| **Biashara Service** | Python 3.11 (FastAPI) | 2–4 | Loan application, underwriting workflow, disbursement, repayment tracking | Biashara |
| **Kazi Service** | Node.js 20 | 2–4 | Gig worker enrollment, AutoSave, per-ride insurance, income analytics | Kazi |
| **Linda Service** | Python 3.11 (FastAPI) | 2–4 | Policy management, claims intake, AI adjudication, payout orchestration | Linda |
| **Soko Service** | Node.js 20 | 2–4 | Seller profiles, listings, order management, WhatsApp bot orchestration | Soko |
| **Transaction Service** | Python 3.11 (FastAPI) | 3–6 | All M-Pesa integrations, payment processing, ledger recording, reconciliation | All 5 |
| **Credit Scoring Engine** | Python 3.11 | 2–4 | Alternative credit score calculation, score history, pre-qualification logic | All 5 |
| **Notification Service** | Node.js 20 | 2–4 | Multi-channel delivery: SMS, push, WhatsApp, email | All 5 |
| **Ledger Service** | Python 3.11 | 2–4 | Financial ledger aggregation, reporting, blockchain anchoring, audit trails | All 5 |
| **Kong Gateway** | Kong 3.5 | 2 | API routing, auth, rate limiting, request transformation | All 5 |
| **Kafka Cluster** | Kafka 3.6 | 3 brokers | Event streaming, cross-product communication | All 5 |
| **Redis Cluster** | Redis 7 | 3 nodes | Session store, cache, rate limits, pub/sub | All 5 |

### 3.2 User Service

**Responsibility:** The identity backbone of the entire platform. All authentication, KYC verification, profile management, consent management, and credit score read access.

**API Surface:**

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/v1/auth/register` | POST | None | Initiate registration with phone number |
| `/v1/auth/verify-otp` | POST | None | Verify OTP, create account, set PIN |
| `/v1/auth/login` | POST | None | Login with phone + PIN |
| `/v1/auth/refresh` | POST | Refresh token | Rotate JWT access token |
| `/v1/auth/logout` | POST | JWT | Invalidate session |
| `/v1/users/me` | GET | JWT | Get full user profile |
| `/v1/users/me` | PATCH | JWT | Update profile fields |
| `/v1/users/me/kyc` | POST | JWT | Submit KYC documents |
| `/v1/users/me/kyc/status` | GET | JWT | Check KYC tier and verification status |
| `/v1/users/me/credit-score` | GET | JWT | Get current score + history + factors |
| `/v1/users/me/consent` | GET | JWT | List all consents |
| `/v1/users/me/consent` | PUT | JWT | Update consent preferences |
| `/v1/users/{phone}` | GET | Service JWT | Internal: get user by phone (other services) |
| `/v1/users/{id}/kyc/tier` | GET | Service JWT | Internal: get KYC tier for access control |

**Core Data Model:**

```sql
-- users: the universal identity record
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number        VARCHAR(15) UNIQUE NOT NULL,        -- E.164 format: +2547XXXXXXXX
    phone_country_code  VARCHAR(5) DEFAULT '+254',           -- For multi-country expansion
    mpesa_name          VARCHAR(100),                        -- Auto-fetched from Daraja
    display_name        VARCHAR(100),
    email               VARCHAR(255),
    pin_hash            VARCHAR(255) NOT NULL,              -- bcrypt, salt rounds 12
    biometric_enabled   BOOLEAN DEFAULT FALSE,
    
    -- KYC
    kyc_tier            SMALLINT DEFAULT 1 
                        CHECK (kyc_tier IN (1, 2, 3)),
    kyc_verified_at     TIMESTAMPTZ,
    national_id         VARCHAR(20),
    national_id_verified BOOLEAN DEFAULT FALSE,
    date_of_birth       DATE,
    address_verified    BOOLEAN DEFAULT FALSE,
    
    -- Credit (denormalized for fast reads; canonical in Credit Scoring Engine)
    credit_score        INTEGER DEFAULT 300 
                        CHECK (credit_score BETWEEN 300 AND 850),
    credit_score_updated_at TIMESTAMPTZ,
    
    -- Product enrollment flags
    has_chama           BOOLEAN DEFAULT FALSE,
    has_biashara        BOOLEAN DEFAULT FALSE,
    has_kazi            BOOLEAN DEFAULT FALSE,
    has_linda           BOOLEAN DEFAULT FALSE,
    has_soko_seller     BOOLEAN DEFAULT FALSE,
    
    -- Preferences
    preferred_language  VARCHAR(10) DEFAULT 'en',            -- en, sw, lg, ki
    notification_channels TEXT[] DEFAULT ARRAY['sms', 'push'], -- sms, push, whatsapp, email
    
    -- Status
    status              VARCHAR(20) DEFAULT 'active' 
                        CHECK (status IN ('active', 'suspended', 'deleted')),
    suspended_reason    TEXT,
    suspended_at        TIMESTAMPTZ,
    
    -- Audit
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    last_login_at       TIMESTAMPTZ,
    device_tokens       TEXT[] DEFAULT '{}'                  -- FCM tokens for push
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_kyc ON users(kyc_tier) WHERE status = 'active';
CREATE INDEX idx_users_credit ON users(credit_score) WHERE status = 'active';
CREATE INDEX idx_users_products ON users(has_chama, has_biashara, has_kazi, has_linda, has_soko_seller);

-- kyc_documents: verification evidence
CREATE TABLE kyc_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type       VARCHAR(50) NOT NULL,               -- national_id_front, national_id_back, selfie, proof_of_address
    document_url        VARCHAR(500) NOT NULL,              -- S3 URL
    verification_status VARCHAR(20) DEFAULT 'pending' 
                        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_provider VARCHAR(50),                      -- huduma_namba, nida, manual_review
    verification_confidence DECIMAL(3,2),                   -- ML model confidence (0.00-1.00)
    verified_at         TIMESTAMPTZ,
    rejection_reason    TEXT,
    reviewed_by         UUID REFERENCES users(id),          -- Admin who reviewed
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_docs_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_docs_status ON kyc_documents(verification_status);

-- user_consents: GDPR-compliant consent tracking
CREATE TABLE user_consents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_type        VARCHAR(50) NOT NULL,               -- credit_scoring, cross_product_sharing, marketing, research
    consent_given       BOOLEAN NOT NULL,
    given_at            TIMESTAMPTZ DEFAULT NOW(),
    revoked_at          TIMESTAMPTZ,
    ip_address          INET,
    user_agent          TEXT,
    UNIQUE(user_id, consent_type)
);

CREATE INDEX idx_consents_user ON user_consents(user_id);
```

**Key Business Logic:**

```python
# KYC tier promotion logic
def promote_kyc_tier(user_id: UUID) -> int:
    user = get_user(user_id)
    
    if user.kyc_tier == 1:
        # Tier 1 → Tier 2: requires verified national ID + selfie liveness
        docs = get_kyc_documents(user_id)
        has_verified_id = any(d.type in ['national_id_front', 'national_id_back'] 
                              and d.status == 'verified' for d in docs)
        has_selfie = any(d.type == 'selfie' and d.status == 'verified' for d in docs)
        
        if has_verified_id and has_selfie:
            user.kyc_tier = 2
            user.kyc_verified_at = timezone.now()
            publish_event('user.kyc_upgraded', {'user_id': user_id, 'new_tier': 2})
    
    elif user.kyc_tier == 2:
        # Tier 2 → Tier 3: requires address verification + 6 months history
        if user.address_verified and user.tenure_months >= 6:
            user.kyc_tier = 3
            publish_event('user.kyc_upgraded', {'user_id': user_id, 'new_tier': 3})
    
    return user.kyc_tier
```

### 3.3 Transaction Service (The Money Layer)

**Responsibility:** All M-Pesa integration, payment processing, financial ledger recording, and reconciliation. This is the single most critical service — it handles every KES that moves through the platform.

**API Surface:**

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/v1/transactions/initiate` | POST | Service JWT | Initiate any payment (STK Push, B2C, B2B, Ratiba) |
| `/v1/transactions/{id}` | GET | Service JWT | Get transaction status and details |
| `/v1/transactions/{id}/status` | GET | JWT | Public status check (for user-facing polling) |
| `/v1/webhooks/mpesa/c2b/validation` | POST | IP whitelist | M-Pesa C2B validation callback |
| `/v1/webhooks/mpesa/c2b/confirmation` | POST | IP whitelist | M-Pesa C2B confirmation callback |
| `/v1/webhooks/mpesa/b2c/result` | POST | IP whitelist | M-Pesa B2C result callback |
| `/v1/webhooks/mpesa/stk/callback` | POST | IP whitelist | M-Pesa STK Push callback |
| `/v1/webhooks/mpesa/ratiba/callback` | POST | IP whitelist | M-Pesa Ratiba callback |
| `/v1/transactions/reconcile` | POST | Service JWT | Manual reconciliation trigger |
| `/v1/float/balance/{shortcode}` | GET | Service JWT | Check M-Pesa float balance |

**Core Data Model:**

```sql
-- transactions: the single source of truth for all money movement
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classification
    transaction_type    VARCHAR(30) NOT NULL 
                        CHECK (transaction_type IN (
                            'chama_contribution', 'chama_loan_disbursement', 'chama_loan_repayment',
                            'biashara_loan_disbursement', 'biashara_loan_repayment', 'biashara_merchant_payment',
                            'kazi_autosave', 'kazi_insurance_premium', 'kazi_emergency_loan_disbursement', 'kazi_emergency_loan_repayment',
                            'linda_premium_collection', 'linda_claim_payout',
                            'soko_buyer_payment', 'soko_seller_cashout', 'soko_delivery_fee',
                            'platform_fee', 'referral_bonus', 'refund'
                        )),
    product             VARCHAR(20) NOT NULL 
                        CHECK (product IN ('chama', 'biashara', 'kazi', 'linda', 'soko', 'platform')),
    
    -- Financial details
    amount              DECIMAL(12,2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'KES',
    fee_amount          DECIMAL(12,2) DEFAULT 0,
    net_amount          DECIMAL(12,2) NOT NULL,            -- amount - fee
    
    -- Parties
    sender_id           UUID REFERENCES users(id),          -- Nullable for external senders
    sender_phone        VARCHAR(15),                        -- For external/external verification
    recipient_id        UUID REFERENCES users(id),
    recipient_phone     VARCHAR(15),
    
    -- M-Pesa integration
    mpesa_receipt_number VARCHAR(50),
    mpesa_transaction_id VARCHAR(50),
    mpesa_shortcode     VARCHAR(15),
    mpesa_phone_number  VARCHAR(15),
    mpesa_checkout_request_id VARCHAR(50),                  -- For STK Push
    mpesa_merchant_request_id VARCHAR(50),
    mpesa_callback_payload JSONB,
    mpesa_result_code   INTEGER,                            -- 0 = success
    mpesa_result_description TEXT,
    
    -- Status workflow
    status              VARCHAR(20) DEFAULT 'pending' 
                        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed', 'refunded')),
    
    -- Product-specific references
    chama_id            UUID,                               -- For chama transactions
    loan_id             UUID,                               -- For loan disbursements/repayments
    order_id            UUID,                               -- For soko orders
    policy_id           UUID,                               -- For linda policies/payouts
    
    -- Initiation
    initiated_via       VARCHAR(20) NOT NULL 
                        CHECK (initiated_via IN ('app', 'mini_app', 'ussd', 'whatsapp', 'api', 'auto', 'webhook')),
    initiated_by_user_id UUID REFERENCES users(id),
    
    -- Audit & security
    ip_address          INET,
    user_agent          TEXT,
    idempotency_key     VARCHAR(64) UNIQUE,                 -- Prevent duplicate processing
    risk_score          DECIMAL(3,2),                       -- Fraud detection score
    held_for_review     BOOLEAN DEFAULT FALSE,
    
    -- Blockchain
    blockchain_anchor_hash VARCHAR(128),
    anchored_at         TIMESTAMPTZ,
    
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    reversed_at         TIMESTAMPTZ
);

-- Critical indexes
CREATE INDEX idx_transactions_product_type ON transactions(product, transaction_type);
CREATE INDEX idx_transactions_status_created ON transactions(status, created_at) 
    WHERE status = 'pending';
CREATE INDEX idx_transactions_sender ON transactions(sender_id, created_at DESC);
CREATE INDEX idx_transactions_recipient ON transactions(recipient_id, created_at DESC);
CREATE INDEX idx_transactions_chama ON transactions(chama_id) WHERE chama_id IS NOT NULL;
CREATE INDEX idx_transactions_loan ON transactions(loan_id) WHERE loan_id IS NOT NULL;
CREATE INDEX idx_transactions_order ON transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_transactions_mpesa_receipt ON transactions(mpesa_receipt_number);
CREATE INDEX idx_transactions_idempotency ON transactions(idempotency_key);

-- Partitioning strategy: partition by month for transactions (Year 2+)
-- CREATE TABLE transactions_y2026m07 PARTITION OF transactions 
--     FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- transaction_events: audit trail for status changes
CREATE TABLE transaction_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id      UUID REFERENCES transactions(id) ON DELETE CASCADE,
    event_type          VARCHAR(30) NOT NULL,
    previous_status     VARCHAR(20),
    new_status          VARCHAR(20),
    metadata            JSONB,                              -- Flexible event data
    created_by          UUID REFERENCES users(id),          -- NULL = system
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_txn_events_txn ON transaction_events(transaction_id);
CREATE INDEX idx_txn_events_type ON transaction_events(event_type);
```

**M-Pesa Integration Flow (Unified):**

```python
class TransactionService:
    
    async def initiate_payment(self, request: PaymentRequest) -> Transaction:
        # 1. Validate idempotency
        if await self.is_idempotency_key_used(request.idempotency_key):
            return await self.get_transaction_by_idempotency_key(request.idempotency_key)
        
        # 2. Validate user and KYC tier
        user = await self.user_service.get_user(request.user_id)
        if user.kyc_tier < request.required_kyc_tier:
            raise InsufficientKYCTierError()
        
        # 3. Fraud check
        risk_score = await self.fraud_engine.evaluate(request)
        if risk_score > 0.8:
            raise TransactionBlockedError("High risk score")
        
        # 4. Create transaction record
        txn = await self.create_transaction(request, risk_score)
        
        # 5. Route to appropriate M-Pesa API
        if request.payment_method == 'stk_push':
            mpesa_response = await self.daraja_client.initiate_stk_push(
                phone_number=request.phone,
                amount=request.amount,
                account_reference=request.reference,
                transaction_desc=request.description
            )
            txn.mpesa_checkout_request_id = mpesa_response.checkout_request_id
            txn.status = 'processing'
        
        elif request.payment_method == 'b2c':
            mpesa_response = await self.daraja_client.initiate_b2c(
                phone_number=request.phone,
                amount=request.amount,
                occasion=request.description
            )
            txn.mpesa_merchant_request_id = mpesa_response.merchant_request_id
            txn.status = 'processing'
        
        elif request.payment_method == 'ratiba':
            mpesa_response = await self.daraja_client.schedule_recurring(
                phone_number=request.phone,
                amount=request.amount,
                frequency=request.frequency,
                start_date=request.start_date
            )
            txn.status = 'processing'
        
        await self.save_transaction(txn)
        
        # 6. Publish event
        await self.kafka_producer.send('transaction.initiated', {
            'transaction_id': str(txn.id),
            'product': txn.product,
            'type': txn.transaction_type,
            'amount': float(txn.amount),
            'user_id': str(request.user_id)
        })
        
        return txn
    
    async def handle_mpesa_callback(self, callback: MpesaCallback) -> None:
        # 1. Validate callback signature (HMAC-SHA256)
        if not self.validate_callback_signature(callback):
            logger.error("Invalid callback signature")
            return
        
        # 2. Find transaction
        txn = await self.find_transaction_by_callback(callback)
        if not txn:
            logger.error(f"Transaction not found for callback: {callback}")
            return
        
        # 3. Process result
        if callback.result_code == 0:
            txn.status = 'completed'
            txn.mpesa_receipt_number = callback.receipt_number
            txn.mpesa_transaction_id = callback.transaction_id
            txn.completed_at = timezone.now()
            
            # 4. Publish completion event
            await self.kafka_producer.send('transaction.completed', {
                'transaction_id': str(txn.id),
                'product': txn.product,
                'type': txn.transaction_type,
                'amount': float(txn.amount),
                'mpesa_receipt': txn.mpesa_receipt_number
            })
        else:
            txn.status = 'failed'
            txn.mpesa_result_code = callback.result_code
            txn.mpesa_result_description = callback.result_description
            txn.failed_at = timezone.now()
            
            await self.kafka_producer.send('transaction.failed', {
                'transaction_id': str(txn.id),
                'error_code': callback.result_code,
                'error_description': callback.result_description
            })
        
        await self.save_transaction(txn)
```

### 3.4 Credit Scoring Engine

**Responsibility:** Calculate and maintain the 300–850 credit score for every user, incorporating data from all five products. This is a Python-based service with ML model inference for score calculation.

**Scoring Pipeline:**

```python
class CreditScoringEngine:
    
    FEATURE_WEIGHTS = {
        'chama_contribution_consistency': 0.20,
        'mpesa_transaction_pattern': 0.15,
        'soko_sales_revenue': 0.20,
        'loan_repayment_history': 0.25,
        'gig_income_stability': 0.10,
        'insurance_claims_history': 0.05,
        'kyc_tier': 0.05
    }
    
    async def calculate_score(self, user_id: UUID) -> CreditScoreResult:
        user = await self.user_service.get_user(user_id)
        
        # Gather features from all products
        features = {}
        
        # Chama: contribution consistency (0-1)
        chama_data = await self.chama_service.get_contribution_history(user_id, months=6)
        features['chama_contribution_consistency'] = self._calc_contribution_consistency(chama_data)
        
        # M-Pesa: transaction pattern score (0-1)
        mpesa_data = await self.transaction_service.get_transaction_patterns(user_id, months=6)
        features['mpesa_transaction_pattern'] = self._calc_transaction_pattern(mpesa_data)
        
        # Soko: sales revenue score (0-1)
        soko_data = await self.soko_service.get_sales_history(user_id, months=6)
        features['soko_sales_revenue'] = self._calc_sales_score(soko_data)
        
        # Biashara: loan repayment (0-1)
        loan_data = await self.biashara_service.get_loan_repayment_history(user_id)
        features['loan_repayment_history'] = self._calc_repayment_score(loan_data)
        
        # Kazi: gig income stability (0-1)
        kazi_data = await self.kazi_service.get_income_history(user_id, months=6)
        features['gig_income_stability'] = self._calc_income_stability(kazi_data)
        
        # Linda: insurance claims (0-1, bonus for no claims)
        linda_data = await self.linda_service.get_claims_history(user_id)
        features['insurance_claims_history'] = self._calc_insurance_score(linda_data)
        
        # KYC tier base
        features['kyc_tier'] = {1: 0.0, 2: 0.5, 3: 1.0}[user.kyc_tier]
        
        # Calculate weighted score
        weighted_score = sum(
            features[key] * weight * 550 + 300 
            for key, weight in self.FEATURE_WEIGHTS.items()
        )
        
        # Clamp to 300-850
        final_score = max(300, min(850, int(weighted_score)))
        
        # Determine tier and unlocked products
        tier = self._score_to_tier(final_score)
        unlocked_products = self._get_unlocked_products(final_score, user.kyc_tier)
        
        # Store result
        result = CreditScoreResult(
            user_id=user_id,
            score=final_score,
            previous_score=user.credit_score,
            change=final_score - user.credit_score,
            features=features,
            tier=tier,
            unlocked_products=unlocked_products,
            calculated_at=timezone.now()
        )
        
        await self.save_score(result)
        
        # Publish event
        await self.kafka_producer.send('credit.score.updated', {
            'user_id': str(user_id),
            'new_score': final_score,
            'previous_score': user.credit_score,
            'change_reason': self._determine_change_reason(result)
        })
        
        return result
```

---

## 4. Event-Driven Architecture

### 4.1 Kafka Topic Design

All cross-product communication happens through Kafka. Each product publishes events to topics that other products consume.

| Topic | Producer | Consumers | Payload |
|---|---|---|---|
| `user.registered` | User Service | All products | User ID, phone, KYC tier |
| `user.kyc_upgraded` | User Service | Credit Engine, Biashara, Linda | User ID, new tier |
| `user.credit_score.updated` | Credit Engine | Biashara, Linda, All products | User ID, score, change, unlocked products |
| `transaction.completed` | Transaction Service | Credit Engine, Ledger, Notification | Transaction details, product, amount |
| `transaction.failed` | Transaction Service | Notification, Product services | Error details, retry logic |
| `chama.contribution.received` | Chama Service | Credit Engine, Ledger, Notification | Member ID, amount, chama ID |
| `chama.loan.approved` | Chama Service | Transaction Service, Notification, Ledger | Loan ID, amount, borrower ID |
| `chama.group_order.initiated` | Chama Service | Soko Service | Chama ID, listing ID, organizer ID |
| `biashara.loan.applied` | Biashara Service | Credit Engine, Risk Engine | User ID, amount, purpose |
| `biashara.loan.disbursed` | Biashara Service | Transaction Service, Credit Engine | Loan ID, amount, disbursement txn |
| `biashara.loan.repaid` | Biashara Service | Credit Engine, Linda | Loan ID, amount, days early/late |
| `kazi.gig.completed` | Kazi Service | Credit Engine, Kazi (AutoSave) | Worker ID, amount, platform |
| `kazi.autosave.triggered` | Kazi Service | Transaction Service | Worker ID, amount saved |
| `kazi.insurance_claim.filed` | Kazi Service | Linda Service | Worker ID, claim type, amount |
| `linda.policy.created` | Linda Service | Transaction Service (premium), Notification | User ID, policy type, premium |
| `linda.claim.approved` | Linda Service | Transaction Service (payout), Credit Engine | Claim ID, payout amount |
| `linda.claim.paid` | Linda Service | Notification, Credit Engine | Claim details, payout txn |
| `soko.order.paid` | Soko Service | Credit Engine, Biashara, Linda, Ledger | Order ID, amount, seller ID, buyer ID |
| `soko.seller.activated` | Soko Service | Biashara, Linda | Seller ID, phone, store URL |
| `soko.delivery.requested` | Soko Service | Kazi Service | Order ID, pickup, destination, fee |
| `notification.sms` | Notification Service | SMS Gateway | Phone, message, priority |
| `notification.push` | Notification Service | FCM | Device tokens, payload |
| `notification.whatsapp` | Notification Service | WhatsApp Business API | Phone, message template, variables |
| `ledger.anchor.daily` | Ledger Service | Blockchain Service | Daily transaction hash |

### 4.2 Event Processing Guarantees

| Guarantee | Implementation | Rationale |
|---|---|---|
| **Exactly-once processing** | Kafka transactions + idempotent consumers | Financial events must never be duplicated |
| **Ordered processing per user** | Same `user_id` partition key | Credit score updates must be sequential |
| **Dead letter queue** | Failed events → DLQ topic + alerting | Manual review for failed financial events |
| **Event retention** | 30 days for operational topics, 7 years for financial topics | Regulatory compliance + replay capability |
| **Schema evolution** | Avro schemas with Confluent Schema Registry | Backward compatibility as events evolve |

---

## 5. Database Architecture

### 5.1 Unified Schema Overview

The database is designed as a **single PostgreSQL cluster** with all product tables in the same schema (namespaced by product prefix). This enables cross-product queries for analytics, credit scoring, and reporting without ETL complexity.

| Namespace | Tables | Records (Year 3 est.) |
|---|---|---|
| `users.*` | users, kyc_documents, user_consents, sessions | 5M |
| `chama.*` | chamas, chama_members, chama_rules, chama_invites | 75K groups, 1.25M memberships |
| `biashara.*` | loans, loan_repayments, loan_votes, merchant_accounts | 100K loans, 500K repayments |
| `kazi.*` | gig_workers, gig_sessions, autosave_rules, insurance_policies | 300K workers, 10M sessions |
| `linda.*` | policies, claims, claim_documents, underwriter_agreements | 300K policies, 50K claims |
| `soko.*` | sellers, listings, orders, order_items, cashouts | 50K sellers, 400K monthly orders |
| `transactions.*` | transactions, transaction_events | 50M+ (partitioned monthly) |
| `credit.*` | credit_scores, credit_score_history, score_factors | 5M scores, 30M history records |
| `ledger.*` | daily_ledger_snapshots, blockchain_anchors | 1K daily snapshots |

### 5.2 Key Relationships

```sql
-- The golden thread: every financial transaction links to a user and a product
-- transactions.user_id → users.id (who initiated)
-- transactions.recipient_id → users.id (who received)
-- transactions.chama_id → chama.chamas.id (if chama-related)
-- transactions.loan_id → biashara.loans.id (if loan-related)
-- transactions.order_id → soko.orders.id (if commerce-related)
-- transactions.policy_id → linda.policies.id (if insurance-related)

-- Credit scores reference all products
-- credit.credit_scores.user_id → users.id
-- Score calculation queries:
--   - chama.chama_members (contribution history)
--   - transactions.transactions (M-Pesa patterns)
--   - soko.orders (sales revenue)
--   - biashara.loan_repayments (repayment history)
--   - kazi.gig_sessions (income stability)
--   - linda.claims (insurance history)
```

### 5.3 Scaling Strategy

| Strategy | Implementation | Timeline |
|---|---|---|
| **Read replicas** | 2 RDS read replicas from Day 1 | Immediate |
| **Connection pooling** | PgBouncer (transaction mode), max 100 per service | Immediate |
| **Table partitioning** | Monthly partitions on `transactions` table when > 10M rows | Year 2 |
| **Read replica routing** | Write to primary, read from replicas; stale read tolerance: 1 second | Immediate |
| **Archival** | Transactions > 2 years → S3 (Parquet); metadata retained in DB | Year 2 |
| **Sharding** | Consider by `user_id` hash if single DB bottlenecked | Year 3+ |
| **Caching** | Redis for: credit scores (1h TTL), user sessions (24h), chama balances (5min) | Immediate |

---

## 6. Security Architecture

### 6.1 Threat Model

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| M-Pesa callback spoofing | High | Critical | HMAC-SHA256 + IP whitelist + nonce validation |
| Replay attacks | Medium | High | Idempotency keys (24h Redis TTL) |
| Account takeover | Medium | Critical | OTP + PIN + biometric + device fingerprinting + anomaly alerts |
| Insider fraud | Low | Critical | RBAC + 2-person approval for financial ops + audit logging |
| Data breach | Low | Critical | AES-256 at rest + field-level encryption for PII |
| DDoS | Medium | Medium | Kong rate limiting + AWS WAF + auto-scaling |
| SIM swap | Medium | High | Device fingerprinting + new device verification flow |
| Cross-product data leakage | Medium | High | Consent management + service-to-service auth |

### 6.2 Authentication Layers

| Layer | Mechanism | Scope |
|---|---|---|
| **Client → Gateway** | JWT (RS256, 24h expiry) | User-facing APIs |
| **Gateway → Services** | JWT (RS256, 5min expiry) | Internal API calls |
| **Service → Service** | mTLS + service account JWT | Microservice communication |
| **Service → M-Pesa** | OAuth 2.0 + consumer key/secret | Daraja API |
| **Service → Kafka** | SASL/SCRAM + TLS | Event streaming |
| **Service → Database** | IAM authentication + SSL | Database connections |

### 6.3 Role-Based Access Control

| Role | Permissions | Scope |
|---|---|---|
| `anonymous` | Register, login, verify OTP, browse public Soko stores | Platform-wide |
| `user` | All product features allowed by KYC tier | Own data only |
| `chama_admin` | Manage group settings, members, rules, loans | Specific chama |
| `chama_treasurer` | View all balances, generate reports, manage contributions | Specific chama |
| `biashara_merchant` | Access merchant tools, loan management, analytics | Own business |
| `kazi_platform` | Embed Kazi SDK, access worker financial data (with consent) | Specific gig platform |
| `linda_underwriter` | View risk data, approve claims (limited) | Insurance partner |
| `soko_seller` | Manage listings, orders, cashout | Own store |
| `support_agent` | View user data for troubleshooting, cannot modify financial state | Assigned users |
| `compliance_officer` | View audit trails, suspend accounts, file SARs | Platform-wide |
| `admin` | Full access to all systems | Platform-wide |
| `system` | Machine-to-machine, no human auth | Internal services only |

---

## 7. Infrastructure & Deployment

### 7.1 AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud (af-south-1)                          │
│                                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                             │
│   │ Route 53 │───▶│CloudFront│───▶│   WAF    │                             │
│   │   DNS    │    │   CDN    │    │ Firewall │                             │
│   └──────────┘    └──────────┘    └────┬─────┘                             │
│                                        │                                     │
│                              ┌─────────▼─────────┐                         │
│                              │   Kong Gateway    │                         │
│                              │   ECS Fargate x2  │                         │
│                              └─────────┬─────────┘                         │
│                                        │                                     │
│   ┌────────────────────────────────────┼────────────────────────────────┐  │
│   │                        ECS SERVICES (Fargate)                        │  │
│   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  │
│   │  │User  │ │Chama │ │Biasha│ │Kazi  │ │Linda │ │Soko  │ │Txn   │  │  │
│   │  │Svc x2│ │Svc x2│ │ra x2 │ │Svc x2│ │Svc x2│ │Svc x2│ │Svc x3│  │  │
│   │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │  │
│   │  ┌──────┐ ┌──────┐ ┌──────┐                                       │  │
│   │  │Credit│ │Notif │ │Ledger│                                       │  │
│   │  │Eng x2│ │Svc x2│ │Svc x2│                                       │  │
│   │  └──────┘ └──────┘ └──────┘                                       │  │
│   └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │RDS PostgreSQL│  │ElastiCache   │  │MSK Kafka     │  │S3 +        │  │
│   │Multi-AZ + 2RR│  │Redis Cluster │  │3 brokers     │  │CloudFront  │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│   │Secrets Manager│  │CloudWatch    │  │Datadog       │  │SageMaker   │  │
│   │+ Vault       │  │+ CloudTrail  │  │APM + Logs    │  │ML Pipeline │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Deployment Pipeline

| Stage | Trigger | Duration | Gates |
|---|---|---|---|
| **Build** | PR merge to `main` | 10 min | Unit tests, lint, type check, security scan (Snyk) |
| **Staging Deploy** | Build success | 5 min | Blue-green deploy to staging ECS |
| **Integration Tests** | Staging deploy | 15 min | API contract tests (Pact), E2E tests (Maestro), load tests (k6) |
| **Manual QA** | Integration pass | Variable | Exploratory testing on staging |
| **Production Deploy** | QA sign-off + approval | 10 min | Blue-green deploy; automatic rollback if health checks fail |
| **Canary** | Production deploy | 30 min | 5% traffic → 25% → 100%; automatic rollback on error rate > 1% |

### 7.3 Service-Level Objectives (SLOs)

| Service | Availability | P95 Latency | Error Rate |
|---|---|---|---|
| Kong Gateway | 99.99% | 10ms | <0.01% |
| User Service | 99.95% | 100ms | <0.1% |
| Transaction Service | 99.99% | 200ms | <0.01% |
| Credit Scoring Engine | 99.9% | 500ms | <0.1% |
| Notification Service | 99.9% | 50ms | <0.5% |
| M-Pesa Integration | 99.5% (external dependency) | 5s (STK Push) | <1% |

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

| Level | Target Coverage | Tools | Owner |
|---|---|---|---|
| **Unit tests** | 80%+ | Jest (Node), pytest (Python), Flutter Test | Developers |
| **Integration tests** | 70%+ | Postman/Newman, Supertest, TestContainers | QA + Backend |
| **Contract tests** | 100% API surface | Pact | Backend |
| **E2E tests** | 15 critical flows | Maestro (mobile), Playwright (web) | QA |
| **Load tests** | 3× expected peak | k6, Artillery | Performance |
| **Chaos tests** | Monthly | AWS Fault Injection Simulator | DevOps |
| **Security tests** | Quarterly | OWASP ZAP, Burp Suite, pen test firm | Security |

### 8.2 Critical Cross-Product Test Scenarios

| Scenario | Products Involved | Validation |
|---|---|---|
| User joins chama → contributes for 6 months → qualifies for Biashara loan | Chama → Biashara | Credit score updates; pre-qualified offer generated |
| User takes Biashara loan → repays on time → insurance premium reduced | Biashara → Linda | Credit score improves; Linda recalculates premium |
| Gig worker saves via Kazi → uses savings as collateral for Biashara loan | Kazi → Biashara | AutoSave balance recognized; loan approved |
| Seller makes Soko sale → revenue improves credit → qualifies for larger loan | Soko → Biashara | Sales data feeds credit score; loan limit increases |
| Chama group order on Soko → individual payments → consolidated order | Chama → Soko | All members charged individually; seller sees one order |
| Soko delivery via Kazi rider → rider accident → Linda claim filed | Soko → Kazi → Linda | Delivery completed; accident claim approved and paid |
| M-Pesa outage → transactions queued → processed when service returns | Transaction Service (all) | Zero data loss; automatic retry with exponential backoff |
| SIM swap fraud attempt → account locked → legitimate user recovers | User Service + Fraud Engine | Fraud detected; user verifies identity and unlocks |

---

## 9. Monitoring & Observability

### 9.1 The Four Golden Signals (per service)

| Signal | Metric | Alert Threshold | PagerDuty Priority |
|---|---|---|---|
| **Latency** | P95 response time | > 500ms for 5 min | P3 |
| **Traffic** | Requests per second | < 20% of baseline for 10 min | P2 |
| **Errors** | 5xx error rate | > 0.5% for 5 min | P2 |
| **Saturation** | CPU/memory utilization | > 85% for 10 min | P3 |

### 9.2 Business Metrics Dashboard

| Metric | Tool | Refresh |
|---|---|---|
| MAU / DAU by product | Mixpanel | Real-time |
| Transaction volume by product | Datadog | 1 minute |
| Credit score distribution | Custom (Metabase) | Hourly |
| Loan NPL rate | Custom (Metabase) | Daily |
| Insurance loss ratio | Custom (Metabase) | Daily |
| Soko GMV | Custom (Metabase) | Hourly |
| Cross-sell rate | Mixpanel | Daily |
| Revenue by product | Custom (Metabase) | Hourly |

### 9.3 Distributed Tracing

OpenTelemetry traces flow from Kong Gateway through all downstream services. Each request carries:
- `x-request-id` (UUID, generated at edge)
- `x-user-id` (for user-scoped tracing)
- `x-product` (which TWENDE product initiated)

Trace retention: 14 days in Datadog; sampled at 10% for high-traffic endpoints.

---

## 10. Open Technical Issues

| # | Issue | Impact | Proposed Resolution | Timeline |
|---|---|---|---|---|
| 1 | Daraja 3.0 Ratiba API documentation incomplete | Blocks AutoSave and recurring premium features | Engage Safaricom dev relations; fallback to STK Push + scheduled cron | Month 2 |
| 2 | WhatsApp Business API rate limits (80 msg/sec) | May throttle Soko bot at scale | Implement message queuing + batching; apply for higher limits | Month 3 |
| 3 | Multi-country KYC (Huduma Namba, NIDA, NIRA) | Different APIs, formats, SLA | Build KYC abstraction layer; country-specific adapters | Month 3 |
| 4 | Hyperledger Fabric operational complexity | Blockchain anchoring may delay releases | Start with daily batch anchoring; dedicated Fabric operator hire | Month 4 |
| 5 | Credit scoring model cold-start | New users have no history → low scores | Rule-based scoring for first 90 days; transition to ML after data积累 | Month 1–3 |
| 6 | Gig platform API variability | SafeBoda, Bolt, Glovo have different APIs | Build adapter pattern; start with 1 platform, expand | Month 3–6 |
| 7 | M-Pesa Mini Program debugging tools | Limited visibility into Mini App errors | Comprehensive client-side logging; request Ant Group dev tools | Month 3 |
| 8 | Cross-border data residency | Kenya, TZ, Uganda have different data laws | Regional deployment; data stays in country of origin | Month 6 |

---

*TRD Version 2.0 (Unified) — July 2026*  
*Next Review Date: August 2026 (post-Phase 0 architecture review)*  
*Document Owner: Engineering Team, TWENDE*
