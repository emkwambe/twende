import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface Group {
  id: string;
  name: string;
  country: 'KE' | 'TZ';
  group_type: string;
  location: string | null;
  region: string | null;
  member_count: number;
  total_savings: string;
  interest_rate: string;
  meeting_frequency: string;
  chair_name: string | null;
  treasurer_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useMyGroups() {
  return useQuery({
    queryKey: ['groups', 'my'],
    queryFn: async () => {
      const response = await api.get<Group[]>('/groups/my');
      return response.data;
    },
  });
}
