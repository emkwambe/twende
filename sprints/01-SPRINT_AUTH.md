# Sprint 1: Authentication & Onboarding

**Goal:** Users can register with their phone number, verify via OTP, complete KYC Tier 1, and access a personalized dashboard.  
**Duration:** 1 week  
**Dependencies:** None  
**Business Value:** Foundation — no authenticated users means no data, no credit scores, no revenue.

---

## User Stories

### Story 1.1: Phone Registration

**As a** new user, **I want** to register with my phone number, **so that** I can create a TWENDE account without an email or password.

**Acceptance Criteria:**
- [ ] User enters phone number (format: +2547XXXXXXXX)
- [ ] System validates phone number format (regex: `^\+2547[0-9]{8}$`)
- [ ] System generates 6-digit OTP
- [ ] OTP is "sent" (simulated via console.log in dev, SMS gateway in production)
- [ ] OTP expires after 5 minutes
- [ ] User enters OTP, system validates
- [ ] On valid OTP, account is created with phone as primary identifier
- [ ] JWT access token (24h expiry) and refresh token (30d expiry) are generated
- [ ] Tokens stored in localStorage
- [ ] User is redirected to KYC Tier 1 form

### Story 1.2: KYC Tier 1

**As a** newly registered user, **I want** to provide my basic identity information, **so that** I can access TWENDE's basic features.

**Acceptance Criteria:**
- [ ] Form collects: full name, national ID number, date of birth
- [ ] All fields are required
- [ ] National ID validated for format (Kenya: 8 digits; Tanzania: 20 digits; Uganda: 14 characters)
- [ ] Date of birth must indicate age 18+
- [ ] On submission, KYC tier set to 1
- [ ] User redirected to dashboard
- [ ] Dashboard shows "Complete KYC Tier 2 to unlock loans" prompt

### Story 1.3: Login

**As a** returning user, **I want** to log in with my phone number and PIN, **so that** I can access my account.

**Acceptance Criteria:**
- [ ] User enters phone number
- [ ] System validates phone exists
- [ ] User enters 4-digit PIN
- [ ] PIN is bcrypt-verified
- [ ] On valid PIN, new JWT tokens generated
- [ ] User redirected to dashboard
- [ ] "Remember me" option extends refresh token to 90 days

### Story 1.4: KYC Tier 2 Upgrade

**As a** Tier 1 user, **I want** to complete enhanced KYC, **so that** I can access loans and insurance.

**Acceptance Criteria:**
- [ ] Form collects: selfie photo (camera capture), national ID front photo, national ID back photo
- [ ] All photos required
- [ ] Selfie liveness check (simulated — always pass in MVP)
- [ ] On submission, KYC tier upgraded to 2
- [ ] Dashboard updates to show loan pre-qualification
- [ ] User receives congratulatory notification

### Story 1.5: Logout

**As a** logged-in user, **I want** to log out, **so that** my account is secure on shared devices.

**Acceptance Criteria:**
- [ ] Logout button visible in sidebar/header
- [ ] On logout, all tokens cleared from localStorage
- [ ] User redirected to login page
- [ ] Session invalidated on backend (when backend exists in Sprint 2)

### Story 1.6: Protected Routes

**As the** platform, **I want** to protect authenticated routes, **so that** unauthenticated users cannot access dashboard features.

**Acceptance Criteria:**
- [ ] All routes except /login and /register require authentication
- [ ] Unauthenticated users redirected to /login
- [ ] Authenticated users redirected away from /login to /
- [ ] Auth state persists across page refreshes (via localStorage)
- [ ] Token expiry handled gracefully (redirect to login with message)

---

## Technical Implementation

### Files to Create

| File | Purpose | Notes |
|---|---|---|
| `src/types/auth.ts` | TypeScript interfaces for User, KYC, AuthState, Tokens | Shared across all auth-related code |
| `src/types/index.ts` | Barrel export for all types | Clean imports |
| `src/context/AuthContext.tsx` | React Context for auth state | Wraps entire app in App.tsx |
| `src/hooks/useAuth.ts` | Custom hook for consuming auth context | Convenience wrapper |
| `src/services/authService.ts` | Auth API simulation (mock) | Returns promises simulating network latency |
| `src/pages/Login.tsx` | Login page UI | Phone + PIN form, error handling |
| `src/pages/Register.tsx` | Registration + OTP flow | Multi-step: phone → OTP → KYC Tier 1 |
| `src/components/PrivateRoute.tsx` | Route guard component | Redirects unauthenticated users |
| `src/components/KYCForm.tsx` | KYC Tier 1 form | Reusable for Tier 2 upgrade |
| `src/components/OTPInput.tsx` | 6-digit OTP input component | Auto-focus, paste support |
| `src/components/PinInput.tsx` | 4-digit PIN input component | Masked input, secure |

### Files to Modify

| File | Changes |
|---|---|
| `src/App.tsx` | Add /login and /register routes, wrap protected routes with PrivateRoute, wrap app with AuthProvider |
| `src/main.tsx` | Import AuthProvider |
| `src/components/Layout.tsx` | Add logout button, show user avatar + name, conditionally show KYC upgrade prompt |
| `src/data/mockData.ts` | Add `currentUser` with `pinHash` field (bcrypt hash of "1234") |
| `src/index.css` | Add auth page styles (centered forms, OTP input styling) |

### Auth Flow Diagram

```
[Unauthenticated User]
         │
         ▼
[/login] ←─────── (if no token in localStorage)
         │
    Enter Phone
         │
    Enter PIN
         │
    Verify PIN (bcrypt)
         │
    Generate JWT Tokens
         │
    Store in localStorage
         │
         ▼
[KYC Tier 1?] ──No──▶ [/register/kyc] ──▶ Collect name, ID, DOB
    │                                      │
   Yes                                      ▼
    │                                  [KYC Tier 1 Complete]
    ▼                                      │
[/] Dashboard ◀────────────────────────────┘
         │
    [KYC Tier 2 Prompt] ──Click──▶ [/kyc-upgrade]
         │                              │
         │                         Collect selfies + ID photos
         │                              │
         │                              ▼
         │                         [KYC Tier 2 Complete]
         │                              │
         ▼──────────────────────────────┘
    Dashboard with full features unlocked
```

### Data Structures

```typescript
// src/types/auth.ts

export interface User {
  id: string;
  phoneNumber: string;
  displayName: string;
  email?: string;
  kycTier: 1 | 2 | 3;
  kycVerifiedAt?: string;
  nationalId?: string;
  dateOfBirth?: string;
  avatar: string;
  creditScore: number;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface KYCData {
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  selfieUrl?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phoneNumber: string;
  pin: string;
}

export interface OTPVerification {
  phoneNumber: string;
  otp: string;
}
```

### Auth Service (Mock)

```typescript
// src/services/authService.ts

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database (in-memory for Sprint 1, PostgreSQL in Sprint 2)
const mockUsers: Map<string, User> = new Map();

// Pre-populate with demo user
mockUsers.set('+254712345678', {
  id: 'u1',
  phoneNumber: '+254712345678',
  displayName: 'Wanjiku M.',
  kycTier: 2,
  kycVerifiedAt: '2025-11-15',
  nationalId: '12345678',
  dateOfBirth: '1992-03-15',
  avatar: 'WM',
  creditScore: 650,
  createdAt: '2025-11-15',
  status: 'active',
});

// PIN hash (bcrypt of "1234") — in production, never store plain text
const MOCK_PIN_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I2K';

export const authService = {
  async sendOTP(phoneNumber: string): Promise<void> {
    await delay(500);
    console.log(`[MOCK OTP] Code for ${phoneNumber}: 123456`);
    // In production: call SMS gateway API
  },

  async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    await delay(500);
    return otp === '123456'; // Mock OTP
  },

  async register(phoneNumber: string, kycData: KYCData): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(800);
    // Create user
    // Generate tokens
    // Return
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(800);
    // Verify PIN
    // Generate tokens
    // Return
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    await delay(500);
    // Validate refresh token
    // Generate new access token
  },

  logout(): void {
    localStorage.removeItem('twende_tokens');
    localStorage.removeItem('twende_user');
  },
};
```

### JWT Token Structure (Mock for Sprint 1)

Since we don't have a real backend yet, tokens are base64-encoded JSON:

```typescript
// Access token payload
{
  "sub": "u1",           // user ID
  "phone": "+254712345678",
  "kyc": 2,
  "iat": 1690454400,
  "exp": 1690540800      // 24 hours
}

// Refresh token payload
{
  "sub": "u1",
  "type": "refresh",
  "iat": 1690454400,
  "exp": 1693046400      // 30 days
}
```

**Note:** In Sprint 2, replace with real JWT (RS256 signed by backend). The frontend interface stays identical.

---

## Guardrails (Sprint 1 Specific)

| Guardrail | Why | How |
|---|---|---|
| **Never store plain-text PINs** | Security breach risk | bcrypt hash only, verification via comparison |
| **Never store tokens in plain text** | XSS vulnerability | Base64 encode in localStorage, never `JSON.stringify` tokens |
| **Always validate phone format** | Data integrity | Regex validation before any API call |
| **OTP must expire** | Prevent replay attacks | 5-minute expiry with cleanup |
| **Rate limit OTP requests** | Prevent abuse | Max 3 OTP requests per phone per hour |
| **Never show PIN on screen** | Shoulder surfing | Masked input with dots |
| **Auth state must survive refresh** | UX consistency | localStorage persistence |
| **Logout must clear everything** | Security | Remove all tokens, user data, cached state |

---

## UI/UX Requirements

### Login Page

- Clean, centered form on white background
- Phone input with +254 prefix (auto-formatted)
- PIN input with 4 dots (masked)
- "Show PIN" toggle (eye icon)
- "Forgot PIN?" link (redirects to OTP reset flow — mock for Sprint 1)
- "Create Account" link → /register
- Error messages below form (red text, no alerts)
- Loading spinner on submit button

### Registration Flow

- **Step 1:** Phone number → Send OTP
- **Step 2:** OTP input (6 boxes, auto-focus next, paste support)
- **Step 3:** KYC Tier 1 form (name, national ID, DOB)
- **Step 4:** Set 4-digit PIN
- **Step 5:** Success → redirect to dashboard

Each step shows progress indicator (5 dots, current step highlighted).

### KYC Upgrade Prompt

- Banner on dashboard: "Complete KYC Tier 2 to unlock loans up to KES 50,000"
- Click → modal with Tier 2 form
- After completion: confetti animation + "You're now Gold tier!" message

---

## Testing Checklist

### Manual Tests

| # | Test | Expected Result |
|---|---|---|
| 1 | Navigate to /login | Login form appears |
| 2 | Enter invalid phone | Validation error appears |
| 3 | Enter valid phone + wrong PIN | "Invalid PIN" error |
| 4 | Enter valid phone + PIN "1234" | Logged in, redirected to / |
| 5 | Refresh page while logged in | Still logged in, dashboard visible |
| 6 | Click logout | Redirected to /login, tokens cleared |
| 7 | Navigate to / while logged out | Redirected to /login |
| 8 | Complete registration flow | New user created, KYC Tier 1, redirected to / |
| 9 | Click KYC upgrade prompt | Tier 2 form appears |
| 10 | Complete KYC Tier 2 | Dashboard shows "Gold" tier, loan unlock message |

### Edge Cases

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | OTP expires before entry | "OTP expired, request new one" message |
| 2 | Wrong OTP entered 3 times | Rate limited, "Too many attempts" |
| 3 | Network error during login | "Network error, please try again" |
| 4 | localStorage cleared manually | Treated as logged out, redirect to /login |
| 5 | Token expired | Silent refresh (if refresh token valid) or redirect to login |
| 6 | User suspends account | "Account suspended, contact support" on login |

---

## Definition of Done

- [ ] All 6 user stories implemented
- [ ] All 11 files created/modified
- [ ] `npm run build` passes with zero errors
- [ ] All manual tests pass
- [ ] All edge cases handled
- [ ] Code committed and pushed to `origin main`
- [ ] Deployed to Vercel preview
- [ ] Previous functionality (5 dashboards) still works

---

## Kimi Code Execution Prompt

Copy and paste this into your terminal:

```powershell
cd C:userse1c8se1c8s	wende-app
kimi "Implement Sprint 1: Authentication & Onboarding. Read .kimi/instructions.md first, then docs/PROJECT_CONTEXT.md (KYC section), then this sprint document (sprints/01-SPRINT_AUTH.md).

Create these files:
1. src/types/auth.ts — TypeScript interfaces (User, KYCData, AuthTokens, AuthState, LoginCredentials, OTPVerification)
2. src/types/index.ts — Barrel export
3. src/context/AuthContext.tsx — React Context with auth state, login, logout, register methods
4. src/hooks/useAuth.ts — Custom hook
5. src/services/authService.ts — Mock auth API with OTP simulation, bcrypt PIN verification, JWT token generation
6. src/pages/Login.tsx — Phone + PIN login form with validation
7. src/pages/Register.tsx — Multi-step registration: phone → OTP → KYC Tier 1 → PIN
8. src/components/PrivateRoute.tsx — Route guard, redirects to /login if not authenticated
9. src/components/KYCForm.tsx — KYC Tier 1 form (name, national ID, date of birth)
10. src/components/OTPInput.tsx — 6-digit OTP input with auto-focus and paste
11. src/components/PinInput.tsx — 4-digit masked PIN input

Modify these files:
- src/App.tsx: Add /login and /register routes, wrap with AuthProvider, use PrivateRoute for protected routes
- src/main.tsx: Import AuthProvider
- src/components/Layout.tsx: Add logout button, show user name/avatar, conditionally show KYC upgrade banner
- src/data/mockData.ts: Add currentUser with pinHash field (bcrypt of '1234')
- src/index.css: Add auth page styles (centered forms, OTP/PIN input styling)

Requirements:
- Use HashRouter (already configured)
- All forms have validation with clear error messages
- Auth state persists in localStorage
- OTP is '123456' for demo (log to console)
- PIN is '1234' for demo user
- KYC Tier 1 unlocks basic features, Tier 2 prompt appears on dashboard
- Run npm run build and confirm zero errors
- Report what was built and any issues"
```

---

*Sprint 1: Authentication & Onboarding — v1.0*
