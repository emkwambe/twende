// TWENDE Biashara v2 — TypeScript Types
// Sprint 07: Merchant Super-App

export type LoanProductType = 'working_capital' | 'inventory' | 'emergency' | 'topup';
export type RepaymentFrequency = 'weekly' | 'biweekly' | 'monthly';
export type InterestType = 'reducing_balance' | 'flat';
export type LoanStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'closed' | 'defaulted';
export type ActiveLoanStatus = 'active' | 'paid_off' | 'defaulted' | 'restructured' | 'written_off';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'partial';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface LoanProduct {
  id: string;
  name: string;
  type: LoanProductType;
  minScore: number;
  minTier: number;
  maxAmount: number;
  minAmount: number;
  baseInterestRate: number;
  interestType: InterestType;
  processingFee: number;
  lateFee: number;
  minTenure: number;
  maxTenure: number;
  repaymentFrequency: RepaymentFrequency;
  allowsTopUp: boolean;
  allowsEarlyRepayment: boolean;
  earlyRepaymentRebate: number;
  requiresGuarantor: boolean;
  features: string[];
}

export interface Installment {
  week: number;
  dueDate: string;
  installment: number;
  principal: number;
  interest: number;
  balance: number;
  status?: InstallmentStatus;
  paidAmount?: number;
  paidAt?: string;
}

export interface RepaymentSchedule {
  principal: number;
  totalInterest: number;
  totalRepayment: number;
  processingFee: number;
  disbursedAmount: number;
  apr: number;
  installments: Installment[];
}

export interface ActiveLoan {
  id: string;
  product: LoanProductType;
  productName: string;
  principal: number;
  interestRate: number;
  tenureWeeks: number;
  totalRepayable: number;
  totalInterest: number;
  disbursedAmount: number;
  remainingBalance: number;
  status: ActiveLoanStatus;
  nextDueDate: string;
  nextDueAmount: number;
  installmentsPaid: number;
  totalInstallments: number;
  repaymentSchedule: Installment[];
  progress: number;
}

export interface BusinessMetric {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface BusinessMetrics {
  daily: BusinessMetric[];
  weekly: BusinessMetric[];
  monthly: BusinessMetric[];
  profitMargin: number;
  cashFlow30d: number;
  healthScore: number;
  revenueGrowth: number;
  expenseGrowth: number;
  marginGrowth: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  totalPaid: number;
  lastPayment: string;
  category: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  autoDeductPercentage: number;
  status: GoalStatus;
}

export interface LoanApplication {
  productId: string;
  amount: number;
  tenure: number;
  purpose: string;
}
