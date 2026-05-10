const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json();
}

export interface PayoutOverview {
  currency: string;
  totalCommissionsEarned: number;
  totalCommissionsPaid: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  payoutsByStatus: { status: string; count: number; amount: number }[];
}

export interface AgentInfo {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  payoutMethod?: 'momo' | 'bank' | null;
  payoutDetails?: Record<string, any> | null;
}

export interface PayoutRow {
  id: string;
  agentId: string;
  amount: number | string;
  method: 'momo' | 'bank';
  destination: Record<string, any>;
  status: 'requested' | 'approved' | 'paid' | 'rejected';
  rejectionReason: string | null;
  transactionRef: string | null;
  paidAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  notes: string | null;
  agent?: AgentInfo | null;
  commissions: {
    id: string;
    amount: number | string;
    booking: { id: string; studentName: string };
  }[];
}

export interface PayoutDetail extends PayoutRow {
  agent: AgentInfo | null;
}

export interface HostelRollupRow {
  hostelId: string;
  hostelName: string;
  hostelAddress: string;
  isVerified: boolean;
  agent: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    payoutMethod: 'momo' | 'bank' | null;
  } | null;
  bookingsThisWeek: number;
  bookingsTotal: number;
  commissions: {
    pending: number;
    available: number;
    reserved: number;
    paid: number;
    voided: number;
  };
  counts: {
    pending: number;
    available: number;
    reserved: number;
    paid: number;
    voided: number;
  };
  totalEarned: number;
}

export interface CommissionRow {
  id: string;
  agentId: string;
  hostelId: string;
  amount: number | string;
  status: 'pending' | 'available' | 'reserved' | 'paid' | 'voided';
  availableAt: string;
  paidOutAt: string | null;
  notes: string | null;
  createdAt: string;
  booking: {
    id: string;
    studentName: string;
    checkInDate: string;
    hostel: { id: string; name: string };
  };
  payout: { id: string; status: string; paidAt: string | null } | null;
  agent: { id: string; name: string | null; email: string } | null;
}

export const payoutsApi = {
  overview: () =>
    fetch(`${API_URL}/admin/payouts/overview`, { headers: authHeaders() }).then(handle<PayoutOverview>),

  list: (filters?: {
    status?: string;
    method?: 'momo' | 'bank';
    minAmount?: number;
    maxAmount?: number;
    from?: string;
    to?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return fetch(`${API_URL}/admin/payouts${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    }).then(handle<PayoutRow[]>);
  },

  bulkApprove: (ids: string[]) =>
    fetch(`${API_URL}/admin/payouts/bulk-approve`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ids }),
    }).then(handle<{ approved: number; requested: number }>),

  bulkMarkPaid: (ids: string[], batchReference: string, notes?: string) =>
    fetch(`${API_URL}/admin/payouts/bulk-mark-paid`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ ids, batchReference, notes }),
    }).then(handle<{ paid: number; requested: number }>),

  get: (id: string) =>
    fetch(`${API_URL}/admin/payouts/${id}`, { headers: authHeaders() }).then(handle<PayoutDetail>),

  approve: (id: string, notes?: string) =>
    fetch(`${API_URL}/admin/payouts/${id}/approve`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ notes }),
    }).then(handle<PayoutRow>),

  reject: (id: string, reason: string) =>
    fetch(`${API_URL}/admin/payouts/${id}/reject`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handle<PayoutRow>),

  markPaid: (id: string, transactionRef: string, notes?: string) =>
    fetch(`${API_URL}/admin/payouts/${id}/mark-paid`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ transactionRef, notes }),
    }).then(handle<PayoutRow>),

  // Per-hostel rollup with weekly bookings and commission breakdown
  byHostel: () =>
    fetch(`${API_URL}/admin/commissions/by-hostel`, { headers: authHeaders() }).then(
      handle<HostelRollupRow[]>,
    ),

  // Commissions ledger (across all agents)
  listCommissions: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return fetch(`${API_URL}/admin/commissions${qs}`, { headers: authHeaders() }).then(
      handle<CommissionRow[]>,
    );
  },

  releaseCommission: (id: string) =>
    fetch(`${API_URL}/admin/commissions/${id}/release`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(handle<CommissionRow>),

  voidCommission: (id: string, reason: string) =>
    fetch(`${API_URL}/admin/commissions/${id}/void`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handle<CommissionRow>),
};
