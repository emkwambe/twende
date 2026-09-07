# CLAUDE CODE PROMPT: Golden Path Sprint — End-to-End API Integration
## TWENDE — 5-Pillar Fintech Platform for East Africa

**Goal:** Wire one complete user journey — registration → login → real Trust Score → loan eligibility → loan application (with live underwriting decision) → repayment → passbook. Replace mock data with live backend API calls. Keep all other pillars as mock.

**Time Budget:** One focused session. Do not build new UI. Do not integrate Kazi/Linda/Soko with backend.

---

## 0. CONTEXT YOU ALREADY HAVE

You have already done the following in this repo (do not repeat):
- ✅ Chama scoring recalibrated to behavior-normalized weights (commit c249a61)
- ✅ All TypeScript errors fixed — `tsc --noEmit` passes clean (commit 5243e7c)
- ✅ Underwriting engine documented in `docs/UNDERWRITING_ENGINE.md` (commit 2384922)
- ✅ Country-pack refactor committed (commit a756be8)

**What remains:** The frontend still runs on `mockData.ts` for 24 files. Only auth (`api.ts`, `authService.ts`) touches the backend. The Trust Score, Biashara loans, and passbook are all fake. A funder who opens the app sees a React prototype. A funder who reads the repo sees real backend depth. This sprint closes that gap.

---

## 1. PRE-FLIGHT: Three Quick Fixes (Do These First)

### 1.1 Cap Underwriting Scoring Bands

In `backend/underwriting.py`, two bands award more than their declared maximum. The max score is 118.89 instead of 100. Fix:

```python
# _score_debt_service — cap at 25
return min(25, max(0, int(25 * (1 - dsr) * 2.5)))

# _score_seasonality — cap at 10
if seasonality == "agricultural" and sector == "agricultural":
    return min(10, 15)  # or just 10
```

Verify: max attainable score should be exactly 100. If it isn't, find the overflow and cap it.

### 1.2 Fix Currency: KES → TZS

The backend and country pack use TZS. The frontend still shows KES/KSh. Replace in these files:

| File | What to Change |
|------|---------------|
| `src/data/mockData.ts` | All `KES` → `TZS`, amounts scaled ~20:1 |
| `src/components/biashara/LoanApplicationForm.tsx` | Currency labels |
| `src/components/biashara/ActiveLoans.tsx` | Repayment currency |
| `src/components/trust/WhatIfSimulator.tsx` | Slider label "Save KES..." → "Improve consistency..." |
| `src/pages/Biashara.tsx` | Any hardcoded currency strings |

Loan tier amounts for Tanzania (update in mockData.ts):
```typescript
{ tier: 1, max: 200_000, rate: 24 },    // ~$75
{ tier: 2, max: 1_000_000, rate: 18 },  // ~$375
{ tier: 3, max: 4_000_000, rate: 14 },  // ~$1,500
{ tier: 4, max: 10_000_000, rate: 10 }, // ~$3,750
```

### 1.3 Pre-Seed Demo Users in Backend Database

In `backend/main.py` or via a small script, ensure the SQLite DB (`backend/twende.db`) has 2-3 test users with different Trust Score profiles so Eddy can demo tier differences without registering fresh each time:

| User | Trust Score | Tier | Pre-Seeded Loan |
|------|------------|------|----------------|
| `demo@twende.com` / `demo123` | 720 | Tier 3 | One active loan, one repaid |
| `demo2@twende.com` / `demo123` | 580 | Tier 2 | No loans (show empty state) |
| `demo3@twende.com` / `demo123` | 420 | Tier 1 | One rejected application |

If seeding is complex, just document the curl commands to create them quickly.

---

## 2. THE GOLDEN PATH: Wire These 8 Endpoints

### Step 1: Extend API Service Layer

Create `src/services/` with these modules, following the pattern in `authService.ts`:

```typescript
// src/services/userService.ts
export const userService = {
  getMe: () => api.get('/users/me'),
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
};
```

Add proper TypeScript types in `src/types.ts` for:
- `UserProfile` (with `trust_factors: TrustScoreFactors`)
- `LoanApplicationRequest`
- `LoanApplicationResponse` (with `approval_decision` field)
- `PassbookEntry`

### Step 2: Wire Trust Score Page

In `src/pages/TrustScore.tsx`:
- Replace `import { trustScoreFactors } from '@/data/mockData'` with a `useEffect` that calls `userService.getMe()`
- Pass `user.trust_factors` to `calculateTrustScore()`
- Show loading skeleton while fetching
- If backend is unreachable, show a yellow "Demo Mode" banner and fall back to mock data

In `src/components/trust/WhatIfSimulator.tsx`:
- The slider should adjust `contributionConsistency` (not savings amount — that lever was removed in the recalibration)
- Update labels: "Improve on-time contribution rate" instead of "Save more monthly"

### Step 3: Wire Loan Eligibility

In `src/components/biashara/LoanEligibilityCheck.tsx`:
- Call `loanService.getEligibility()` on mount
- Display real eligibility: tier, max amount, interest rate
- Show loading state

### Step 4: Wire Loan Application (THE MONEY SHOT)

In `src/components/biashara/LoanApplicationForm.tsx`:
- On submit, call `loanService.apply(formData)`
- Display the **real underwriting decision** — this is what impresses funders:
  ```
  Underwriting Score: 78/100
  Decision: Approved
  Max Amount: TZS 1,200,000
  Interest Rate: 18%
  Reason: Strong debt service ratio; stable mobile money flow
  ```
- If flagged (score 50-69), show: "Your application requires manual review. Score: 62/100"
- If rejected (score <50), show: "We're unable to approve at this time. Tips to improve..."

### Step 5: Wire Active Loans + Repayment

In `src/components/biashara/ActiveLoans.tsx`:
- Call `loanService.getMyLoans()` on mount
- Display real loan list with status, amount, remaining balance
- Repayment button calls `loanService.repay(loanId, amount)`
- On success, refresh the loan list

### Step 6: Wire Passbook

In the passbook view (find the component that shows transaction history):
- Call `ledgerService.getPassbook()` on mount
- Display real ledger entries: date, type, description, amount, running balance

### Step 7: Ensure Auth Token Flows

In `src/lib/api.ts`, verify the Axios interceptor attaches the JWT token:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

If missing, add it. All authenticated requests must include the token.

---

## 3. ERROR HANDLING: Graceful Fallback

For every API call, implement this pattern:

```typescript
const [data, setData] = useState(defaultValue);
const [loading, setLoading] = useState(true);
const [useMock, setUseMock] = useState(false);

useEffect(() => {
  service.getData()
    .then(res => setData(res.data))
    .catch(err => {
      console.warn('Backend unavailable, falling back to demo data');
      setUseMock(true);
      setData(mockData);
    })
    .finally(() => setLoading(false));
}, []);

// Show demo banner
{useMock && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded mb-4 text-sm">
    Demo Mode: Backend unavailable. Showing simulated data.
  </div>
)}
```

This ensures the app still works during Vercel deployment (frontend only) while showing live data when the backend is running.

---

## 4. TESTING CHECKLIST

Run these in order. Do not proceed to the next step until the current one passes.

```bash
# 1. Type check
cd C:\Users\HP\Documents\twende-app
npx tsc --noEmit
# Expected: 0 errors

# 2. Build
cd C:\Users\HP\Documents\twende-app
npm run build
# Expected: Pass, zero errors

# 3. Start backend
cd C:\Users\HP\Documents\twende-app\backend
python -m uvicorn main:app --reload --port 8000

# 4. Start frontend (new terminal)
cd C:\Users\HP\Documents\twende-app
npm run dev

# 5. Manual Golden Path Test
# Open http://localhost:5173
# Step 1: Register a new user
# Step 2: Login
# Step 3: Navigate to /trust/score — verify real user data loads
# Step 4: Navigate to /biashara — verify eligibility loads
# Step 5: Apply for a loan — verify underwriting decision displays
# Step 6: View active loans — verify loan appears
# Step 7: Make a repayment — verify success message
# Step 8: View passbook — verify transaction appears
```

---

## 5. VERIFICATION COMMANDS

After all manual tests pass, verify nothing broke:

```bash
# Check all routes still load
curl http://localhost:5173/          # Home
curl http://localhost:5173/chama     # Chama
curl http://localhost:5173/biashara  # Biashara
curl http://localhost:5173/soko      # Soko
curl http://localhost:5173/kazi      # Kazi
curl http://localhost:5173/linda     # Linda
curl http://localhost:5173/trust/score # Trust Score
curl http://localhost:5173/login     # Login
curl http://localhost:5173/register  # Register

# Verify backend health
curl http://localhost:8000/api/v1/health
```

---

## 6. ACCEPTANCE CRITERIA

The sprint is **complete** when:

- [ ] `npx tsc --noEmit` returns **0 errors**
- [ ] `npm run build` passes with **zero errors**
- [ ] Underwriting scoring capped (max exactly 100, not 118.89)
- [ ] All frontend currency is **TZS** (no KES/KSh remains)
- [ ] Register → Login works end-to-end with real backend
- [ ] Trust Score page fetches and displays **real user data** from `/users/me`
- [ ] Loan eligibility check calls **real API** and displays live results
- [ ] Loan application submits to **real API**, displays real underwriting score + decision
- [ ] Active loans display **real data** from `/loans/my`
- [ ] Repayment button calls **real API** and updates the loan
- [ ] Passbook displays **real ledger entries** from `/ledger/passbook`
- [ ] Graceful fallback to mock data with **"Demo Mode" banner** when backend unreachable
- [ ] JWT token automatically attached to all authenticated requests
- [ ] All 9 routes load without errors
- [ ] No console errors or warnings

---

## 7. COMMIT & DEPLOY

When all criteria pass:

```bash
cd C:\Users\HP\Documents\twende-app

# Stage everything
git add .

# Commit with descriptive message
git commit -m "Golden Path: Wire Trust Score, Biashara loans, and passbook to live backend API

- Replace mock data with real API calls for:
  - User profile + Trust Score factors (/users/me)
  - Loan eligibility (/loans/eligibility)
  - Loan application + underwriting decision (/loans/apply)
  - Active loans (/loans/my)
  - Repayment (/loans/{id}/repay)
  - Passbook (/ledger/passbook)
- Add graceful fallback to demo mode with banner
- Cap underwriting scoring bands (max 100)
- Convert all currency from KES to TZS
- Add loan/ledger service modules following authService pattern"

# Push to deploy on Vercel
git push origin main
```

Verify deployment at `https://twende-app.vercel.app`.

---

## 8. POST-COMPLETION: Report Back

When done, provide a concise report with:

1. **Build status** (`npm run build` output)
2. **TypeScript status** (`tsc --noEmit` output)
3. **Files modified** (list of files touched)
4. **Golden Path verification** (did all 8 steps work?)
5. **Any blockers or deviations** from this prompt

---

## CONTEXT NOTES

**Backend runs at:** `http://localhost:8000` (dev) / `https://api.twende.app` (production)  
**Frontend runs at:** `http://localhost:5173` (dev) / `https://twende-app.vercel.app` (production)  
**API base path:** `/api/v1`  
**Auth token key:** `localStorage.getItem('access_token')`  
**Backend docs:** `http://localhost:8000/docs` (Swagger UI)  
**Underwriting spec:** `docs/UNDERWRITING_ENGINE.md`

**The Two Engines:** Frontend Trust Engine (7 factors, 300-850, longitudinal) and backend underwriting (5 factors, 0-100, point-in-time) are intentionally separate. Trust Score markets the product; underwriting makes the decision. They complement each other. See `docs/UNDERWRITING_ENGINE.md` §1.

**Mock Data Policy:** All Kazi, Linda, and Soko components continue using `mockData.ts`. Only Trust Score, Biashara loans, and passbook switch to live API. This keeps scope tight.

---

**Begin implementation. Report progress as you complete each phase.**
