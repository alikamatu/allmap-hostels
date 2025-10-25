"use client";

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create Auth Context
interface AuthContextType {
  user: any;
  register: (email: string, password: string, role: string, termsAccepted: boolean) => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  acceptTerms: () => Promise<void>;
  getTermsStatus: () => Promise<{ terms_accepted: boolean; terms_accepted_at?: string }>;
}

// Define types
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

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.message || 'Login failed';
        
        // Handle specific error cases
        if (errorMessage.includes('verify your email')) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        
        if (errorMessage.includes('terms and conditions')) {
          // Store partial login info and redirect to terms page
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('pending_user_email', email);
          router.push('/accept-terms');
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const loginData = data as LoginResponse;
      
      if (!loginData.user.is_verified) {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', loginData.access_token);
      if (loginData.refresh_token) {
        storage.setItem('refresh_token', loginData.refresh_token);
      }
      
      localStorage.setItem('user', JSON.stringify(loginData.user));
      setUser(loginData.user);

      // Redirect to verification status
      router.push('/verification-status');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_user_email');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('pending_user_email');
    setUser(null);
    router.push('/');
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      // Parse response data first
      const data = await response.json().catch(() => ({}));
      
      // Handle successful responses
      if (response.ok && (response.status === 200 || response.status === 201)) {
        // Backend returns { success: true, message: '...' }
        // Transform it to { ok: true, message: '...' }
        return {
          ok: data.success === true,
          message: data.message || 'Password reset successful'
        };
      }
      
      // Handle error responses
      throw new Error(data.message || 'Password reset failed');
    } catch (error) {
      console.error('Password reset error:', error);
      // Return error state instead of throwing
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  };

  const register = async (
    email: string,
    password: string,
    role: string,
    termsAccepted: boolean,
  ) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password_hash: password,
          role,
          terms_accepted: termsAccepted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const acceptTerms = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/accept-terms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept terms');
      }

      // Update user in state and localStorage
      if (user) {
        const updatedUser = { ...user, terms_accepted: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Accept terms error:', error);
      throw error;
    }
  };

  const getTermsStatus = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/terms-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get terms status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get terms status error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      register, 
      login, 
      logout, 
      forgotPassword, 
      resetPassword,
      acceptTerms,
      getTermsStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}