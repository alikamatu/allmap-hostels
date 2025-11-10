export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  depositType: 'booking_deposit' | 'room_balance' | 'account_credit';
  paymentReference: string;
  paystackReference?: string;
  transactionId?: string;
  notes?: string;
  paymentDate?: string;
  verifiedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositBalance {
  totalBalance: number;
  availableBalance: number;
  pendingDeposits: number;
  depositBreakdown: {
    completed: number;
    pending: number;
    failed: number;
  };
}

export interface CreateDepositRequest {
  amount: number;
  paymentReference: string;
  notes?: string;
}

export interface VerifyDepositRequest {
  reference: string;
  expectedAmount: number;
}

class DepositService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`Making request to: ${url}`, options);
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Network error:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  async createDeposit(depositData: CreateDepositRequest): Promise<Deposit> {
    return this.makeRequest<Deposit>('/deposits', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async verifyDeposit(verifyData: VerifyDepositRequest): Promise<{ deposit: Deposit; verified: boolean }> {
    return this.makeRequest<{ deposit: Deposit; verified: boolean }>('/deposits/verify', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    });
  }

  async getDepositBalance(): Promise<DepositBalance> {
    return this.makeRequest<DepositBalance>('/deposits/balance');
  }

  async getUserDeposits(): Promise<Deposit[]> {
    return this.makeRequest<Deposit[]>('/deposits');
  }

  async applyDepositToBooking(bookingId: string, amount: number): Promise<any> {
    return this.makeRequest('/deposits/apply-to-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount }),
    });
  }

  // Format currency
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(price);
  }
}

export const depositService = new DepositService();