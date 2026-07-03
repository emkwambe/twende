// TWENDE Biashara v2 — Loan Calculation Engine
// Sprint 07: Merchant Super-App

import type { LoanProduct, RepaymentSchedule, Installment, RepaymentFrequency } from './types';

// ─── LOAN PRODUCT CONFIGURATION ─────────────────────────────────────────

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'working_capital',
    name: 'Working Capital Loan',
    type: 'working_capital',
    minScore: 300,
    minTier: 1,
    minAmount: 5000,
    maxAmount: 500000,
    baseInterestRate: 0.24,
    interestType: 'reducing_balance',
    processingFee: 0.025,
    lateFee: 0.005,
    minTenure: 1,
    maxTenure: 104,
    repaymentFrequency: 'weekly',
    allowsTopUp: true,
    allowsEarlyRepayment: true,
    earlyRepaymentRebate: 0.02,
    requiresGuarantor: false,
    features: ['Reducing balance interest', 'Top-up eligible', 'Early repayment rebate 2%', 'Weekly repayments'],
  },
  {
    id: 'inventory_finance',
    name: 'Inventory Finance',
    type: 'inventory',
    minScore: 500,
    minTier: 2,
    minAmount: 10000,
    maxAmount: 200000,
    baseInterestRate: 0.18,
    interestType: 'reducing_balance',
    processingFee: 0.015,
    lateFee: 0.005,
    minTenure: 4,
    maxTenure: 52,
    repaymentFrequency: 'monthly',
    allowsTopUp: false,
    allowsEarlyRepayment: true,
    earlyRepaymentRebate: 0.02,
    requiresGuarantor: false,
    features: ['Reducing balance interest', 'Monthly repayments', '30-day interest-free for suppliers', 'Early repayment rebate 2%'],
  },
  {
    id: 'emergency_micro',
    name: 'Emergency Micro-Loan',
    type: 'emergency',
    minScore: 300,
    minTier: 1,
    minAmount: 1000,
    maxAmount: 5000,
    baseInterestRate: 0.24,
    interestType: 'flat',
    processingFee: 0.05,
    lateFee: 0.01,
    minTenure: 1,
    maxTenure: 4,
    repaymentFrequency: 'weekly',
    allowsTopUp: false,
    allowsEarlyRepayment: false,
    earlyRepaymentRebate: 0,
    requiresGuarantor: false,
    features: ['Flat interest rate', 'Fast approval', 'No early repayment', 'Emergency only'],
  },
];

// ─── REDUCING BALANCE SCHEDULE CALCULATOR ────────────────────────────────

export function calculateReducingBalanceSchedule(
  principal: number,
  annualRate: number,
  tenureWeeks: number,
  repaymentFrequency: RepaymentFrequency = 'weekly'
): RepaymentSchedule {
  const weeklyRate = annualRate / 52;
  
  // Calculate installment using annuity formula
  const installment = (principal * weeklyRate) / (1 - Math.pow(1 + weeklyRate, -tenureWeeks));
  
  const schedule: Installment[] = [];
  let balance = principal;
  const startDate = new Date();
  
  for (let week = 1; week <= tenureWeeks; week++) {
    const interest = balance * weeklyRate;
    const principalPaid = installment - interest;
    balance -= principalPaid;
    
    // Ensure final balance is exactly 0
    const finalBalance = week === tenureWeeks ? 0 : Math.max(0, balance);
    
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + week * 7);
    
    schedule.push({
      week,
      dueDate: dueDate.toISOString().split('T')[0],
      installment: Math.round(installment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(finalBalance * 100) / 100,
      status: 'pending',
    });
  }
  
  const totalInterest = schedule.reduce((sum, i) => sum + i.interest, 0);
  const totalRepayment = schedule.reduce((sum, i) => sum + i.installment, 0);
  
  // Regulatory cap: total interest cannot exceed 100% of principal
  const cappedTotalInterest = Math.min(totalInterest, principal);
  const cappedTotalRepayment = principal + cappedTotalInterest;
  
  // Calculate APR (simplified: annual rate for reducing balance)
  const apr = annualRate * 100;
  
  // Processing fee
  const processingFee = principal * 0.025;
  const disbursedAmount = principal - processingFee;
  
  return {
    principal,
    totalInterest: Math.round(cappedTotalInterest * 100) / 100,
    totalRepayment: Math.round(cappedTotalRepayment * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    disbursedAmount: Math.round(disbursedAmount * 100) / 100,
    apr: Math.round(apr * 100) / 100,
    installments: schedule,
  };
}

// ─── FLAT INTEREST SCHEDULE ─────────────────────────────────────────────

export function calculateFlatSchedule(
  principal: number,
  annualRate: number,
  tenureWeeks: number
): RepaymentSchedule {
  const weeklyRate = annualRate / 52;
  const totalInterest = principal * weeklyRate * tenureWeeks;
  const totalRepayment = principal + totalInterest;
  const installment = totalRepayment / tenureWeeks;
  const principalPerWeek = principal / tenureWeeks;
  
  const schedule: Installment[] = [];
  const startDate = new Date();
  
  for (let week = 1; week <= tenureWeeks; week++) {
    const interestPerWeek = totalInterest / tenureWeeks;
    const balance = principal - principalPerWeek * week;
    
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + week * 7);
    
    schedule.push({
      week,
      dueDate: dueDate.toISOString().split('T')[0],
      installment: Math.round(installment * 100) / 100,
      principal: Math.round(principalPerWeek * 100) / 100,
      interest: Math.round(interestPerWeek * 100) / 100,
      balance: Math.round(Math.max(0, balance) * 100) / 100,
      status: 'pending',
    });
  }
  
  const processingFee = principal * 0.05;
  const disbursedAmount = principal - processingFee;
  
  return {
    principal,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    disbursedAmount: Math.round(disbursedAmount * 100) / 100,
    apr: Math.round(annualRate * 100 * 100) / 100,
    installments: schedule,
  };
}

// ─── UNIFIED SCHEDULE CALCULATOR ─────────────────────────────────────────

export function calculateSchedule(
  principal: number,
  annualRate: number,
  tenureWeeks: number,
  interestType: 'reducing_balance' | 'flat' = 'reducing_balance',
  repaymentFrequency: RepaymentFrequency = 'weekly'
): RepaymentSchedule {
  if (interestType === 'reducing_balance') {
    return calculateReducingBalanceSchedule(principal, annualRate, tenureWeeks, repaymentFrequency);
  }
  return calculateFlatSchedule(principal, annualRate, tenureWeeks);
}

// ─── LOAN PRODUCT BY ID ─────────────────────────────────────────────────

export function getLoanProduct(id: string): LoanProduct | undefined {
  return LOAN_PRODUCTS.find(p => p.id === id);
}

// ─── TIER-BASED INTEREST RATE ──────────────────────────────────────────

export function getTierInterestRate(tier: number): number {
  switch (tier) {
    case 1: return 0.24;
    case 2: return 0.18;
    case 3: return 0.14;
    case 4: return 0.10;
    default: return 0.24;
  }
}

export function getTierMaxAmount(tier: number): number {
  switch (tier) {
    case 1: return 5000;
    case 2: return 50000;
    case 3: return 200000;
    case 4: return 500000;
    default: return 5000;
  }
}

// ─── EARLY REPAYMENT CALCULATOR ────────────────────────────────────────

export function calculateEarlyRepayment(
  remainingBalance: number,
  remainingWeeks: number,
  annualRate: number,
  rebateRate: number = 0.02
): { fullAmount: number; rebateAmount: number; netAmount: number } {
  const weeklyRate = annualRate / 52;
  
  // Calculate remaining interest
  let remainingInterest = 0;
  let balance = remainingBalance;
  for (let w = 0; w < remainingWeeks; w++) {
    const interest = balance * weeklyRate;
    remainingInterest += interest;
    balance -= interest; // Simplified: assumes interest-only for calc
  }
  
  const fullAmount = remainingBalance + remainingInterest;
  const rebateAmount = remainingInterest * rebateRate;
  const netAmount = fullAmount - rebateAmount;
  
  return {
    fullAmount: Math.round(fullAmount * 100) / 100,
    rebateAmount: Math.round(rebateAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}

// ─── BUSINESS HEALTH SCORE ──────────────────────────────────────────────

export function calculateBusinessHealthScore(
  revenue: number,
  expenses: number,
  revenueGrowth: number,
  consistency: number // 0-100, how consistent revenue is
): number {
  const profitMargin = revenue > 0 ? (revenue - expenses) / revenue : 0;
  
  // Score components (0-100 each)
  const profitabilityScore = Math.min(100, profitMargin * 200); // 50% margin = 100
  const growthScore = Math.min(100, revenueGrowth * 5); // 20% growth = 100
  const consistencyScore = consistency;
  
  // Weighted composite
  const healthScore = Math.round(
    profitabilityScore * 0.4 +
    growthScore * 0.3 +
    consistencyScore * 0.3
  );
  
  return Math.max(0, Math.min(100, healthScore));
}

// ─── CASH FLOW PROJECTION ───────────────────────────────────────────────

export function projectCashFlow(
  dailyRevenue: number[],
  dailyExpenses: number[],
  days: number = 30
): { projectedRevenue: number; projectedExpenses: number; projectedCashFlow: number } {
  const avgRevenue = dailyRevenue.reduce((a, b) => a + b, 0) / dailyRevenue.length;
  const avgExpenses = dailyExpenses.reduce((a, b) => a + b, 0) / dailyExpenses.length;
  
  const projectedRevenue = avgRevenue * days;
  const projectedExpenses = avgExpenses * days;
  const projectedCashFlow = projectedRevenue - projectedExpenses;
  
  return {
    projectedRevenue: Math.round(projectedRevenue),
    projectedExpenses: Math.round(projectedExpenses),
    projectedCashFlow: Math.round(projectedCashFlow),
  };
}
