# Sprint 2: Backend API Foundation

**Goal:** Real database (PostgreSQL), real REST API (Node.js/Express), real data persistence. Frontend mock services replaced with actual API calls.  
**Duration:** 1.5 weeks  
**Dependencies:** Sprint 1 (Authentication & Onboarding)  
**Business Value:** Data persistence enables everything — real users, real transactions, real credit scores.

---

## User Stories

### Story 2.1: User API

**As the** frontend, **I want** to call REST endpoints for user management, **so that** user data persists across sessions.

**Acceptance Criteria:**
- [ ] `POST /api/v1/auth/register` — Create user with phone + KYC data
- [ ] `POST /api/v1/auth/login` — Verify phone + PIN, return JWT tokens
- [ ] `POST /api/v1/auth/refresh` — Refresh access token using refresh token
- [ ] `POST /api/v1/auth/logout` — Invalidate tokens
- [ ] `GET /api/v1/users/me` — Get current user profile (JWT required)
- [ ] `PATCH /api/v1/users/me` — Update user profile (JWT required)
- [ ] `POST /api/v1/users/me/kyc` — Submit KYC documents
- [ ] `GET /api/v1/users/me/kyc/status` — Check KYC verification status
- [ ] All endpoints return consistent JSON format: `{ success: boolean, data?: any, error?: { code, message } }`

### Story 2.2: Database Schema

**As the** backend, **I want** a PostgreSQL database with proper schema, **so that** all data is persisted reliably.

**Acceptance Criteria:**
- [ ] PostgreSQL 15 database created locally (Docker for dev, RDS for staging/prod)
- [ ] `users` table with all fields from Sprint 1 types
- [ ] `kyc_documents` table for ID uploads
- [ ] `sessions` table for token management
- [ ] Migration system in place (node-pg-migrate or similar)
- [ ] Seed data script creates demo user (+254712345678, PIN "1234")
- [ ] Connection pooling configured (PgBouncer for production)

### Story 2.3: Chama API

**As the** frontend Chama dashboard, **I want** REST endpoints for savings groups, **so that** chama data persists.

**Acceptance Criteria:**
- [ ] `GET /api/v1/chamas` — List user's chamas
- [ ] `POST /api/v1/chamas` — Create new chama
- [ ] `GET /api/v1/chamas/:id` — Get chama details
- [ ] `POST /api/v1/chamas/:id/members` — Invite member
- [ ] `POST /api/v1/chamas/:id/contributions` — Record contribution
- [ ] `GET /api/v1/chamas/:id/ledger` — Get transaction ledger
- [ ] `POST /api/v1/chamas/:id/loans` — Request group loan
- [ ] `POST /api/v1/chamas/:id/loans/:loanId/vote` — Vote on loan

### Story 2.4: Middleware & Security

**As the** platform, **I want** proper middleware for auth, logging, and error handling, **so that** the API is secure and maintainable.

**Acceptance Criteria:**
- [ ] JWT verification middleware (`Authorization: Bearer <token>`)
- [ ] Rate limiting (100 req/min per IP, 1000 req/min per user)
- [ ] Request logging (method, path, status, duration, user ID)
- [ ] Error handling middleware (consistent error responses)
- [ ] CORS configured (allow Vercel frontend domain)
- [ ] Helmet.js for security headers
- [ ] Input validation (Zod schemas for all endpoints)

### Story 2.5: API Documentation

**As a** developer, **I want** API documentation, **so that** frontend and backend teams can integrate easily.

**Acceptance Criteria:**
- [ ] OpenAPI 3.1 spec generated from code
- [ ] Swagger UI available at `/api/docs`
- [ ] All endpoints documented with request/response examples

---

## Technical Implementation

### Backend Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | Same language as frontend, large talent pool |
| Framework | Express.js 4 | Mature, well-documented, middleware ecosystem |
| Database | PostgreSQL 15 | ACID compliance, JSONB support, excellent replication |
| ORM | Drizzle ORM | Type-safe, lightweight, excellent TypeScript support |
| Auth | JWT (jose library) | RS256 signing, industry standard |
| Validation | Zod | TypeScript-first, runtime validation |
| Logging | Pino | Fast, structured JSON logging |
| Rate Limit | express-rate-limit | Simple, Redis-backed for production |
| Security | Helmet + CORS | Security headers, cross-origin protection |

### Project Structure

```
twende-api/                    # New folder — backend project
├── src/
│   ├── index.ts              # Entry point, server start
│   ├── app.ts                # Express app configuration
│   ├── config/
│   │   ├── database.ts       # Drizzle ORM setup
│   │   ├── env.ts            # Environment variable validation (Zod)
│   │   └── logger.ts         # Pino logger configuration
│   ├── db/
│   │   ├── schema.ts         # All Drizzle table definitions
│   │   ├── migrations/       # Migration files
│   │   └── seed.ts           # Seed data script
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification middleware
│   │   ├── errorHandler.ts   # Global error handler
│   │   ├── rateLimiter.ts    # Rate limiting
│   │   ├── logger.ts         # Request logging
│   │   └── validate.ts       # Zod validation wrapper
│   ├── routes/
│   │   ├── auth.ts           # Auth endpoints
│   │   ├── users.ts          # User endpoints
│   │   ├── chamas.ts         # Chama endpoints
│   │   └── index.ts          # Route aggregation
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   └── chamaController.ts
│   ├── services/
│   │   ├── authService.ts    # Business logic
│   │   ├── userService.ts
│   │   └── chamaService.ts
│   ├── utils/
│   │   ├── jwt.ts            # JWT sign/verify helpers
│   │   ├── bcrypt.ts         # Password hashing
│   │   └── otp.ts            # OTP generation
│   └── types/
│       └── index.ts          # Shared TypeScript types
├── drizzle.config.ts         # Drizzle configuration
├── package.json
├── tsconfig.json
└── Dockerfile                # For containerized deployment
```

### Database Schema (Drizzle ORM)

```typescript
// src/db/schema.ts

import { pgTable, uuid, varchar, timestamp, integer, boolean, jsonb, decimal, smallint, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: varchar('phone_number', { length: 15 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
  kycTier: smallint('kyc_tier').notNull().default(1),
  kycVerifiedAt: timestamp('kyc_verified_at', { withTimezone: true }),
  nationalId: varchar('national_id', { length: 20 }),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  creditScore: integer('credit_score').notNull().default(300),
  avatar: varchar('avatar', { length: 10 }).notNull().default(''),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  documentUrl: varchar('document_url', { length: 500 }).notNull(),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('pending'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  deviceInfo: jsonb('device_info'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chamas = pgTable('chamas', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  shortcode: varchar('shortcode', { length: 10 }).notNull().unique(),
  contributionAmount: decimal('contribution_amount', { precision: 12, scale: 2 }).notNull(),
  contributionFrequency: varchar('contribution_frequency', { length: 20 }).notNull(),
  maxLoanMultiplier: decimal('max_loan_multiplier', { precision: 3, scale: 1 }).notNull().default('2.0'),
  loanInterestRate: decimal('loan_interest_rate', { precision: 5, scale: 2 }).notNull().default('5.00'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chamaMembers = pgTable('chama_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  chamaId: uuid('chama_id').references(() => chamas.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  individualBalance: decimal('individual_balance', { precision: 12, scale: 2 }).notNull().default('0'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Environment Variables (.env)

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/twende

# JWT
JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----
JWT_ACCESS_EXPIRY=24h
JWT_REFRESH_EXPIRY=30d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# M-Pesa (placeholder for Sprint 4)
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=xxx
MPESA_PASSKEY=xxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Guardrails (Sprint 2 Specific)

| Guardrail | Why | How |
|---|---|---|
| **Never commit .env file** | Secrets exposure | `.env` in `.gitignore`, use `.env.example` for template |
| **Always validate environment variables on startup** | Catch misconfiguration early | Zod schema validates all env vars, server refuses to start if invalid |
| **Never return PIN hashes in API responses** | Security breach | Explicitly exclude `pinHash` from all user response DTOs |
| **Always use parameterized queries** | SQL injection prevention | Drizzle ORM handles this automatically |
| **Database migrations must be reversible** | Safe deployments | Every migration has `up` and `down` functions |
| **Never run migrations automatically in production** | Data corruption risk | Manual migration execution with backup |
| **All API responses must be JSON** | Consistency | Error handler converts all errors to JSON |
| **Log all authentication attempts** | Security audit | Failed logins, token refreshes, logout events logged |

---

## Testing Checklist

| # | Test | Command/Method |
|---|---|---|
| 1 | Server starts without errors | `npm run dev` |
| 2 | Database connects | Check console output |
| 3 | Migrations run successfully | `npm run db:migrate` |
| 4 | Seed data creates demo user | `npm run db:seed` |
| 5 | Register endpoint creates user | `curl -X POST http://localhost:3001/api/v1/auth/register` |
| 6 | Login returns JWT tokens | `curl -X POST http://localhost:3001/api/v1/auth/login` |
| 7 | Protected endpoint rejects without token | `curl http://localhost:3001/api/v1/users/me` → 401 |
| 8 | Protected endpoint accepts valid token | Same with `Authorization: Bearer <token>` → 200 |
| 9 | Rate limiting works | Send 101 requests in 1 minute → 429 |
| 10 | Swagger UI loads | Visit `http://localhost:3001/api/docs` |

---

## Definition of Done

- [ ] Node.js/Express server runs locally
- [ ] PostgreSQL database created with all tables
- [ ] All auth endpoints working (register, login, refresh, logout)
- [ ] JWT middleware protects routes
- [ ] Rate limiting active
- [ ] Error handling consistent
- [ ] API documentation (Swagger) available
- [ ] Seed data creates demo user
- [ ] Environment variables validated on startup
- [ ] No secrets in git
- [ ] README with setup instructions

---

## Kimi Code Execution Prompt

```powershell
cd C:userse1c8se1c8s	wende-app
kimi "Create the backend API for TWENDE in a new folder called 'twende-api/'. Read sprints/02-SPRINT_BACKEND.md for full requirements.

Tech stack: Node.js 20 + Express + Drizzle ORM + PostgreSQL + Zod + JWT (jose) + Pino + Helmet + express-rate-limit

Create this structure:
twende-api/
  src/
    index.ts              — Entry point, starts server on PORT 3001
    app.ts                — Express app with middleware (helmet, cors, json, rate limit, error handler)
    config/
      database.ts         — Drizzle ORM setup with postgres.js
      env.ts              — Zod schema validating all env vars (DATABASE_URL, JWT keys, PORT, etc.)
      logger.ts           — Pino logger configuration
    db/
      schema.ts           — Drizzle table definitions: users, kyc_documents, sessions, chamas, chama_members
      seed.ts             — Creates demo user (+254712345678, PIN '1234' bcrypt hashed, KYC Tier 2)
    middleware/
      auth.ts             — JWT verification middleware (Authorization: Bearer <token>)
      errorHandler.ts     — Global error handler, returns { success: false, error: { code, message } }
      rateLimiter.ts      — 100 req/min per IP
      validate.ts         — Zod validation wrapper for request bodies
    routes/
      auth.ts             — POST /register, POST /login, POST /refresh, POST /logout
      users.ts            — GET /me, PATCH /me, POST /me/kyc, GET /me/kyc/status
      chamas.ts           — GET /, POST /, GET /:id, POST /:id/members, POST /:id/contributions, GET /:id/ledger
      index.ts            — Aggregates all routes under /api/v1
    controllers/
      authController.ts   — Handle auth requests
      userController.ts   — Handle user requests
      chamaController.ts  — Handle chama requests
    services/
      authService.ts      — Business logic: register, login, refresh, bcrypt PIN, JWT tokens
      userService.ts      — Get/update user, KYC submission
      chamaService.ts     — Create chama, invite members, record contributions
    utils/
      jwt.ts              — Sign/verify JWT tokens (RS256)
      bcrypt.ts           — Hash/verify PINs
      otp.ts              — Generate 6-digit OTP
    types/
      index.ts            — Shared TypeScript types
  drizzle.config.ts
  package.json            — Dependencies: express, drizzle-orm, postgres, zod, jose, bcryptjs, pino, helmet, cors, express-rate-limit
  tsconfig.json
  .env.example            — Template showing all required env vars (no real values)
  .gitignore              — node_modules, dist, .env
  README.md               — Setup instructions

Requirements:
- All auth endpoints return { success: boolean, data?: any, error?: { code, message } }
- JWT tokens: access (24h), refresh (30d), RS256 signed
- PINs bcrypt hashed, never returned in responses
- Seed script creates demo user matching frontend mockData
- Server refuses to start if env vars invalid
- Run npm run build and confirm compiles
- Report what was created and how to start the server"
```

---

*Sprint 2: Backend API Foundation — v1.0*
