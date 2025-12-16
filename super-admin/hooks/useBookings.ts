'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '@/services/booking.service';
import {
  BookingRecord,
  BookingStats,
  BookingFilters,
  BookingType,
  BookingStatus,
  PaymentStatus,
} from '@/types/booking.types';

interface UseBookingsReturn {
  // Bookings
  bookings: BookingRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  
  // Stats
  stats: BookingStats | null;
  
  // Special Lists
  upcomingCheckIns: BookingRecord[];
  upcomingCheckOuts: BookingRecord[];
  overdueBookings: BookingRecord[];
  
  // Methods
  refetch: (filters?: BookingFilters) => Promise<void>;
  refetchStats: () => Promise<void>;
  refetchUpcoming: (days?: number) => Promise<void>;
  refetchOverdue: () => Promise<void>;
  
  // Actions
  updateStatus: (id: string, status: BookingStatus, notes?: string) => Promise<BookingRecord | null>;
  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus) => Promise<BookingRecord | null>;
  addPayment: (id: string, data: any) => Promise<any | null>;
  exportBookings: (filters?: BookingFilters) => Promise<string | null>;
  getBookingDetails: (id: string) => Promise<BookingRecord | null>;
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function useBookings(initialFilters?: BookingFilters): UseBookingsReturn {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [upcomingCheckIns, setUpcomingCheckIns] = useState<BookingRecord[]>([]);
  const [upcomingCheckOuts, setUpcomingCheckOuts] = useState<BookingRecord[]>([]);
  const [overdueBookings, setOverdueBookings] = useState<BookingRecord[]>([]);

  const fetchBookings = useCallback(async (filters?: BookingFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getBookings(filters);
      setBookings(response?.bookings || []);
      setPagination(response?.pagination || DEFAULT_PAGINATION);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await bookingService.getBookingStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching booking stats:', err);
    }
  }, []);

  const fetchUpcoming = useCallback(async (days: number = 7) => {
    try {
      const [checkIns, checkOuts] = await Promise.all([
        bookingService.getUpcomingCheckIns(days),
        bookingService.getUpcomingCheckOuts(days),
      ]);
      setUpcomingCheckIns(checkIns || []);
      setUpcomingCheckOuts(checkOuts || []);
    } catch (err) {
      console.error('Error fetching upcoming bookings:', err);
    }
  }, []);

  const fetchOverdue = useCallback(async () => {
    try {
      const data = await bookingService.getOverdueBookings();
      setOverdueBookings(data || []);
    } catch (err) {
      console.error('Error fetching overdue bookings:', err);
    }
  }, []);

  const refetch = useCallback(async (filters?: BookingFilters) => {
    await fetchBookings(filters);
  }, [fetchBookings]);

  const refetchStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const refetchUpcoming = useCallback(async (days?: number) => {
    await fetchUpcoming(days);
  }, [fetchUpcoming]);

  const refetchOverdue = useCallback(async () => {
    await fetchOverdue();
  }, [fetchOverdue]);

  // Initial fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchBookings(initialFilters),
        fetchStats(),
        fetchUpcoming(),
        fetchOverdue(),
      ]);
    };
    
    fetchInitialData();
  }, [fetchBookings, fetchStats, fetchUpcoming, fetchOverdue, initialFilters]);

  const updateStatus = async (
    id: string,
    status: BookingStatus,
    notes?: string
  ): Promise<BookingRecord | null> => {
    try {
      setError(null);
      const booking = await bookingService.updateBookingStatus(id, status, notes);
      await Promise.all([
        refetch(),
        refetchStats(),
        refetchUpcoming(),
        refetchOverdue(),
      ]);
      return booking;
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
      return null;
    }
  };

  const updatePaymentStatus = async (
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<BookingRecord | null> => {
    try {
      setError(null);
      const booking = await bookingService.updatePaymentStatus(id, paymentStatus);
      await Promise.all([refetch(), refetchStats(), refetchOverdue()]);
      return booking;
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
      return null;
    }
  };

  const addPayment = async (
    id: string,
    data: any
  ): Promise<any | null> => {
    try {
      setError(null);
      const result = await bookingService.addPayment(id, data);
      await Promise.all([refetch(), refetchStats(), refetchOverdue()]);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to add payment');
      return null;
    }
  };


const exportBookings = async (filters?: BookingFilters): Promise<string | null> => {
  try {
    setError(null);
    const blob = await bookingService.exportBookings(filters);
    return URL.createObjectURL(blob);
  } catch (err: any) {
    setError(err.message || 'Failed to export bookings');
    return null;
  }
};

  const getBookingDetails = async (id: string): Promise<BookingRecord | null> => {
    try {
      setError(null);
      const booking = await bookingService.getBookingById(id);
      return booking;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking details');
      return null;
    }
  };

  return {
    bookings,
    pagination,
    loading,
    error,
    stats,
    upcomingCheckIns,
    upcomingCheckOuts,
    overdueBookings,
    refetch,
    refetchStats,
    refetchUpcoming,
    refetchOverdue,
    updateStatus,
    updatePaymentStatus,
    addPayment,
    exportBookings,
    getBookingDetails,
  };
}