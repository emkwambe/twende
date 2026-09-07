import api from '../lib/api';
import type { Passbook } from '../types/api';
import { memberService } from './memberService';

export const ledgerService = {
  /** Passbook for an explicit member. */
  getPassbook: async (memberId: string): Promise<Passbook> =>
    (await api.get<Passbook>(`/members/${memberId}/passbook`)).data,

  /** Passbook for the signed-in user, resolving their membership first. */
  getMyPassbook: async (): Promise<Passbook> => {
    const member = await memberService.getMe();
    return ledgerService.getPassbook(member.id);
  },
};
