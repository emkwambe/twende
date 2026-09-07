import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthState, LoginCredentials, RegisterRequest, User } from '../types';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isAgentOrAdmin: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    setIsLoading(true);
    const stored = authService.getStoredUser();
    if (stored) {
      setUser(stored);
    }
    try {
      const current = await authService.fetchCurrentUser();
      setUser(current);
    } catch {
      // The server never answered. Keep the stored session so the app still
      // renders offline in demo mode; an actual auth failure is handled by the
      // API interceptor, which clears the session and redirects to login.
      if (!stored) setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      const current = await authService.fetchCurrentUser();
      if (current) setUser(current);
    } catch {
      // Offline refresh is a no-op; the existing session stands.
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextValue = {
    user,
    tokens: authService.getTokens(),
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isAgentOrAdmin: user?.role === 'admin' || user?.role === 'agent',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
