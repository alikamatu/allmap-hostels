"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = () =>
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

// ─── Token cookie helpers (for Next.js middleware) ────────────────────────────

function setAuthCookie(token: string, remember: boolean) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined;
  document.cookie = `access_token=${token}; path=/; SameSite=Lax${maxAge ? `; max-age=${maxAge}` : ''}`;
}

function clearAuthCookie() {
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
}

function getToken(): string | null {
  return (
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token')
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  name: string;
  gender?: string;
  is_verified: boolean;
  phone: string;
  terms_accepted: boolean;
}

interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  loginWithGoogle: (credential: string, rememberMe?: boolean) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: string,
    termsAccepted: boolean,
    name?: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  acceptTerms: () => Promise<void>;
  getTermsStatus: () => Promise<{
    terms_accepted: boolean;
    terms_accepted_at?: string;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  // Shared post-login handler — checks verification status immediately
  // so we can redirect straight to /dashboard without an extra round-trip page.
  const handlePostLogin = useCallback(
    async (data: LoginResponse, rememberMe: boolean) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', data.access_token);
      if (data.refresh_token) storage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setAuthCookie(data.access_token, rememberMe);

      // Immediately resolve verification status to skip extra page navigation
      try {
        const statusRes = await fetch(`${API_BASE()}/admin/status`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        if (statusRes.ok) {
          const { status } = await statusRes.json();
          if (status === 'approved') {
            router.push('/dashboard');
            return;
          }
          router.push(`/verification-status?status=${status}`);
          return;
        }
      } catch {
        // Status check failed — let the verification-status page handle it
      }

      router.push('/verification-status');
    },
    [router],
  );

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const response = await fetch(`${API_BASE()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg: string = data.message || 'Login failed';
        if (msg.toLowerCase().includes('verify your email')) {
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
          return;
        }
        throw new Error(msg);
      }

      const loginData = data as LoginResponse;

      if (!loginData.user.is_verified) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      await handlePostLogin(loginData, rememberMe);
    },
    [router, handlePostLogin],
  );

  const loginWithGoogle = useCallback(
    async (credential: string, rememberMe = true) => {
      const response = await fetch(`${API_BASE()}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role: 'hostel_admin' }),
      });

      if (!response.ok) {
        // Parse JSON safely — a 404 body is often HTML, not JSON
        const data = await response.json().catch(() => ({})) as Record<string, string>;
        if (response.status === 404) {
          throw new Error(
            'Google sign-in is not yet enabled on this server. Please use your email and password to sign in.',
          );
        }
        throw new Error(data.message || `Sign-in failed (${response.status})`);
      }

      const data = await response.json();
      await handlePostLogin(data as LoginResponse, rememberMe);
    },
    [handlePostLogin],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: string,
      termsAccepted: boolean,
      name?: string,
      phone?: string,
    ) => {
      const response = await fetch(`${API_BASE()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password_hash: password,
          role,
          terms_accepted: termsAccepted,
          name: name?.trim(),
          phone: phone?.trim(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Registration failed');
      }

      return response.json();
    },
    [],
  );

  const logout = useCallback(() => {
    ['access_token', 'refresh_token', 'user', 'pending_user_email'].forEach(
      (k) => localStorage.removeItem(k),
    );
    ['access_token', 'refresh_token', 'pending_user_email'].forEach((k) =>
      sessionStorage.removeItem(k),
    );
    clearAuthCookie();
    setUser(null);
    router.push('/');
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    const response = await fetch(`${API_BASE()}/auth/admin/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to send reset email');
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        const response = await fetch(`${API_BASE()}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok)
          return { ok: true, message: data.message || 'Password reset successful' };
        throw new Error(data.message || 'Password reset failed');
      } catch (error) {
        return {
          ok: false,
          message:
            error instanceof Error ? error.message : 'Password reset failed',
        };
      }
    },
    [],
  );

  const acceptTerms = useCallback(async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE()}/auth/accept-terms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to accept terms');
    }
    if (user) {
      const updated = { ...user, terms_accepted: true };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  }, [user]);

  const getTermsStatus = useCallback(async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE()}/auth/terms-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to get terms status');
    }
    return response.json();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        forgotPassword,
        resetPassword,
        acceptTerms,
        getTermsStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
