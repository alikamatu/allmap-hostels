import { useState, useCallback, useRef } from 'react';
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

const DEFAULT_PAGINATION = { page: 1, totalPages: 1, total: 0, limit: 20 };

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [stats, setStats] = useState<BookingStats>(DEFAULT_STATS);

  // Abort controller so stale fetches don't overwrite newer results
  const fetchAbortRef = useRef<AbortController | null>(null);

  const getAuthToken = () =>
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

  const makeApiRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
      // Cancel any in-flight request for bookings
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            value !== 'all' &&
            typeof value !== 'object'
          ) {
            params.append(key, value.toString());
          }
        });

        const token = getAuthToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setBookings(data.bookings || []);
        setPagination(data.pagination || DEFAULT_PAGINATION);
        return data;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return { bookings: [], pagination: DEFAULT_PAGINATION };
        }
        const message = err instanceof Error ? err.message : 'Failed to fetch bookings';
        setError(message);
        return { bookings: [], pagination: DEFAULT_PAGINATION };
      } finally {
        // Only clear loading if this is still the latest request
        if (fetchAbortRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const fetchStats = useCallback(async (hostelId?: string): Promise<BookingStats> => {
    try {
      const url = hostelId
        ? `/bookings/statistics?hostelId=${hostelId}`
        : '/bookings/statistics';
      const data = await makeApiRequest(url);
      const merged: BookingStats = { ...DEFAULT_STATS, ...data };
      setStats(merged);
      return merged;
    } catch {
      setStats(DEFAULT_STATS);
      return DEFAULT_STATS;
    }
  }, []);

  const createBooking = useCallback(async (bookingData: unknown): Promise<Booking> => {
    setLoading(true);
    try {
      const data = await makeApiRequest('/bookings/admin-create', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      return data.booking || data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (bookingId: string, updateData: unknown): Promise<Booking> => {
    setLoading(true);
    try {
      const data = await makeApiRequest(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      setBookings(prev => prev.map(b => (b.id === bookingId ? data : b)));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmBooking = useCallback(async (bookingId: string, confirmData: { notes?: string }): Promise<Booking> => {
    setLoading(true);
    try {
      const data = await makeApiRequest(`/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        body: JSON.stringify(confirmData),
      });
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: BookingStatus.CONFIRMED, confirmedAt: new Date().toISOString() }
            : b,
        ),
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(
    async (bookingId: string, cancelData: { reason: string; notes?: string }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/cancel`, {
          method: 'PATCH',
          body: JSON.stringify(cancelData),
        });
        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId
              ? { ...b, status: BookingStatus.CANCELLED, cancelledAt: new Date().toISOString() }
              : b,
          ),
        );
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const checkInBooking = useCallback(
    async (bookingId: string, checkInData: { notes?: string; [key: string]: unknown }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/checkin`, {
          method: 'PATCH',
          body: JSON.stringify(checkInData),
        });
        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId
              ? { ...b, status: BookingStatus.CHECKED_IN, checkedInAt: new Date().toISOString() }
              : b,
          ),
        );
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check in booking');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const checkOutBooking = useCallback(
    async (bookingId: string, checkOutData: { notes?: string; [key: string]: unknown }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/checkout`, {
          method: 'PATCH',
          body: JSON.stringify(checkOutData),
        });
        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId
              ? { ...b, status: BookingStatus.CHECKED_OUT, checkedOutAt: new Date().toISOString() }
              : b,
          ),
        );
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check out booking');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const extendBooking = useCallback(
    async (bookingId: string, extendData: { newCheckOutDate: string; reason?: string }): Promise<Booking> => {
      setLoading(true);
      try {
        const data = await makeApiRequest(`/bookings/${bookingId}/extend`, {
          method: 'PATCH',
          body: JSON.stringify(extendData),
        });
        setBookings(prev => prev.map(b => (b.id === bookingId ? data : b)));
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extend booking');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteBooking = useCallback(async (bookingId: string): Promise<void> => {
    setLoading(true);
    try {
      await makeApiRequest(`/bookings/${bookingId}`, { method: 'DELETE' });
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingById = useCallback(async (bookingId: string): Promise<Booking> => {
    return makeApiRequest(`/bookings/${bookingId}`);
  }, []);

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
          if (value != null && value !== '') params.append(key, value.toString());
        });
        return await makeApiRequest(`/bookings/reports?${params.toString()}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate report');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateBookingInList = useCallback((updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => (b.id === updatedBooking.id ? updatedBooking : b)));
  }, []);

  return {
    bookings,
    loading,
    error,
    pagination,
    stats,
    fetchBookings,
    fetchStats,
    createBooking,
    updateBooking,
    confirmBooking,
    cancelBooking,
    checkInBooking,
    checkOutBooking,
    extendBooking,
    deleteBooking,
    getBookingById,
    generateReport,
    updateBookingInList,
    setError,
  };
};
