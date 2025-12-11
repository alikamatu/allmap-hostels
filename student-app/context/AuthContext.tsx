"use client";

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  school_id: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  emergency_contact_email?: string;
}

interface AuthContextType {
  user: User | null;
  register: (name: string, phone: string, email: string, password: string, role: string, termsAccepted: boolean, gender?: string) => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  getOnboardingStatus: () => Promise<OnboardingStatus>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  gender?: string;
  is_verified: boolean;
  phone: string;
  terms_accepted: boolean;
  onboarding_completed: boolean;
  school_id?: string;
}

interface OnboardingStatus {
  onboarding_completed: boolean;
  school_id?: string;
  has_emergency_contact: boolean;
}

interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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

  const getAuthToken = () => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

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
        
        if (errorMessage.includes('verify your email')) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
      localStorage.setItem('userId', loginData.user.id);
      setUser(loginData.user);

      // Check if onboarding is completed
      if (!loginData.user.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId'); // Add this line
  localStorage.removeItem('hasAccess'); // Clear paywall flags
  localStorage.removeItem('accessExpiry');
  localStorage.removeItem('preview_used');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('userId'); // Also clear from session
  setUser(null);
  router.push('/');
};
  const register = async (
    name: string,
    phone: string,
    email: string,
    password: string,
    role: string,
    termsAccepted: boolean,
    gender?: string
  ) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          password_hash: password,
          role,
          gender,
          terms_accepted: termsAccepted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      const updatedProfile = await response.json();
      
      // Update user in state and localStorage
      const updatedUser = { 
        ...user, 
        ...updatedProfile,
        onboarding_completed: true,
        school_id: data.school_id
      };
      setUser(updatedUser as User);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      router.push('/dashboard');
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  };

  const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/onboarding/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get onboarding status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get onboarding status error:', error);
      throw error;
    }
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

      const data = await response.json().catch(() => ({}));
      
      if (response.ok && (response.status === 200 || response.status === 201)) {
        return {
          ok: data.success === true,
          message: data.message || 'Password reset successful'
        };
      }
      
      throw new Error(data.message || 'Password reset failed');
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      register, 
      login, 
      logout, 
      completeOnboarding,
      getOnboardingStatus,
      forgotPassword, 
      resetPassword
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