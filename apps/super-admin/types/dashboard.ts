export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalHostels: number;
  verifiedHostels: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  revenueThisMonth: number;
  pendingPayments: number;
  completedPayments: number;
  userGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: "user" | "booking" | "hostel" | "payment";
  action: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, unknown>;
}

export interface UsersOverview {
  total: number;
  weekly: number;
  monthly: number;
  growth: number;
  byRole: Record<string, number>;
}

export interface BookingsOverview {
  total: number;
  monthly: number;
  growth: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export interface HostelsOverview {
  total: number;
  verified: number;
  acceptingBookings: number;
  verificationRate: number;
  byVerificationStatus: Record<string, number>;
  byBookingStatus: Record<string, number>;
}

export interface RevenueOverview {
  total: number;
  previous: number;
  growth: number;
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
  period: "daily" | "weekly" | "monthly";
}

export interface TimeseriesPoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  bookings: number;
  users: number;
}

export interface AnalyticsTimeseries {
  days: number;
  startDate: string;
  endDate: string;
  series: TimeseriesPoint[];
  totals: {
    revenue: number;
    bookings: number;
    users: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
