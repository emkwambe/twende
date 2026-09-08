import api from '../lib/api';
import type { MemberCreateRequest, MemberProfile } from '../types/api';

export const memberService = {
  /** The caller's own membership — the handle loans and the passbook key off. */
  getMe: async (): Promise<MemberProfile> =>
    (await api.get<MemberProfile>('/members/me')).data,

  /** Invite/add a member to a group. Only chairs, treasurers, or admins. */
  create: async (data: MemberCreateRequest): Promise<MemberProfile> =>
    (await api.post<MemberProfile>('/members', data)).data,
};
