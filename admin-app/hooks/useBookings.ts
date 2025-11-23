import { useState, useCallback } from 'react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface BookingFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  hostelId?: string;
  checkInFrom?: string;
  checkInTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  noShow?: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  bookingFeeRevenue?: number;
  occupancyRate: number;
  byBookingType?: Record<string, number>;
  byPaymentStatus?: Record<string, number>;
  averageStayDuration?: number;
}

interface BookingResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

const DEFAULT_STATS: BookingStats = {
  total: 0,
  pending: 0,
  confirmed: 0,
  checkedIn: 0,
  checkedOut: 0,
  cancelled: 0,
  noShow: 0,
  totalRevenue: 0,
  paidRevenue: 0,
  pendingRevenue: 0,
  bookingFeeRevenue: 0,
  occupancyRate: 0,
  averageStayDuration: 0,
};

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [stats, setStats] = useState<BookingStats>(DEFAULT_STATS);

  const getAuthToken = () => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

  const makeApiRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const fetchBookings = useCallback(
    async (filters: BookingFilters = {}): Promise<BookingResponse> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            params.append(key, value.toString());
          }
        });

        const data = await makeApiRequest(`/bookings?${params.toString()}`);

        setBookings(data.bookings || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
        setError(errorMessage);
        console.error('Error fetching bookings:', err);
        return { bookings: [], pagination: { page: 1, totalPages: 1, total: 0, limit: 20 } };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Unified stats fetching function - properly handles hostelId
  const fetchStats = useCallback(async (hostelId?: string): Promise<BookingStats> => {
    try {
      console.log('📊 Fetching stats for hostel:', hostelId);

      const url = hostelId
        ? `/bookings/statistics?hostelId=${hostelId}`
        : '/bookings/statistics';

      const data = await makeApiRequest(url);

      console.log('✅ Stats fetched:', data);

      // Merge with defaults to ensure all fields exist
      const mergedStats: BookingStats = {
        ...DEFAULT_STATS,
        ...data,
      };

      setStats(mergedStats);
      return mergedStats;
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err);
      // Return default stats instead of throwing
      setStats(DEFAULT_STATS);
      return DEFAULT_STATS;
    }
  }, []);

  const createBooking = useCallback(
    async (bookingData: any): Promise<Booking> => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const data = await makeApiRequest(`/bookings/admin-create`, {
          method: 'POST',
          body: JSON.stringify(bookingData),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        return data.booking || data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateBooking = useCallback(async (bookingId: string, updateData: any): Promise<Booking> => {
    setLoading(true);
    try {
      const data = await makeApiRequest(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      setBookings(prev => prev.map(booking => (booking.id === bookingId ? data : booking)));

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmBooking = useCallback(
    async (bookingId: string, confirmData: { notes?: string }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/confirm`, {
          method: 'PATCH',
          body: JSON.stringify(confirmData),
        });

        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: BookingStatus.CONFIRMED, confirmedAt: new Date().toISOString() }
              : booking
          )
        );

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to confirm booking';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelBooking = useCallback(
    async (bookingId: string, cancelData: { reason: string; notes?: string }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/cancel`, {
          method: 'PATCH',
          body: JSON.stringify(cancelData),
        });

        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: BookingStatus.CANCELLED, cancelledAt: new Date().toISOString() }
              : booking
          )
        );

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBookingById = useCallback(async (bookingId: string): Promise<Booking> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.statusText}`);
      }

      const booking = await response.json();
      return booking;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw error;
    }
  }, []);

  const checkInBooking = useCallback(
    async (bookingId: string, checkInData: { notes?: string; [key: string]: unknown }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/checkin`, {
          method: 'PATCH',
          body: JSON.stringify(checkInData),
        });

        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: BookingStatus.CHECKED_IN, checkedInAt: new Date().toISOString() }
              : booking
          )
        );

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check in booking';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkOutBooking = useCallback(
    async (bookingId: string, checkOutData: { notes?: string; [key: string]: unknown }): Promise<Booking> => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const data = await makeApiRequest(`/bookings/${bookingId}/checkout`, {
          method: 'PATCH',
          body: JSON.stringify(checkOutData),
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: BookingStatus.CHECKED_OUT, checkedOutAt: new Date().toISOString() }
              : booking
          )
        );

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check out booking';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const extendBooking = useCallback(
    async (bookingId: string, extendData: { newCheckOutDate: string; reason?: string }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/extend`, {
          method: 'PATCH',
          body: JSON.stringify(extendData),
        });

        setBookings(prev => prev.map(booking => (booking.id === bookingId ? data : booking)));

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to extend booking';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteBooking = useCallback(async (bookingId: string): Promise<void> => {
    setLoading(true);
    try {
      await makeApiRequest(`/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBookings = useCallback(
    async (searchTerm: string, filters: BookingFilters = {}): Promise<Booking[]> => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('q', searchTerm);

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            params.append(key, value.toString());
          }
        });

        const data = await makeApiRequest(`/bookings/search?${params.toString()}`);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search bookings';
        setError(errorMessage);
        console.error('Error searching bookings:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateReport = useCallback(
    async (reportFilters: {
      hostelId?: string;
      startDate?: string;
      endDate?: string;
      reportType?: 'bookings' | 'revenue' | 'occupancy' | 'payments';
    }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        Object.entries(reportFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        const data = await makeApiRequest(`/bookings/reports?${params.toString()}`);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateBookingInList = useCallback((updatedBooking: Booking) => {
    setBookings(prev => prev.map(booking => (booking.id === updatedBooking.id ? updatedBooking : booking)));
  }, []);

  return {
    // State
    bookings,
    loading,
    error,
    pagination,
    stats,

    // Actions
    fetchBookings,
    fetchStats, // Single unified function
    createBooking,
    updateBooking,
    confirmBooking,
    cancelBooking,
    checkInBooking,
    checkOutBooking,
    extendBooking,
    deleteBooking,
    searchBookings,
    generateReport,
    getBookingById,
    updateBookingInList,

    // Utilities
    setError,
  };
};