export interface User {
  id: string;
  email: string;
  name: string;
  gender?: string;
  is_verified: boolean;
  phone: string;
  terms_accepted: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
  role?: string;
}

export type AuthTab = 'login' | 'signup';
export type ResetStatus = 'idle' | 'loading' | 'success' | 'error';