export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  is_verified: boolean;
  status: 'unverified' | 'pending' | 'verified';
  role: 'student' | 'hostel_admin' | 'super_admin';
  school_id?: string;
  verified_at?: string;
  created_at: string;
  school?: {
    id: string;
    name: string;
    domain: string;
    location: string;
  };
}

export interface UserFilters {
  role?: string;
  status?: string;
  is_verified?: boolean;
  school_id?: string;
  search?: string;
}

export interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  students: number;
  hostel_admins: number;
  pending_verification: number;
}