export interface User {
  id: string;
  phone: string;
  display_name: string;
  email: string | null;
  kyc_tier: number;
  kyc_verified_at: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  credit_score: number;
  avatar: string;
  role: 'user' | 'agent' | 'admin';
  country: 'KE' | 'TZ';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface KYCData {
  full_name: string;
  national_id?: string;
  date_of_birth?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phone: string;
  pin: string;
}

export interface RegisterRequest {
  phone: string;
  pin: string;
  kyc: KYCData;
}

export interface OTPVerification {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
