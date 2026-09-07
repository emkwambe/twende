import api from '../lib/api';
import type {
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  OTPVerification,
  RegisterRequest,
  User,
} from '../types';

const AUTH_KEY = 'twende_tokens';
const USER_KEY = 'twende_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    this._persist(response.data);
    return response.data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    this._persist(response.data);
    return response.data;
  },

  async logout(): Promise<void> {
    const tokens = this.getTokens();
    if (tokens?.refresh_token) {
      try {
        await api.post('/auth/logout', { refresh_token: tokens.refresh_token });
      } catch {
        // best effort
      }
    }
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async sendOTP(phone: string): Promise<{ phone: string; expires_in_minutes: number; dev_otp?: string }> {
    const response = await api.post('/auth/otp/send', { phone });
    return response.data;
  },

  async verifyOTP(payload: OTPVerification): Promise<{ phone: string; verified: boolean }> {
    const response = await api.post('/auth/otp/verify', payload);
    return response.data;
  },

  /**
   * Returns null only when there is no token to use. A failed request throws,
   * so the caller can tell "not signed in" from "server unreachable" — those
   * need opposite handling, and collapsing them logs the user out whenever the
   * backend is down. A genuine 401 is handled by the response interceptor,
   * which refreshes or clears the session before this ever rejects.
   */
  async fetchCurrentUser(): Promise<User | null> {
    const tokens = this.getTokens();
    if (!tokens?.access_token) return null;
    const response = await api.get<User>('/users/me');
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  getTokens(): AuthTokens | null {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  _persist(response: AuthResponse): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(response.tokens));
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  },
};
