import api from '../lib/api';
import type { User } from '../types/auth';
import type { TrustFactorsResponse } from '../types/api';

export const userService = {
  getMe: async (): Promise<User> => (await api.get<User>('/users/me')).data,

  /** The Trust Engine's factor vector, computed server-side from recorded data. */
  getTrustFactors: async (): Promise<TrustFactorsResponse> =>
    (await api.get<TrustFactorsResponse>('/users/me/trust-factors')).data,
};
