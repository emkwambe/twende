// Wire types for the live backend. Field names mirror the API's snake_case
// exactly — no renaming at the boundary, so a mismatch is a type error rather
// than an undefined at runtime.

import type { TrustScoreFactors } from '../trust/types';

export interface MemberProfile {
  id: string;
  user_id: string | null;
  group_id: string;
  full_name: string;
  phone: string;
  phone_provider: string | null;
  national_id: string | null;
  currency: string;
  savings_balance: string;
  loan_balance: string;
  credit_score: number | null;
  role: string;
  country: string;
}

export interface LoanEligibility {
  member_id: string;
  group_id: string;
  group_name: string;
  credit_score: number;
  tier: number;
  tier_name: string;
  max_amount: string;
  interest_rate: number;
  currency: string;
  savings_balance: string;
  outstanding_balance: string;
  available_headroom: string;
  group_savings: string;
  group_limit: string;
  eligible: boolean;
  reasons: string[];
}

export interface LoanApplicationRequest {
  member_id: string;
  amount: number;
  purpose: string;
  repayment_weeks: number;
}

/** `status` carries the underwriting decision: approved | flagged | rejected,
 *  and later repaid | defaulted once the loan is running. */
export interface LoanApplication {
  id: string;
  member_id: string;
  group_id: string;
  member_name: string | null;
  group_name: string | null;
  /** ISO 4217 code the amounts on this row are denominated in. */
  currency: string;
  amount: string;
  purpose: string;
  repayment_weeks: number;
  interest_rate: string;
  weekly_payment: string | null;
  total_repayment: string | null;
  loan_balance: string;
  status: string;
  underwriting_score: number | null;
  underwriting_factors: Record<string, number> | null;
  rejection_reasons: string[] | null;
  disbursement_method: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PassbookEntry {
  id: string;
  member_id: string;
  group_id: string;
  loan_id: string | null;
  transaction_type: string;
  amount: string;
  balance_after: string;
  description: string | null;
  reference: string | null;
  week_number: number | null;
  payment_method: string | null;
  created_at: string;
}

export interface Passbook {
  member_id: string;
  member_name: string;
  group_id: string;
  group_name: string;
  national_id: string | null;
  currency: string;
  savings_balance: string;
  loan_balance: string;
  transaction_count: number;
  transactions: PassbookEntry[];
}

export interface RepaymentRequest {
  amount: number;
  week_number: number;
  payment_method?: string;
  mpesa_receipt?: string;
}

export interface RepaymentResult {
  loan: LoanApplication;
  transaction: PassbookEntry;
  remaining_balance: string;
  is_on_time: boolean;
  message: string;
}

/** Pillars with no server-side records yet come back null. `live_factors`
 *  names the ones that are real, so the UI can say which parts of a displayed
 *  score are backed by data rather than filled in from demo values. */
export type LiveTrustFactors = {
  [K in keyof TrustScoreFactors]: TrustScoreFactors[K] | null;
};

export interface TrustFactorsResponse {
  factors: LiveTrustFactors;
  live_factors: (keyof TrustScoreFactors)[];
  credit_score: number;
}
