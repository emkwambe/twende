// TWENDE Trust Engine — Scoring Algorithm
// Sprint 05: Credit Scoring & Trust Engine
// All 7 factor scoring functions + composite calculator

import type {
  TrustScoreFactors,
  TrustScoreWeights,
  TrustScoreResult,
  ScoreHistoryPoint,
  FeatureFlags,
} from './types';
import {
  TIER_CONFIG,
  DEFAULT_WEIGHTS,
  DEFAULT_FEATURE_FLAGS,
} from './types';

// ─── 1. CHAMA SAVINGS BEHAVIOR (20% weight) ───────────────────────────────

export function calculateChamaScore(factors: TrustScoreFactors['chama']): number {
  let score = 0;

  // Contribution consistency (40% of chama score)
  score += factors.contributionConsistency * 0.40;

  // Savings volume (30% of chama score)
  score += Math.min(factors.savingsVolume, 100) * 0.30;

  // Group tenure (20% of chama score)
  score += Math.min(factors.groupTenure, 100) * 0.20;

  // Leadership bonus (10% of chama score, or +15 points flat)
  if (factors.leadershipRole) {
    score += 15; // Flat bonus for officers
  } else {
    score += factors.groupTenure * 0.10; // Regular members get tenure points
  }

  return Math.min(Math.round(score), 100);
}

// ─── 2. M-PESA TRANSACTION HISTORY (15% weight) ───────────────────────────

export function calculateMpesaScore(factors: TrustScoreFactors['mpesa']): number {
  let score = 0;

  // Transaction volume (35% of mpesa score)
  score += Math.min(factors.transactionVolume, 100) * 0.35;

  // Transaction frequency (30% of mpesa score)
  score += Math.min(factors.transactionFrequency, 100) * 0.30;

  // Balance stability (20% of mpesa score)
  score += Math.min(factors.balanceStability, 100) * 0.20;

  // Airtime purchase consistency (15% of mpesa score)
  score += Math.min(factors.airtimePurchase, 100) * 0.15;

  return Math.min(Math.round(score), 100);
}

// ─── 3. SOKO SALES PERFORMANCE (20% weight) ───────────────────────────────

export function calculateSokoScore(factors: TrustScoreFactors['soko']): number {
  let score = 0;

  // GMV (35% of soko score)
  score += Math.min(factors.gmv, 100) * 0.35;

  // Customer rating (25% of soko score)
  score += Math.min(factors.customerRating, 100) * 0.25;

  // Fulfillment rate (25% of soko score)
  // >95% = bonus, <80% = penalty
  if (factors.fulfillmentRate >= 95) {
    score += 100 * 0.25;
  } else if (factors.fulfillmentRate >= 80) {
    score += factors.fulfillmentRate * 0.25;
  } else {
    score += Math.max(0, factors.fulfillmentRate - 20) * 0.25; // Penalty
  }

  // Inventory turnover (15% of soko score)
  score += Math.min(factors.inventoryTurnover, 100) * 0.15;

  return Math.min(Math.round(score), 100);
}

// ─── 4. LOAN REPAYMENT HISTORY (25% weight — HIGHEST) ─────────────────────

export function calculateLoanScore(factors: TrustScoreFactors['loans']): number {
  let score = 0;

  // Repayment rate (50% of loan score)
  score += Math.min(factors.repaymentRate, 100) * 0.50;

  // Active loans penalty (15% of loan score)
  if (factors.activeLoans <= 2) {
    score += 100 * 0.15;
  } else if (factors.activeLoans <= 4) {
    score += 60 * 0.15;
  } else {
    score += 20 * 0.15; // Heavy penalty for too many loans
  }

  // Default history (20% of loan score)
  if (!factors.defaultHistory) {
    score += 100 * 0.20;
  } else {
    score += 0; // Default is devastating
  }

  // Credit utilization (15% of loan score)
  // <30% is ideal, >80% is risky
  if (factors.creditUtilization <= 30) {
    score += 100 * 0.15;
  } else if (factors.creditUtilization <= 60) {
    score += 70 * 0.15;
  } else if (factors.creditUtilization <= 80) {
    score += 40 * 0.15;
  } else {
    score += 10 * 0.15;
  }

  return Math.min(Math.round(score), 100);
}

// ─── 5. GIG WORK INCOME (10% weight) ──────────────────────────────────────

export function calculateKaziScore(factors: TrustScoreFactors['kazi']): number {
  let score = 0;

  // Gigs completed (35% of kazi score)
  score += Math.min(factors.gigsCompleted, 100) * 0.35;

  // Employer rating (25% of kazi score)
  score += Math.min(factors.employerRating, 100) * 0.25;

  // Income stability (25% of kazi score)
  score += Math.min(factors.incomeStability, 100) * 0.25;

  // Skill diversity (15% of kazi score)
  score += Math.min(factors.skillDiversity, 100) * 0.15;

  return Math.min(Math.round(score), 100);
}

// ─── 6. INSURANCE PAYMENT DISCIPLINE (5% weight) ──────────────────────────

export function calculateLindaScore(factors: TrustScoreFactors['linda']): number {
  let score = 0;

  // Premium consistency (40% of linda score)
  score += Math.min(factors.premiumConsistency, 100) * 0.40;

  // Claims history (negative factor, 20% of linda score)
  // Fewer claims = better score (but 0 claims is suspicious)
  if (factors.claimsHistory === 0) {
    score += 80 * 0.20; // Slightly suspicious if never claimed
  } else if (factors.claimsHistory <= 2) {
    score += 100 * 0.20; // Normal claim history
  } else if (factors.claimsHistory <= 5) {
    score += 60 * 0.20;
  } else {
    score += 20 * 0.20; // Too many claims
  }

  // Policy tenure (20% of linda score)
  score += Math.min(factors.policyTenure, 100) * 0.20;

  // No-claim bonus (20% of linda score)
  if (factors.noClaimBonus) {
    score += 100 * 0.20;
  } else {
    score += 50 * 0.20;
  }

  return Math.min(Math.round(score), 100);
}

// ─── 7. KYC VERIFICATION DEPTH (5% weight) ────────────────────────────────

export function calculateKycScore(factors: TrustScoreFactors['kyc']): number {
  let score = 0;

  // Tier-based base score
  if (factors.tier === 3) score += 60;
  else if (factors.tier === 2) score += 40;
  else score += 20;

  // ID verification (20%)
  if (factors.idVerified) score += 20;

  // Address verification (10%)
  if (factors.addressVerified) score += 10;

  // Biometric enrollment (10%)
  if (factors.biometricEnrolled) score += 10;

  return Math.min(Math.round(score), 100);
}

// ─── COMPOSITE TRUST SCORE CALCULATOR ─────────────────────────────────────

export function calculateTrustScore(
  factors: TrustScoreFactors,
  weights: TrustScoreWeights = DEFAULT_WEIGHTS,
  featureFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS
): TrustScoreResult {
  // Calculate individual factor scores
  const chamaScore = featureFlags.chamaScoring ? calculateChamaScore(factors.chama) : 0;
  const mpesaScore = featureFlags.mpesaScoring ? calculateMpesaScore(factors.mpesa) : 0;
  const sokoScore = featureFlags.sokoScoring ? calculateSokoScore(factors.soko) : 0;
  const loanScore = featureFlags.loanScoring ? calculateLoanScore(factors.loans) : 0;
  const kaziScore = featureFlags.kaziScoring ? calculateKaziScore(factors.kazi) : 0;
  const lindaScore = featureFlags.lindaScoring ? calculateLindaScore(factors.linda) : 0;
  const kycScore = featureFlags.kycScoring ? calculateKycScore(factors.kyc) : 0;

  // Weighted composite (maps to 300-850 range)
  const rawScore =
    chamaScore * weights.chama +
    mpesaScore * weights.mpesa +
    sokoScore * weights.soko +
    loanScore * weights.loans +
    kaziScore * weights.kazi +
    lindaScore * weights.linda +
    kycScore * weights.kyc;

  // Map 0-100 to 300-850
  const finalScore = Math.round(300 + (rawScore / 100) * 550);
  const clampedScore = Math.max(300, Math.min(850, finalScore));

  // Determine tier
  const tier = getTier(clampedScore);
  const tierConfig = TIER_CONFIG[tier];

  // Unlocked features based on tier
  const unlockedFeatures = getUnlockedFeatures(tier);

  return {
    score: clampedScore,
    tier,
    tierName: tierConfig.name,
    factors: {
      chama: chamaScore,
      mpesa: mpesaScore,
      soko: sokoScore,
      loans: loanScore,
      kazi: kaziScore,
      linda: lindaScore,
      kyc: kycScore,
    },
    maxLoanAmount: tierConfig.maxLoan,
    interestRate: tierConfig.rate,
    unlockedFeatures,
  };
}

// ─── TIER MAPPING ─────────────────────────────────────────────────────────

export function getTier(score: number): 1 | 2 | 3 | 4 {
  if (score >= 750) return 4;
  if (score >= 650) return 3;
  if (score >= 500) return 2;
  return 1;
}

export function getTierName(score: number): string {
  return TIER_CONFIG[getTier(score)].name;
}

export function getTierColor(score: number): string {
  const tier = getTier(score);
  switch (tier) {
    case 1: return '#E74C3C'; // coral
    case 2: return '#F59E0B'; // amber
    case 3: return '#2ECC71'; // fresh
    case 4: return '#FFD700'; // gold
  }
}

export function getTierColorClass(score: number): string {
  const tier = getTier(score);
  switch (tier) {
    case 1: return 'text-coral';
    case 2: return 'text-sunrise';
    case 3: return 'text-fresh';
    case 4: return 'text-yellow-500';
  }
}

// ─── UNLOCKED FEATURES ────────────────────────────────────────────────────

function getUnlockedFeatures(tier: number): string[] {
  const base = ['Basic account', 'Chama contributions'];
  
  if (tier >= 2) {
    base.push('Biashara loans up to KES 50K', 'Linda insurance', 'Soko selling');
  }
  if (tier >= 3) {
    base.push('Biashara loans up to KES 200K', 'Premium insurance', 'Overdraft facility', 'Kazi emergency loans');
  }
  if (tier >= 4) {
    base.push('Biashara loans up to KES 500K', 'Revolving credit', 'Business loans', 'Co-guarantee loans', 'Best interest rates');
  }
  
  return base;
}

// ─── SCORE HISTORY GENERATOR ──────────────────────────────────────────────

export function generateScoreHistory(
  currentScore: number,
  months: number = 6
): ScoreHistoryPoint[] {
  const history: ScoreHistoryPoint[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthNames[d.getMonth()];
    
    // Generate a realistic upward trend with some variation
    const progress = (months - 1 - i) / (months - 1); // 0 to 1
    const baseScore = currentScore - Math.round((1 - progress) * 70);
    const variation = Math.round(Math.random() * 20 - 10);
    const score = Math.max(300, Math.min(850, baseScore + variation));
    
    history.push({
      month,
      score,
      tier: getTier(score),
    });
  }
  
  return history;
}

// ─── WHAT-IF SIMULATOR ───────────────────────────────────────────────────

export interface SimulatorScenario {
  name: string;
  description: string;
  apply: (factors: TrustScoreFactors) => TrustScoreFactors;
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    name: 'Increase Chama Savings',
    description: 'Save KES 5,000 more monthly in your chama',
    apply: (f) => ({
      ...f,
      chama: { ...f.chama, savingsVolume: Math.min(100, f.chama.savingsVolume + 15) },
    }),
  },
  {
    name: 'Pay Loan Early',
    description: 'Make an early repayment on your active loan',
    apply: (f) => ({
      ...f,
      loans: { ...f.loans, repaymentRate: Math.min(100, f.loans.repaymentRate + 10) },
    }),
  },
  {
    name: 'Upgrade KYC Tier',
    description: 'Complete address verification to reach Tier 3',
    apply: (f) => ({
      ...f,
      kyc: { ...f.kyc, tier: 3 as const, addressVerified: true },
    }),
  },
  {
    name: 'Boost Soko Sales',
    description: 'Increase monthly sales by 30%',
    apply: (f) => ({
      ...f,
      soko: { ...f.soko, gmv: Math.min(100, f.soko.gmv + 20) },
    }),
  },
  {
    name: 'Consistent Insurance Payments',
    description: 'Pay Linda premiums on time for 6 months',
    apply: (f) => ({
      ...f,
      linda: { ...f.linda, premiumConsistency: 100, noClaimBonus: true },
    }),
  },
];

export function simulateScenario(
  factors: TrustScoreFactors,
  scenario: SimulatorScenario,
  weights?: TrustScoreWeights
): { currentScore: number; projectedScore: number; delta: number; projectedTier: number } {
  const current = calculateTrustScore(factors, weights);
  const modified = scenario.apply(factors);
  const projected = calculateTrustScore(modified, weights);
  
  return {
    currentScore: current.score,
    projectedScore: projected.score,
    delta: projected.score - current.score,
    projectedTier: projected.tier,
  };
}

// ─── EXPLANATION GENERATOR ────────────────────────────────────────────────

export function generateScoreExplanation(
  result: TrustScoreResult,
  factors: TrustScoreFactors
): string[] {
  const explanations: string[] = [];
  
  // Overall score explanation
  if (result.score >= 750) {
    explanations.push('Your score is excellent. You have demonstrated outstanding financial discipline across all products.');
  } else if (result.score >= 650) {
    explanations.push('Your score is good. You have strong financial habits with room for improvement in a few areas.');
  } else if (result.score >= 500) {
    explanations.push('Your score is fair. Consistent contributions and on-time repayments will improve your score.');
  } else {
    explanations.push('Your score needs improvement. Focus on consistent savings and on-time loan repayments.');
  }
  
  // Factor-specific explanations
  if (factors.loans.defaultHistory) {
    explanations.push('A previous loan default is significantly impacting your score. Consistent on-time repayments will help recover over time.');
  }
  
  if (factors.chama.leadershipRole) {
    explanations.push('Your chama leadership role adds bonus points to your score.');
  }
  
  if (factors.loans.activeLoans > 2) {
    explanations.push('Having multiple active loans may limit your score growth. Consider consolidating or repaying existing loans.');
  }
  
  if (factors.kyc.tier < 3) {
    explanations.push('Upgrading your KYC verification to Tier 3 will unlock higher scores and better loan terms.');
  }
  
  // Best factor
  const factorEntries = Object.entries(result.factors);
  const bestFactor = factorEntries.reduce((a, b) => a[1] > b[1] ? a : b);
  const factorNames: Record<string, string> = {
    chama: 'Chama savings',
    mpesa: 'M-Pesa transactions',
    soko: 'Soko sales',
    loans: 'Loan repayment',
    kazi: 'Gig work income',
    linda: 'Insurance payments',
    kyc: 'KYC verification',
  };
  explanations.push(`Your strongest factor is ${factorNames[bestFactor[0]]} at ${bestFactor[1]}/100.`);
  
  // Worst factor
  const worstFactor = factorEntries.reduce((a, b) => a[1] < b[1] ? a : b);
  explanations.push(`Your weakest factor is ${factorNames[worstFactor[0]]} at ${worstFactor[1]}/100. Improving this will have the biggest impact.`);
  
  return explanations;
}

// ─── LOAN ELIGIBILITY CALCULATOR ────────────────────────────────────────

export function calculateLoanEligibility(
  result: TrustScoreResult,
  fullFactors: TrustScoreFactors,
  product: string = 'biashara',
  requestedAmount?: number,
  requestedTenure?: number
): { maxAmount: number; interestRate: number; tenureOptions: number[]; monthlyRepayment: number; approved: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const tierConfig = TIER_CONFIG[result.tier];
  
  // Determine max amount based on tier
  const maxAmount = tierConfig.maxLoan;
  
  // Interest rate based on tier
  const interestRate = tierConfig.rate;
  
  // Tenure options based on tier
  const tenureOptions: number[] = [];
  if (result.tier >= 1) tenureOptions.push(1);
  if (result.tier >= 2) tenureOptions.push(3, 6);
  if (result.tier >= 3) tenureOptions.push(12);
  if (result.tier >= 4) tenureOptions.push(24);
  
  // Calculate monthly repayment for max amount at shortest tenure
  const tenure = requestedTenure || tenureOptions[0];
  const monthlyRate = interestRate / 100 / 12;
  const monthlyRepayment = Math.round(
    (maxAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );
  
  // Approval check
  let approved = true;
  
  if (requestedAmount && requestedAmount > maxAmount) {
    approved = false;
    reasons.push(`Requested amount exceeds your tier maximum of KES ${maxAmount.toLocaleString()}`);
  }
  
  if (result.factors.loans < 30) {
    approved = false;
    reasons.push('Your loan repayment history needs improvement');
  }
  
  if (fullFactors.loans.activeLoans > 3) {
    approved = false;
    reasons.push('You have too many active loans');
  }
  
  if (approved) {
    reasons.push(`Pre-approved for up to KES ${maxAmount.toLocaleString()} at ${interestRate}% APR`);
    reasons.push(`Your ${tierConfig.name} tier gives you access to ${tenure}-month repayment options`);
  }
  
  return {
    maxAmount,
    interestRate,
    tenureOptions,
    monthlyRepayment,
    approved,
    reasons,
  };
}
