import api from '../lib/api';
import type { MemberProfile } from '../types/api';

export const memberService = {
  /** The caller's own membership — the handle loans and the passbook key off. */
  getMe: async (): Promise<MemberProfile> =>
    (await api.get<MemberProfile>('/members/me')).data,
};
