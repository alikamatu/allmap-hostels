"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/services/dashboard";
import {
  AnalyticsTimeseries,
  BookingsOverview,
  DashboardStats,
  HostelsOverview,
  RecentActivity,
  RevenueOverview,
  UsersOverview,
} from "@/types/dashboard";

export type AnalyticsDays = 7 | 14 | 30 | 90;

interface UseDashboardOverviewReturn {
  stats: DashboardStats | null;
  timeseries: AnalyticsTimeseries | null;
  usersOverview: UsersOverview | null;
  bookingsOverview: BookingsOverview | null;
  hostelsOverview: HostelsOverview | null;
  revenueOverview: RevenueOverview | null;
  activities: RecentActivity[];
  days: AnalyticsDays;
  setDays: (days: AnalyticsDays) => void;
  isLoading: boolean;
  isChartLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardOverview(
  initialDays: AnalyticsDays = 30,
): UseDashboardOverviewReturn {
  const [days, setDaysState] = useState<AnalyticsDays>(initialDays);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeseries | null>(
    null,
  );
  const [usersOverview, setUsersOverview] = useState<UsersOverview | null>(
    null,
  );
  const [bookingsOverview, setBookingsOverview] =
    useState<BookingsOverview | null>(null);
  const [hostelsOverview, setHostelsOverview] =
    useState<HostelsOverview | null>(null);
  const [revenueOverview, setRevenueOverview] =
    useState<RevenueOverview | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  const fetchAll = useCallback(
    async (
      targetDays: AnalyticsDays,
      mode: "initial" | "refresh" = "initial",
    ) => {
      try {
        if (mode === "initial" && !hasLoadedOnce.current) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        const [
          statsRes,
          timeseriesRes,
          usersRes,
          bookingsRes,
          hostelsRes,
          revenueRes,
          activitiesRes,
        ] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getAnalyticsTimeseries(targetDays),
          apiService.getUsersOverview(),
          apiService.getBookingsOverview(),
          apiService.getHostelsOverview(),
          apiService.getRevenueOverview("monthly"),
          apiService.getRecentActivities(10),
        ]);

        setStats(statsRes);
        setTimeseries(timeseriesRes);
        setUsersOverview(usersRes);
        setBookingsOverview(bookingsRes);
        setHostelsOverview(hostelsRes);
        setRevenueOverview(revenueRes);
        setActivities(activitiesRes);
        hasLoadedOnce.current = true;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load dashboard overview";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAll(days, "initial");
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDays = useCallback(async (newDays: AnalyticsDays) => {
    setDaysState(newDays);
    try {
      setIsChartLoading(true);
      const ts = await apiService.getAnalyticsTimeseries(newDays);
      setTimeseries(ts);
    } catch (err: unknown) {
      console.error("Failed to update timeseries range:", err);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchAll(days, "refresh");
  }, [fetchAll, days]);

  return {
    stats,
    timeseries,
    usersOverview,
    bookingsOverview,
    hostelsOverview,
    revenueOverview,
    activities,
    days,
    setDays,
    isLoading,
    isChartLoading,
    isRefreshing,
    error,
    refetch,
  };
}
