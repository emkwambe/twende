# KIMI PROMPT: Golden Path Sprint — End-to-End API Integration
## TWENDE — 5-Pillar Fintech Platform for East Africa

**Mission:** Wire ONE complete, real, end-to-end user journey from registration through loan decision to repayment, replacing mock data with live backend API calls. All other pillars remain mock. This is a focused integration sprint, not a feature build.

**Deadline:** Complete, tested, and deployed within this session.

---

## 0. CONTEXT: Read This First

You are working on **TWENDE** — a fintech platform for East Africa's informal economy built on React 18 + TypeScript + Tailwind CSS v4 + Vite. The frontend is at `C:\Users\HP\Documents\twende-app`. It has a real **FastAPI backend** with 32 routes, JWT auth, a ledger system, an underwriting engine, and a passbook. The frontend currently runs on **mock data** — 24 files still import `src/data/mockData.ts`. The backend is the team's secret weapon, but no visitor to the deployed app can see it.

**Your goal:** Make the backend real to users by wiring the "Golden Path" — one complete journey that proves the thesis.

**What NOT to do:**
- Do NOT build new UI components
- Do NOT integrate Kazi, Linda, or Soko with the backend (stay mock)
- Do NOT wire all 32 backend routes
- Do NOT refactor the Trust Engine algorithm (already calibrated)
- Do NOT change React Router setup (HashRouter is working)

---

## 1. FILE READING ORDER (Read Before Coding)

Read these files in exact order to understand the codebase state:

### 1.1 Backend API Contract (Read First)
```
backend/main.py              — All 32 routes, understand the Golden Path endpoints
backend/schemas.py           — Pydantic models for request/response shapes
backend/underwriting.py      — The underwriting engine you will call
backend/ledger.py            — Ledger operations for passbook
backend/models.py            — Database models (User, Loan, LedgerEntry, etc.)
backend/country_packs/tanzania.py — Currency, thresholds, config for TZ
backend/config.py            — AppConfig, database URL, environment
```

### 1.2 Frontend Architecture (Read Second)
```
src/lib/api.ts               — Existing API service (auth only, needs extension)
src/services/authService.ts  — Auth API wrapper (reference pattern)
src/contexts/AuthContext.tsx — Authentication state management
src/data/mockData.ts         — All mock data (identify what to replace)
src/trust/types.ts           — TrustScoreFactors type (already calibrated)
src/trust/algorithm.ts       — Trust Engine scoring (already calibrated, read only)
```

### 1.3 Golden Path UI Files (Read Third)
```
src/pages/TrustScore.tsx     — WhatIfSimulator, ScoreHistory, factor cards
src/pages/Biashara.tsx       — Loan application form, eligibility check
src/pages/LoanTracker.tsx    — Loan status, repayment button
src/components/trust/WhatIfSimulator.tsx — Slider + projection
src/components/trust/ScoreHistory.tsx    — Score over time chart
src/components/biashara/LoanApplicationForm.tsx — Apply for loan
src/components/biashara/LoanEligibilityCheck.tsx — Check eligibility
src/components/biashara/ActiveLoans.tsx — View active loans + repay
```

### 1.4 Supporting Infrastructure
```
src/types.ts                 — Global type definitions
src/App.tsx                  — Route configuration
vercel.json                  — SPA rewrites (already correct)
```

---

## 2. THE GOLDEN PATH: 8-Step User Journey

The user journey you will wire end-to-end:

| Step | User Action | Backend Endpoint | What Replaces Mock |
|------|------------|------------------|-------------------|
| 1 | **Register** | `POST /api/v1/auth/register` | Already works — verify |
| 2 | **Login** | `POST /api/v1/auth/login` | Already works — verify |
| 3 | **View Trust Score** | `GET /api/v1/users/me` | Replace mock factors with real user data |
| 4 | **Check Loan Eligibility** | `GET /api/v1/loans/eligibility` | Real eligibility based on Trust Score tier |
| 5 | **Apply for Loan** | `POST /api/v1/loans/apply` | **CRITICAL** — real underwriting decision |
| 6 | **View Loan Status** | `GET /api/v1/loans/{id}` | Real loan lifecycle state |
| 7 | **Make Repayment** | `POST /api/v1/loans/{id}/repay` | Real ledger transaction |
| 8 | **View Passbook** | `GET /api/v1/ledger/passbook` | Real transaction history |

---

## 3. IMPLEMENTATION PHASES (Execute in Order)

### PHASE 1: Backend Fixes (15 minutes)

**3.1.1 Apply Underwriting Scoring Caps**

In `backend/underwriting.py`, two scoring bands exceed their declared maximums:

```python
# BEFORE (bug — can exceed 100 total)
def _score_debt_service(self, dsr: float) -> int:
    # DSR 0.00 gives 38.89 points but band is declared as 25
    return max(0, int(25 * (1 - dsr) * 2.5))

def _score_seasonality(self, seasonality: str, sector: str) -> int:
    # Agricultural ≥12 weeks gives 15 points but band is declared as 10
    if seasonality == "agricultural" and sector == "agricultural":
        return 15
```

```python
# AFTER (capped)
def _score_debt_service(self, dsr: float) -> int:
    return min(25, max(0, int(25 * (1 - dsr) * 2.5)))

def _score_seasonality(self, seasonality: str, sector: str) -> int:
    if seasonality == "agricultural" and sector == "agricultural":
        return min(10, 15)  # Actually just 10
```

**3.1.2 Fix Currency: KES → TZS**

Replace all `KES`, `KSh`, `Kenya Shilling` references in the frontend with `TZS`, `TZS`, `Tanzania Shilling`. Critical files:
- `src/data/mockData.ts` — Loan amounts, interest rates, tiers
- `src/pages/Biashara.tsx` — Currency display
- `src/components/biashara/LoanApplicationForm.tsx` — Loan amount slider
- `src/components/trust/WhatIfSimulator.tsx` — Savings slider labels
- `src/components/biashara/ActiveLoans.tsx` — Repayment amounts

Keep backend currency as TZS (already correct in `country_packs/tanzania.py`).

**3.1.3 Update Loan Tier Amounts for Tanzania**

In `src/data/mockData.ts`, update loan tier amounts to match Tanzania economic reality:

```typescript
// BEFORE (Kenyan amounts)
export const loanTiers = [
  { name: 'Tier 1', maxAmount: 10000,  currency: 'KES', rate: 24 },
  { name: 'Tier 2', maxAmount: 50000,  currency: 'KES', rate: 18 },
  { name: 'Tier 3', maxAmount: 200000, currency: 'KES', rate: 14 },
  { name: 'Tier 4', maxAmount: 500000, currency: 'KES', rate: 10 },
];

// AFTER (Tanzanian amounts — ~20:1 exchange rate)
export const loanTiers = [
  { name: 'Tier 1', maxAmount: 200000,  currency: 'TZS', rate: 24 },   // ~$75
  { name: 'Tier 2', maxAmount: 1000000, currency: 'TZS', rate: 18 },   // ~$375
  { name: 'Tier 3', maxAmount: 4000000, currency: 'TZS', rate: 14 },   // ~$1,500
  { name: 'Tier 4', maxAmount: 10000000, currency: 'TZS', rate: 10 },  // ~$3,750
];
```

---

### PHASE 2: API Service Layer (30 minutes)

**3.2.1 Extend `src/lib/api.ts`**

Add these service modules to the existing API file (or create `src/services/` files following the `authService.ts` pattern):

```typescript
// src/services/userService.ts
export const userService = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data: UpdateProfileRequest) => api.patch('/users/me', data),
};

// src/services/loanService.ts
export const loanService = {
  getEligibility: () => api.get('/loans/eligibility'),
  apply: (data: LoanApplicationRequest) => api.post('/loans/apply', data),
  getMyLoans: () => api.get('/loans/my'),
  getLoan: (id: string) => api.get(`/loans/${id}`),
  repay: (id: string, amount: number) => api.post(`/loans/${id}/repay`, { amount }),
};

// src/services/ledgerService.ts
export const ledgerService = {
  getPassbook: () => api.get('/ledger/passbook'),
  getTransactions: (params?: { start?: string; end?: string }) => 
    api.get('/ledger/transactions', { params }),
};
```

**3.2.2 Add Type Definitions**

In `src/types.ts` or a new `src/services/types.ts`, add:

```typescript
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  kyc_tier: 1 | 2 | 3 | 4;
  credit_score: number;
  trust_factors: TrustScoreFactors;  // From src/trust/types.ts
  created_at: string;
}

export interface LoanApplicationRequest {
  amount: number;
  purpose: string;
  term_months: number;
  product: 'working_capital' | 'inventory_finance' | 'emergency_micro';
}

export interface LoanApplicationResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid';
  amount: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  total_repayment: number;
  approval_decision?: {
    approved: boolean;
    score: number;
    max_amount: number;
    message: string;
  };
}

export interface PassbookEntry {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'chama_contribution';
  description: string;
  amount: number;
  balance: number;
}
```

---

### PHASE 3: Wire Trust Score Page (30 minutes)

**3.3.1 Replace Mock Factors with Real Data**

In `src/pages/TrustScore.tsx`, replace the mock `trustScoreFactors` import with a real API call:

```typescript
// BEFORE
import { trustScoreFactors, trustScoreHistory } from '@/data/mockData';

// AFTER
import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';

function TrustScorePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService.getMe()
      .then(res => setUser(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Calculate score from real factors
  const score = user ? calculateTrustScore(user.trust_factors) : 0;
  const tier = user ? getScoreTier(score) : 1;

  // ... rest of component
}
```

**3.3.2 Update WhatIfSimulator**

In `src/components/trust/WhatIfSimulator.tsx`, the slider now adjusts **contribution consistency** (not savings amount), per the calibration:

```typescript
// BEFORE (wealth-weighted — now removed)
const scenario = { name: 'Save KES 5,000 more monthly...' };

// AFTER (behavior-normalized)
const scenario = { name: 'Contribute on time for 3 months', 
                   description: 'Improve your consistency score by 15 points' };
```

**3.3.3 Handle Loading States**

Add skeleton loaders while data fetches. Use the existing Tailwind classes — no new UI libraries.

---

### PHASE 4: Wire Biashara — Loan Application (45 minutes)

**4.4.1 Eligibility Check**

In `src/components/biashara/LoanEligibilityCheck.tsx`, replace mock eligibility with real API:

```typescript
// BEFORE
const eligibility = calculateEligibility(mockTrustScore);

// AFTER
const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);

useEffect(() => {
  loanService.getEligibility()
    .then(res => setEligibility(res.data))
    .catch(console.error);
}, []);
```

**4.4.2 Loan Application Form**

In `src/components/biashara/LoanApplicationForm.tsx`, wire the submit handler:

```typescript
// BEFORE
const handleSubmit = () => {
  // Mock submission
  console.log('Mock loan submitted');
};

// AFTER
const handleSubmit = async (values: LoanApplicationRequest) => {
  setSubmitting(true);
  try {
    const response = await loanService.apply(values);
    setLoanResult(response.data);
    // Show underwriting decision to user
    if (response.data.approval_decision?.approved) {
      toast.success(`Approved! Up to TZS ${response.data.approval_decision.max_amount.toLocaleString()}`);
    } else {
      toast.info(`Application flagged. Score: ${response.data.approval_decision?.score}/100`);
    }
  } catch (err) {
    toast.error(err.response?.data?.detail || 'Application failed');
  } finally {
    setSubmitting(false);
  }
};
```

**4.4.3 Display Underwriting Decision**

Show the user the real underwriting result:
- Score (0-100)
- Decision (approved/flagged/rejected)
- Max amount
- Reason message

This is the **most impressive part of the demo** — don't hide it behind generic messages.

---

### PHASE 5: Wire Loan Tracker + Repayment (30 minutes)

**5.5.1 Fetch Real Loans**

In `src/components/biashara/ActiveLoans.tsx`:

```typescript
// BEFORE
const activeLoans = mockActiveLoans;

// AFTER
const [loans, setLoans] = useState<LoanApplicationResponse[]>([]);

useEffect(() => {
  loanService.getMyLoans()
    .then(res => setLoans(res.data))
    .catch(console.error);
}, []);
```

**5.5.2 Repayment Handler**

```typescript
const handleRepay = async (loanId: string, amount: number) => {
  try {
    await loanService.repay(loanId, amount);
    toast.success('Repayment recorded');
    // Refresh loans
    const updated = await loanService.getMyLoans();
    setLoans(updated.data);
  } catch (err) {
    toast.error('Repayment failed');
  }
};
```

---

### PHASE 6: Wire Passbook / Ledger (20 minutes)

**6.6.1 Replace Mock Passbook Data**

In the passbook/passbook view component:

```typescript
// BEFORE
const entries = mockPassbookEntries;

// AFTER
const [entries, setEntries] = useState<PassbookEntry[]>([]);

useEffect(() => {
  ledgerService.getPassbook()
    .then(res => setEntries(res.data.entries))
    .catch(console.error);
}, []);
```

**6.6.2 Real-Time Balance**

Show the user's actual balance from the ledger, not a mock number.

---

### PHASE 7: Error Handling & Fallbacks (20 minutes)

**7.7.1 Backend Unavailable Fallback**

If the backend is not running (e.g., during Vercel deployment where only the frontend is hosted), gracefully fall back to mock data with a banner:

```typescript
const [useMock, setUseMock] = useState(false);

useEffect(() => {
  userService.getMe()
    .then(res => setUser(res.data))
    .catch(err => {
      console.warn('Backend unavailable, using demo mode:', err);
      setUseMock(true);
      setUser(mockUser); // Fallback
    });
}, []);

// In JSX
{useMock && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded mb-4">
    Demo Mode: Showing simulated data. Connect backend for live data.
  </div>
)}
```

**7.7.2 Auth Token Handling**

Ensure the API service reads the JWT token from `localStorage` (already set by authService) and attaches it to every request:

```typescript
// In src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### PHASE 8: Testing & Verification (30 minutes)

**8.8.1 Build Verification**

```bash
cd C:\Users\HP\Documents\twende-app
npm run build          # Must pass with zero errors
npx tsc --noEmit       # Must pass with zero TypeScript errors
```

**8.8.2 Backend Verification**

```bash
cd backend
python -m uvicorn main:app --reload  # Start backend
# In another terminal:
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@twende.com","password":"test123","first_name":"Test","last_name":"User","phone":"+255712345678","country":"TZ"}'
```

**8.8.3 Golden Path Test Script**

Manually verify each step:

| Step | Test | Expected Result |
|------|------|-----------------|
| 1 | Register new user | 201 Created, JWT token returned |
| 2 | Login with credentials | 200 OK, JWT token returned |
| 3 | View Trust Score page | Real user data displayed, score calculated from factors |
| 4 | Check loan eligibility | Eligibility object returned with tier, max amount, rate |
| 5 | Apply for loan | Underwriting engine runs, decision displayed |
| 6 | View loan status | Loan appears in Active Loans with correct status |
| 7 | Make repayment | Ledger updated, balance changed |
| 8 | View passbook | New transaction appears with correct amount |

**8.8.4 Route Verification**

Navigate to all routes, confirm they still work:
- `/` — Home
- `/chama` — Chama (mock data OK)
- `/biashara` — Biashara (LIVE DATA for loans, mock for savings goals)
- `/trust/score` — Trust Score (LIVE DATA)
- `/soko` — Soko (mock data OK)
- `/kazi` — Kazi (mock data OK)
- `/linda` — Linda (mock data OK)
- `/login` — Login (LIVE)
- `/register` — Register (LIVE)

---

## 4. ACCEPTANCE CRITERIA

The Golden Path is **complete** when ALL of the following are true:

- [ ] `npm run build` passes with **zero errors**
- [ ] `npx tsc --noEmit` passes with **zero TypeScript errors**
- [ ] Underwriting scoring caps applied (max 100 points, not 118.89)
- [ ] All frontend currency references say **TZS** (not KES/KSh)
- [ ] Loan tier amounts match Tanzania economic reality
- [ ] Register → Login works with real backend
- [ ] Trust Score page displays **real user data** from `/users/me`
- [ ] Loan eligibility check calls **real API** (`/loans/eligibility`)
- [ ] Loan application submits to **real API** (`/loans/apply`) and shows underwriting decision
- [ ] Active loans display **real data** from `/loans/my`
- [ ] Repayment button calls **real API** (`/loans/{id}/repay`)
- [ ] Passbook displays **real ledger entries** from `/ledger/passbook`
- [ ] **Fallback to mock data** with demo banner when backend unavailable
- [ ] JWT token attached to all authenticated requests
- [ ] All 7 original routes + Trust Score still load correctly
- [ ] No new warnings or errors in browser console

---

## 5. DEPLOYMENT

After all acceptance criteria pass:

```bash
cd C:\Users\HP\Documents\twende-app
npm run build
git add .
git commit -m "Golden Path: End-to-end API integration for Trust Score, Biashara loans, and passbook"
git push origin main
```

Vercel will auto-deploy from `main`. Verify the deployed app at `https://twende-app.vercel.app`.

---

## 6. POST-COMPLETION DELIVERABLES FOR EDDY

After this sprint completes, the following are ready for Eddy to use:

| Deliverable | How to Use |
|------------|-----------|
| **Live Demo URL** | `https://twende-app.vercel.app` — share in pitch deck, applications |
| **2-Minute Demo Script** | Register → Apply for Loan → See Underwriting Decision → Make Repayment → View Passbook |
| **Screenshots** | Take screenshots of each Golden Path step for pitch deck |
| **API Documentation** | Backend endpoints are self-documenting via FastAPI `/docs` |
| **Underwriting Spec** | `docs/UNDERWRITING_ENGINE.md` — show funders the real decision logic |

---

## 7. CONTEXT NOTES

**Backend URL:** The backend runs locally at `http://localhost:8000`. In production, set `VITE_API_URL` in `.env`:
```
VITE_API_URL=https://api.twende.app/api/v1
```

**Auth Token Storage:** JWT access token is stored in `localStorage` as `access_token`. The API interceptor reads it automatically.

**CORS:** Backend already has CORS configured for `localhost:5173` (Vite dev) and `https://twende-app.vercel.app` (production).

**Database:** Backend uses SQLite (`backend/twende.db`). For the demo, pre-seed 2-3 test users with different Trust Scores so Eddy can show tier differences quickly.

**Underwriting Engine:** The engine at `backend/underwriting.py` is a rule-based model (not XGBoost yet). It awards 0-100 points across 5 factors. Thresholds: ≥70 = approved, 50-69 = flagged (manual review), <50 = rejected. After capping, max score is exactly 100.

**The "Two Engines" Context:** The frontend Trust Engine (7 factors, 300-850 score) is a longitudinal model for marketing and user engagement. The backend underwriting engine (5 factors, 0-100 score) is a point-in-time affordability model for loan decisions. They are complementary, not contradictory. The Trust Score tier gates which loan products you're offered; the underwriting score gates whether you get THIS loan. This is documented in `docs/UNDERWRITING_ENGINE.md`.

---

**End of Prompt. Begin implementation.**
