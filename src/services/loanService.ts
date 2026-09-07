import api from '../lib/api';
import type {
  LoanApplication,
  LoanApplicationRequest,
  LoanEligibility,
  RepaymentRequest,
  RepaymentResult,
} from '../types/api';

export const loanService = {
  /** Terms the borrower qualifies for, before naming an amount. */
  getEligibility: async (): Promise<LoanEligibility> =>
    (await api.get<LoanEligibility>('/loans/eligibility')).data,

  /** Submits the application and returns the live underwriting decision. */
  apply: async (data: LoanApplicationRequest): Promise<LoanApplication> =>
    (await api.post<LoanApplication>('/loans/apply', data)).data,

  getMyLoans: async (): Promise<LoanApplication[]> =>
    (await api.get<LoanApplication[]>('/loans/my')).data,

  getLoan: async (id: string): Promise<LoanApplication> =>
    (await api.get<LoanApplication>(`/loans/${id}`)).data,

  repay: async (id: string, payload: RepaymentRequest): Promise<RepaymentResult> =>
    (await api.post<RepaymentResult>(`/loans/${id}/repayment`, payload)).data,
};
