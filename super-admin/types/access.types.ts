export type AccessSource = 'paystack' | 'manual_grant' | 'free_trial' | string;
export type AccessStatus = 'active' | 'expired' | 'upcoming';

export interface AccessRecord {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  expiresAt: string;
  createdAt: string;
  source: AccessSource;
  paystackReference?: string;
  status: AccessStatus;
  daysRemaining: number;
}

export interface AccessStats {
  totalAccess: number;
  activeAccess: number;
  expiredAccess: number;
  upcomingExpiry: number;
  bySource: Record<string, number>;
  totalRevenue: number;
  estimatedMonthlyRecurringRevenue: number;
  usersWithAccess: number;
  usersWithoutAccess: number;
  conversionRate: number;
}

export interface PreviewUsageRecord {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  usedAt: string;
  source: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PreviewUsageStats {
  totalUses: number;
  bySource: Record<string, number>;
  byDay: Record<string, number>;
  uniqueUsers: number;
}

export interface RevenueStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  bySource: Record<string, number>;
  byMonth: Record<string, number>;
  estimatedMonthlyRecurring: number;
}

export interface AccessFilters {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  status?: AccessStatus;
}

export interface AccessPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AccessResponse {
  records: AccessRecord[];
  pagination: AccessPagination;
}