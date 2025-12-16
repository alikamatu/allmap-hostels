import {
  BookingRecord,
  BookingStats,
  BookingFilters,
  BookingPagination,
} from '@/types/booking.types';

const apiService = {
  async request<T>(options: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    url: string;
    params?: any;
    headers?: any;
  }): Promise<T> {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:1000' + options.url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: options.params && (options.method === 'POST' || options.method === 'PATCH')
        ? JSON.stringify(options.params)
        : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'API request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  async requestWithParams<T>(options: {
    method: 'GET' | 'DELETE';
    url: string;
    params?: any;
    headers?: any;
  }): Promise<T> {
    const token = localStorage.getItem('access_token');
    let fullUrl = 'http://localhost:1000' + options.url;
    
    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      fullUrl += `?${queryString}`;
    }

    const response = await fetch(fullUrl, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'API request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },
};

class BookingService {
  async getBookings(filters?: BookingFilters): Promise<{
    bookings: BookingRecord[];
    pagination: BookingPagination;
  }> {
    return apiService.requestWithParams<{
      bookings: BookingRecord[];
      pagination: BookingPagination;
    }>({
      method: 'GET',
      url: '/admin/bookings',
      params: filters,
    });
  }

  async getBookingStats(): Promise<BookingStats> {
    return apiService.request<BookingStats>({
      method: 'GET',
      url: '/admin/bookings/stats',
    });
  }

  async getBookingById(id: string): Promise<BookingRecord> {
    return apiService.request<BookingRecord>({
      method: 'GET',
      url: `/admin/bookings/${id}`,
    });
  }

  async getUpcomingCheckIns(days: number = 7): Promise<BookingRecord[]> {
    return apiService.requestWithParams<BookingRecord[]>({
      method: 'GET',
      url: '/admin/bookings/upcoming/checkins',
      params: { days },
    });
  }

  async getUpcomingCheckOuts(days: number = 7): Promise<BookingRecord[]> {
    return apiService.requestWithParams<BookingRecord[]>({
      method: 'GET',
      url: '/admin/bookings/upcoming/checkouts',
      params: { days },
    });
  }

  async getOverdueBookings(): Promise<BookingRecord[]> {
    return apiService.request<BookingRecord[]>({
      method: 'GET',
      url: '/admin/bookings/overdue',
    });
  }

  async updateBookingStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<BookingRecord> {
    return apiService.request<BookingRecord>({
      method: 'PATCH',
      url: `/admin/bookings/${id}/status`,
      params: { status, notes },
    });
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: string
  ): Promise<BookingRecord> {
    return apiService.request<BookingRecord>({
      method: 'PATCH',
      url: `/admin/bookings/${id}/payment-status`,
      params: { paymentStatus },
    });
  }

  async addPayment(
    id: string,
    data: {
      amount: number;
      paymentMethod: string;
      transactionRef: string;
      notes?: string;
    }
  ): Promise<{ booking: BookingRecord; payment: any }> {
    return apiService.request<{ booking: BookingRecord; payment: any }>({
      method: 'POST',
      url: `/admin/bookings/${id}/payments`,
      params: data,
    });
  }

  async getBookingPayments(id: string): Promise<any[]> {
    return apiService.request<any[]>({
      method: 'GET',
      url: `/admin/bookings/${id}/payments`,
    });
  }

  async exportBookings(filters?: BookingFilters): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    let fullUrl = 'http://localhost:1000' + '/admin/bookings/export/csv';
    
    if (filters) {
      const queryString = new URLSearchParams(filters as any).toString();
      fullUrl += `?${queryString}`;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to export bookings');
    }

    return response.blob();
  }
}

export const bookingService = new BookingService();