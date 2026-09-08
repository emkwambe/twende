import api from '../lib/api';
import type { Group, GroupCreateRequest } from '../types/api';

export const groupService = {
  /** Create a new savings group. The creator is automatically made chair. */
  create: async (data: GroupCreateRequest): Promise<Group> =>
    (await api.post<Group>('/groups', data)).data,

  /** List groups the current user belongs to. */
  getMyGroups: async (): Promise<Group[]> =>
    (await api.get<Group[]>('/groups/my')).data,

  /** All members of a specific group. */
  getMembers: async (groupId: string): Promise<Group[]> =>
    (await api.get<Group[]>(`/groups/${groupId}/members`)).data,

  /** Group ledger summary for the treasurer. */
  getLedger: async (groupId: string): Promise<Record<string, unknown>> =>
    (await api.get<Record<string, unknown>>(`/groups/${groupId}/ledger`)).data,
};
