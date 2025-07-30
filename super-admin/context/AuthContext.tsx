"use client";

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create Auth Context
interface AuthContextType {
  user: User | null;
  register: (email: string, password: string, role: string) => Promise<void>;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean }>;
}
// Define types
interface User {
  id: string;
  email: string;
  name: string;
  is_verified: boolean;
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
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const loginData = data as LoginResponse;
    
    // Store tokens and user
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', loginData.access_token);
    if (loginData.refresh_token) {
      storage.setItem('refresh_token', loginData.refresh_token);
    }
    
    localStorage.setItem('user', JSON.stringify(loginData.user));
    setUser(loginData.user);
  };

  const logout = () => {
    // Clear all auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/login');
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to send reset email');
    }
  };

const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  // Handle empty responses
  if (response.status === 204) {
    return { ok: true };
  }

  // Handle JSON responses
  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }
    return data;
  }

  // Handle non-JSON responses
  if (!response.ok) {
    throw new Error(response.statusText || 'Password reset failed');
  }

  return response;
};

// Add register to the first AuthProvider and remove duplicate AuthContext/AuthProvider
  const register = async (email: string, password: string, role: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password_hash: password, role }),
    });

    

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}