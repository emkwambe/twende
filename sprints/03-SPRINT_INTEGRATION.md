# Sprint 3: Frontend-API Integration

**Goal:** Replace all mock data with real API calls. Frontend fetches from backend, displays real data, handles loading states and errors.  
**Duration:** 1 week  
**Dependencies:** Sprint 1 (Auth), Sprint 2 (Backend API)  
**Business Value:** Users see their actual data — this transforms the app from a demo into a real product.

---

## User Stories

### Story 3.1: API Client Setup

**As a** developer, **I want** a configured HTTP client, **so that** all API calls are consistent, authenticated, and handle errors uniformly.

**Acceptance Criteria:**
- [ ] Axios instance created with base URL pointing to backend
- [ ] Request interceptor adds `Authorization: Bearer <token>` header from localStorage
- [ ] Response interceptor handles 401 (token expired) → triggers silent refresh or redirects to login
- [ ] Response interceptor handles 429 (rate limited) → shows "Too many requests" message
- [ ] Response interceptor handles 500+ → shows "Server error, try again" message
- [ ] All API errors show user-friendly toast notifications (not console errors)
- [ ] Network errors show "Connection lost" message with retry button

### Story 3.2: React Query Setup

**As a** developer, **I want** React Query for data fetching, **so that** caching, refetching, and loading states are handled automatically.

**Acceptance Criteria:**
- [ ] React Query Provider wraps the app
- [ ] QueryClient configured with: staleTime 5min, cacheTime 10min, retry 3
- [ ] All data fetching uses `useQuery` for reads
- [ ] All mutations use `useMutation` for writes
- [ ] Loading states show skeleton screens (not spinners)
- [ ] Error states show retry buttons
- [ ] Optimistic updates on mutations (update UI before server confirms)
- [ ] Background refetching when window regains focus

### Story 3.3: Auth Integration

**As a** user, **I want** my login to connect to the real backend, **so that** my account is secure and persistent.

**Acceptance Criteria:**
- [ ] Login form calls `POST /api/v1/auth/login` instead of mock service
- [ ] Registration calls `POST /api/v1/auth/register`
- [ ] OTP verification calls backend endpoint
- [ ] JWT tokens stored in localStorage after successful login
- [ ] AuthContext fetches current user from `GET /api/v1/users/me` on app load
- [ ] Logout calls `POST /api/v1/auth/logout` and clears localStorage
- [ ] Token refresh happens automatically before expiry

### Story 3.4: Dashboard Data Integration

**As a** user, **I want** my dashboard to show real data from the backend, **so that** I see my actual financial status.

**Acceptance Criteria:**
- [ ] Overview page fetches: credit score, total savings, available credit, insurance coverage, Soko revenue
- [ ] Chama page fetches: user's chamas, contributions, loans, ledger
- [ ] Biashara page fetches: business profile, active loan, credit history, transactions
- [ ] Kazi page fetches: gig profile, weekly earnings, AutoSave balance, insurance status
- [ ] Linda page fetches: active policies, claims, risk profile
- [ ] Soko page fetches: store profile, listings, orders, analytics
- [ ] All pages show skeleton screens while loading
- [ ] All pages show error states with retry buttons
- [ ] Data updates in real-time after mutations (React Query invalidation)

### Story 3.5: Contribution Flow Integration

**As a** chama member, **I want** my contribution to be recorded in the real database, **so that** my savings are actually tracked.

**Acceptance Criteria:**
- [ ] "Contribute" button calls `POST /api/v1/chamas/:id/contributions`
- [ ] Backend records contribution in database
- [ ] Frontend shows updated balance immediately (optimistic update)
- [ ] Transaction appears in ledger
- [ ] Credit score recalculates (triggers async job)
- [ ] All group members see updated ledger (via refetch)

---

## Technical Implementation

### Files to Create

| File | Purpose |
|---|---|
| `src/lib/api.ts` | Configured Axios instance with interceptors |
| `src/lib/queryClient.ts` | React Query client configuration |
| `src/hooks/useAuthQuery.ts` | React Query hooks for auth operations |
| `src/hooks/useChamaQuery.ts` | React Query hooks for Chama data |
| `src/hooks/useBiasharaQuery.ts` | React Query hooks for Biashara data |
| `src/hooks/useKaziQuery.ts` | React Query hooks for Kazi data |
| `src/hooks/useLindaQuery.ts` | React Query hooks for Linda data |
| `src/hooks/useSokoQuery.ts` | React Query hooks for Soko data |
| `src/components/SkeletonCard.tsx` | Skeleton loading card component |
| `src/components/SkeletonChart.tsx` | Skeleton chart loading component |
| `src/components/ErrorBoundary.tsx` | React error boundary for crashes |
| `src/components/Toast.tsx` | Toast notification system |

### Files to Modify

| File | Changes |
|---|---|
| `src/main.tsx` | Wrap with QueryClientProvider |
| `src/context/AuthContext.tsx` | Replace mock authService with real API calls |
| `src/services/authService.ts` | Replace mock with real API calls via Axios |
| `src/pages/Home.tsx` | Replace mockData imports with useQuery hooks |
| `src/pages/Chama.tsx` | Replace mockData with useChamaQuery, mutations |
| `src/pages/Biashara.tsx` | Replace mockData with useBiasharaQuery |
| `src/pages/Kazi.tsx` | Replace mockData with useKaziQuery |
| `src/pages/Linda.tsx` | Replace mockData with useLindaQuery |
| `src/pages/Soko.tsx` | Replace mockData with useSokoQuery |
| `src/App.tsx` | Add QueryClientProvider, ErrorBoundary |

### API Client Configuration

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add auth token
api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('twende_tokens') || '{}');
  if (tokens.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401: try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('twende_tokens') || '{}');
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        );
        const newTokens = refreshResponse.data.data;
        localStorage.setItem('twende_tokens', JSON.stringify(newTokens));
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('twende_tokens');
        window.location.href = '/#/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;
```

### React Query Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes (was cacheTime in v4)
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Example: Chama Query Hooks

```typescript
// src/hooks/useChamaQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch user's chamas
export const useChamas = () => {
  return useQuery({
    queryKey: ['chamas'],
    queryFn: async () => {
      const response = await api.get('/chamas');
      return response.data.data;
    },
  });
};

// Create contribution
export const useCreateContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chamaId, amount }: { chamaId: string; amount: number }) => {
      const response = await api.post(`/chamas/${chamaId}/contributions`, { amount });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      queryClient.invalidateQueries({ queryKey: ['chama', variables.chamaId] });
      queryClient.invalidateQueries({ queryKey: ['ledger', variables.chamaId] });
    },
  });
};
```

---

## Guardrails (Sprint 3 Specific)

| Guardrail | Why | How |
|---|---|---|
| **Never expose API keys in frontend code** | Security breach | Use environment variables (VITE_ prefix) |
| **Always handle loading states** | UX quality | Skeleton screens for every data fetch |
| **Always handle error states** | Resilience | Error boundaries + retry buttons + toast notifications |
| **Never make API calls in render phase** | Performance | useQuery/useMutation only, never in useEffect without proper cleanup |
| **Always invalidate related queries after mutation** | Data consistency | queryClient.invalidateQueries() in onSuccess |
| **Never store sensitive data in query cache** | Security | Exclude tokens, PINs from cache |
| **Always debounce search inputs** | Rate limiting | 300ms debounce on search API calls |
| **Never make concurrent identical requests** | Performance | React Query dedupes by queryKey |

---

## Testing Checklist

| # | Test | Expected Result |
|---|---|---|
| 1 | Start backend server | `npm run dev` in twende-api/ |
| 2 | Start frontend | `npx vite` in twende-app/ |
| 3 | Login with demo user | Dashboard loads with real data from backend |
| 4 | Navigate to Chama | Chama data fetched from API, skeleton → content |
| 5 | Make a contribution | Backend records it, UI updates optimistically |
| 6 | Refresh page | Still logged in, data refetches |
| 7 | Disconnect backend | "Connection lost" message with retry |
| 8 | Reconnect backend | Retry succeeds, data loads |
| 9 | Login with wrong PIN | "Invalid credentials" error, no crash |
| 10 | All 5 product pages | Each fetches and displays real data |

---

## Definition of Done

- [ ] Axios client configured with auth interceptors
- [ ] React Query set up with proper caching
- [ ] All mock data replaced with API calls
- [ ] All pages show skeleton loading states
- [ ] All pages show error states with retry
- [ ] Token refresh works silently
- [ ] Logout clears all cached data
- [ ] Optimistic updates on mutations
- [ ] Toast notifications for all actions
- [ ] `npm run build` passes with zero errors
- [ ] Deployed to Vercel (frontend) + Render/Railway (backend)

---

## Kimi Code Execution Prompt

```powershell
cd C:userse1c8se1c8s	wende-app
kimi "Integrate the frontend with the backend API. Read sprints/03-SPRINT_INTEGRATION.md for full requirements.

Install these packages:
npm install @tanstack/react-query axios

Create these files:
1. src/lib/api.ts — Axios instance with baseURL, auth interceptor (adds Bearer token), 401 refresh logic, error handling
2. src/lib/queryClient.ts — React Query client with staleTime 5min, gcTime 10min, retry 3
3. src/hooks/useAuthQuery.ts — useLogin, useRegister, useLogout, useCurrentUser hooks
4. src/hooks/useChamaQuery.ts — useChamas, useChama, useCreateContribution, useRequestLoan hooks
5. src/hooks/useBiasharaQuery.ts — useBiasharaProfile, useActiveLoan, useApplyLoan hooks
6. src/hooks/useKaziQuery.ts — useKaziProfile, useWeeklyEarnings, useUpdateAutoSave hooks
7. src/hooks/useLindaQuery.ts — usePolicies, useClaims, useFileClaim hooks
8. src/hooks/useSokoQuery.ts — useStoreProfile, useListings, useOrders, useCreateListing hooks
9. src/components/SkeletonCard.tsx — Skeleton loading card with pulse animation
10. src/components/SkeletonChart.tsx — Skeleton chart placeholder
11. src/components/Toast.tsx — Toast notification component (success/error)
12. src/components/ErrorFallback.tsx — Error boundary fallback UI

Modify these files:
- src/main.tsx: Wrap with QueryClientProvider
- src/context/AuthContext.tsx: Replace mock authService with real API calls via useAuthQuery hooks
- src/pages/Home.tsx: Replace mockData with useCurrentUser + useQuery for stats
- src/pages/Chama.tsx: Replace mockData with useChamas + useCreateContribution mutation
- src/pages/Biashara.tsx: Replace mockData with useBiasharaProfile + useApplyLoan
- src/pages/Kazi.tsx: Replace mockData with useKaziProfile + useUpdateAutoSave
- src/pages/Linda.tsx: Replace mockData with usePolicies + useFileClaim
- src/pages/Soko.tsx: Replace mockData with useStoreProfile + useCreateListing
- src/App.tsx: Add QueryClientProvider wrapper
- src/index.css: Add skeleton pulse animation styles

Requirements:
- All data fetching uses React Query useQuery
- All mutations use React Query useMutation with optimistic updates
- Skeleton screens shown during loading (not spinners)
- Error states show retry buttons
- Toast notifications for success/error actions
- Token refresh happens silently on 401
- Logout clears React Query cache + localStorage
- Assume backend is at http://localhost:3001/api/v1
- Create .env file with VITE_API_URL=http://localhost:3001/api/v1
- Run npm run build and confirm zero errors
- Report what was integrated and any issues"
```

---

*Sprint 3: Frontend-API Integration — v1.0*
