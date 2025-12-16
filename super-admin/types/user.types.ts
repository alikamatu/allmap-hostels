export type UserRole = 'student' | 'hostel_admin' | 'super_admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type UserStatus = 'unverified' | 'pending' | 'verified';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: Gender;
  is_verified: boolean;
  status: UserStatus;
  role: UserRole;
  school_id?: string;
  verified_at?: string;
  created_at: string;
  onboarding_completed: boolean;
  terms_accepted: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  emergency_contact_email?: string;
  school?: {
    id: string;
    name: string;
    domain: string;
  };
  stats?: {
    totalBookings?: number;
    activeBookings?: number;
    totalHostels?: number;
  };
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  is_verified?: boolean;
  school_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  students: number;
  hostel_admins: number;
  super_admins: number;
  pending_verification: number;
  with_school: number;
  without_school: number;
  active_today: number;
  growth_30d: number;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserResponse {
  users: User[];
  pagination: UserPagination;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: Gender;
  role: UserRole;
  is_verified?: boolean;
  school_id?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  school_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  emergency_contact_email?: string;
}