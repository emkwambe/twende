// TWENDE Trust Engine — Core Types and Interfaces
// Sprint 05: Credit Scoring & Trust Engine

export interface TrustScoreFactors {
  // 1. Chama Savings Behavior (20% weight)
  chama: {
    contributionConsistency: number;   // 0-100, monthly on-time %
    savingsVolume: number;             // normalized KES amount (0-100)
    groupTenure: number;               // months in chama (0-100)
    leadershipRole: boolean;           // officer = bonus
  };

  // 2. M-Pesa Transaction History (15% weight)
  mpesa: {
    transactionVolume: number;         // normalized monthly volume (0-100)
    transactionFrequency: number;      // transactions per week (0-100)
    balanceStability: number;          // coefficient of variation (0-100)
    airtimePurchase: number;           // consistent small purchases (0-100)
  };

  // 3. Soko Sales Performance (20% weight)
  soko: {
    gmv: number;                       // gross merchandise value (0-100)
    customerRating: number;            // 1-5 average mapped to 0-100
    fulfillmentRate: number;           // % orders fulfilled (0-100)
    inventoryTurnover: number;         // days to sell inventory (0-100)
  };

  // 4. Loan Repayment History (25% weight — HIGHEST)
  loans: {
    repaymentRate: number;             // % on-time repayments (0-100)
    activeLoans: number;                 // count (penalty if >2)
    defaultHistory: boolean;           // any defaults
    creditUtilization: number;         // % of available credit used (0-100)
  };

  // 5. Gig Work Income (10% weight)
  kazi: {
    gigsCompleted: number;             // monthly count (0-100)
    employerRating: number;            // 1-5 average mapped to 0-100
    incomeStability: number;           // coefficient of variation (0-100)
    skillDiversity: number;             // unique categories (0-100)
  };

  // 6. Insurance Payment Discipline (5% weight)
  linda: {
    premiumConsistency: number;        // % on-time payments (0-100)
    claimsHistory: number;               // claim frequency (negative, 0-100)
    policyTenure: number;              // months insured (0-100)
    noClaimBonus: boolean;             // 12 months no claims
  };

  // 7. KYC Verification Depth (5% weight)
  kyc: {
    tier: 1 | 2 | 3;                   // verification level
    idVerified: boolean;
    addressVerified: boolean;
    biometricEnrolled: boolean;
  };
}

export interface TrustScoreWeights {
  chama: number;
  mpesa: number;
  soko: number;
  loans: number;
  kazi: number;
  linda: number;
  kyc: number;
}

export interface TrustScoreResult {
  score: number;        // 300-850
  tier: number;         // 1-4
  tierName: string;     // Bronze, Silver, Gold, Platinum
  factors: {
    chama: number;
    mpesa: number;
    soko: number;
    loans: number;
    kazi: number;
    linda: number;
    kyc: number;
  };
  maxLoanAmount: number;
  interestRate: number;
  unlockedFeatures: string[];
}

export interface ScoreHistoryPoint {
  month: string;
  score: number;
  tier: number;
}

export interface TrustScoreEvent {
  id: string;
  eventType: string;
  factor: string;
  oldScore: number;
  newScore: number;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface LoanEligibility {
  product: string;
  maxAmount: number;
  interestRate: number;
  tenureOptions: number[];
  monthlyRepayment: number;
  approved: boolean;
  reasons: string[];
}

export interface ScoreDispute {
  id: string;
  factor: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

// Default weights from sprint spec (must be configurable in production)
export const DEFAULT_WEIGHTS: TrustScoreWeights = {
  chama: 0.20,
  mpesa: 0.15,
  soko: 0.20,
  loans: 0.25,
  kazi: 0.10,
  linda: 0.05,
  kyc: 0.05,
};

// Tier configuration
export const TIER_CONFIG = {
  1: { min: 300, max: 499, name: 'Bronze', risk: 'High Risk', maxLoan: 5000, rate: 24 },
  2: { min: 500, max: 649, name: 'Silver', risk: 'Medium Risk', maxLoan: 50000, rate: 18 },
  3: { min: 650, max: 749, name: 'Gold', risk: 'Low Risk', maxLoan: 200000, rate: 14 },
  4: { min: 750, max: 850, name: 'Platinum', risk: 'Very Low Risk', maxLoan: 500000, rate: 10 },
} as const;

// Feature flags for each scoring factor (enable/disable per factor)
export interface FeatureFlags {
  chamaScoring: boolean;
  mpesaScoring: boolean;
  sokoScoring: boolean;
  loanScoring: boolean;
  kaziScoring: boolean;
  lindaScoring: boolean;
  kycScoring: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  chamaScoring: true,
  mpesaScoring: true,
  sokoScoring: true,
  loanScoring: true,
  kaziScoring: true,
  lindaScoring: true,
  kycScoring: true,
};
