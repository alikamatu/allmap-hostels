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

export interface AgentSummary {
  currency: string;
  pendingAmount: number;
  availableAmount: number;
  reservedAmount: number;
  paidAmount: number;
  lifetimeEarned: number;
  counts: Record<string, number>;
  /** Verified payout method on file (set during admin verification approval). */
  verifiedPayoutMethod: 'momo' | 'bank' | null;
  /** Verified payout destination details on file. */
  verifiedPayoutDetails:
    | {
        // momo
        provider?: string;
        phone?: string;
        // bank
        bankName?: string;
        bankCode?: string;
        accountNumber?: string;
        // both
        accountName?: string;
      }
    | null;
}

export interface AgentCommission {
  id: string;
  bookingId: string;
  amount: number | string;
  status: 'pending' | 'available' | 'reserved' | 'paid' | 'voided';
  availableAt: string;
  paidOutAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    studentName: string;
    checkInDate: string;
    hostel: { id: string; name: string };
  };
  payout: { id: string; status: string; paidAt: string | null } | null;
}

export interface AgentPayout {
  id: string;
  amount: number | string;
  method: 'momo' | 'bank';
  destination: Record<string, any>;
  status: 'requested' | 'approved' | 'paid' | 'rejected';
  rejectionReason: string | null;
  transactionRef: string | null;
  paidAt: string | null;
  createdAt: string;
  commissions: { id: string; amount: number | string; bookingId: string }[];
}

export const commissionsApi = {
  summary: () =>
    fetch(`${API_URL}/agent/commissions/summary`, { headers: authHeaders() }).then(handle<AgentSummary>),

  list: () =>
    fetch(`${API_URL}/agent/commissions`, { headers: authHeaders() }).then(handle<AgentCommission[]>),

  payouts: () =>
    fetch(`${API_URL}/agent/commissions/payouts`, { headers: authHeaders() }).then(handle<AgentPayout[]>),

  /**
   * Body fields are optional. When omitted, the backend pulls the verified
   * payout method/destination from the agent's user record.
   */
  requestPayout: (body: {
    method?: 'momo' | 'bank';
    destination?: Record<string, any>;
    notes?: string;
  }) =>
    fetch(`${API_URL}/agent/commissions/payouts/request`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handle<AgentPayout>),
};
