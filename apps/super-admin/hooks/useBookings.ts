"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { bookingService } from "@/services/booking.service";
import {
  BookingRecord,
  BookingStats,
  BookingFilters,
  BookingPagination,
  BookingStatus,
  PaymentStatus,
} from "@/types/booking.types";

const DEFAULT_PAGINATION: BookingPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

interface BookingsCacheEntry {
  bookings: BookingRecord[];
  pagination: BookingPagination;
  timestamp: number;
}

const CACHE_TTL_MS = 45_000;
const bookingsCache = new Map<string, BookingsCacheEntry>();
let statsCache: { data: BookingStats; timestamp: number } | null = null;
let specialListsCache: {
  upcomingCheckIns: BookingRecord[];
  upcomingCheckOuts: BookingRecord[];
  overdueBookings: BookingRecord[];
  timestamp: number;
} | null = null;

function getFiltersCacheKey(filters: BookingFilters): string {
  return JSON.stringify({
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    search: filters.search || "",
    status: filters.status || "",
    paymentStatus: filters.paymentStatus || "",
    bookingType: filters.bookingType || "",
    checkInFrom: filters.checkInFrom || "",
    checkInTo: filters.checkInTo || "",
    overdueOnly: filters.overdueOnly ?? false,
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "DESC",
  });
}

function invalidateBookingsCache() {
  bookingsCache.clear();
  statsCache = null;
  specialListsCache = null;
}

export function useBookings(filters: BookingFilters = {}) {
  const cacheKey = getFiltersCacheKey(filters);
  const initialCached = bookingsCache.get(cacheKey);

  const [bookings, setBookings] = useState<BookingRecord[]>(
    initialCached?.bookings ?? [],
  );
  const [pagination, setPagination] = useState<BookingPagination>(
    initialCached?.pagination ?? DEFAULT_PAGINATION,
  );
  const [loading, setLoading] = useState(!initialCached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<BookingStats | null>(
    statsCache?.data ?? null,
  );
  const [upcomingCheckIns, setUpcomingCheckIns] = useState<BookingRecord[]>(
    specialListsCache?.upcomingCheckIns ?? [],
  );
  const [upcomingCheckOuts, setUpcomingCheckOuts] = useState<BookingRecord[]>(
    specialListsCache?.upcomingCheckOuts ?? [],
  );
  const [overdueBookings, setOverdueBookings] = useState<BookingRecord[]>(
    specialListsCache?.overdueBookings ?? [],
  );

  const requestIdRef = useRef(0);

  const fetchBookings = useCallback(
    async (force = false) => {
      const currentReqId = ++requestIdRef.current;
      const cached = bookingsCache.get(cacheKey);
      const now = Date.now();

      if (cached) {
        setBookings(cached.bookings);
        setPagination(cached.pagination);
        setLoading(false);
        if (!force && now - cached.timestamp < CACHE_TTL_MS) {
          return;
        }
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError(null);
        const response = await bookingService.getBookings(filters);
        if (currentReqId !== requestIdRef.current) return;

        const nextBookings = response?.bookings || [];
        const nextPagination = response?.pagination || DEFAULT_PAGINATION;
        bookingsCache.set(cacheKey, {
          bookings: nextBookings,
          pagination: nextPagination,
          timestamp: Date.now(),
        });
        setBookings(nextBookings);
        setPagination(nextPagination);
      } catch (err) {
        if (currentReqId !== requestIdRef.current) return;
        setError(
          err instanceof Error ? err.message : "Failed to fetch bookings",
        );
      } finally {
        if (currentReqId === requestIdRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey],
  );

  const fetchStats = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && statsCache && now - statsCache.timestamp < CACHE_TTL_MS) {
      setStats(statsCache.data);
      return;
    }
    try {
      const data = await bookingService.getBookingStats();
      statsCache = { data, timestamp: Date.now() };
      setStats(data);
    } catch {
      // Keep previous stats on background refresh failure
    }
  }, []);

  const fetchSpecialLists = useCallback(async (force = false, days = 7) => {
    const now = Date.now();
    if (
      !force &&
      specialListsCache &&
      now - specialListsCache.timestamp < CACHE_TTL_MS
    ) {
      setUpcomingCheckIns(specialListsCache.upcomingCheckIns);
      setUpcomingCheckOuts(specialListsCache.upcomingCheckOuts);
      setOverdueBookings(specialListsCache.overdueBookings);
      return;
    }

    try {
      const [checkIns, checkOuts, overdue] = await Promise.all([
        bookingService.getUpcomingCheckIns(days),
        bookingService.getUpcomingCheckOuts(days),
        bookingService.getOverdueBookings(),
      ]);
      specialListsCache = {
        upcomingCheckIns: checkIns || [],
        upcomingCheckOuts: checkOuts || [],
        overdueBookings: overdue || [],
        timestamp: Date.now(),
      };
      setUpcomingCheckIns(specialListsCache.upcomingCheckIns);
      setUpcomingCheckOuts(specialListsCache.upcomingCheckOuts);
      setOverdueBookings(specialListsCache.overdueBookings);
    } catch {
      // Non-critical lists fail silently
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchStats();
    fetchSpecialLists();
  }, [fetchStats, fetchSpecialLists]);

  const refetch = useCallback(async () => {
    invalidateBookingsCache();
    await Promise.all([
      fetchBookings(true),
      fetchStats(true),
      fetchSpecialLists(true),
    ]);
  }, [fetchBookings, fetchStats, fetchSpecialLists]);

  const updateStatus = async (
    id: string,
    status: BookingStatus,
    notes?: string,
  ): Promise<BookingRecord | null> => {
    const prevBookings = bookings;
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
    try {
      setError(null);
      const updated = await bookingService.updateBookingStatus(
        id,
        status,
        notes,
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updated } : b)),
      );
      invalidateBookingsCache();
      fetchStats(true);
      fetchSpecialLists(true);
      return updated;
    } catch (err) {
      setBookings(prevBookings);
      setError(
        err instanceof Error ? err.message : "Failed to update booking status",
      );
      return null;
    }
  };

  const updatePaymentStatus = async (
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<BookingRecord | null> => {
    const prevBookings = bookings;
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paymentStatus } : b)),
    );
    try {
      setError(null);
      const updated = await bookingService.updatePaymentStatus(
        id,
        paymentStatus,
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updated } : b)),
      );
      invalidateBookingsCache();
      fetchStats(true);
      fetchSpecialLists(true);
      return updated;
    } catch (err) {
      setBookings(prevBookings);
      setError(
        err instanceof Error ? err.message : "Failed to update payment status",
      );
      return null;
    }
  };

  const addPayment = async (
    id: string,
    data: {
      amount: number;
      paymentMethod: string;
      transactionRef: string;
      notes?: string;
    },
  ) => {
    try {
      setError(null);
      const result = await bookingService.addPayment(id, data);
      await refetch();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment");
      return null;
    }
  };

  const exportBookings = async (
    exportFilters?: BookingFilters,
  ): Promise<string | null> => {
    try {
      setError(null);
      return await bookingService.exportBookings(exportFilters);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export bookings",
      );
      return null;
    }
  };

  const getBookingDetails = async (
    id: string,
  ): Promise<BookingRecord | null> => {
    try {
      setError(null);
      return await bookingService.getBookingById(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch booking details",
      );
      return null;
    }
  };

  return {
    bookings,
    pagination,
    loading,
    isRefreshing,
    error,
    stats,
    upcomingCheckIns,
    upcomingCheckOuts,
    overdueBookings,
    refetch,
    updateStatus,
    updatePaymentStatus,
    addPayment,
    exportBookings,
    getBookingDetails,
  };
}
