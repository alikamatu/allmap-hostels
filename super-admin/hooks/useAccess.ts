'use client';

import { useState, useEffect, useCallback } from 'react';
import { accessService } from '@/services/access.service';
import {
  AccessRecord,
  AccessStats,
  AccessFilters,
  PreviewUsageRecord,
  PreviewUsageStats,
  RevenueStats,
} from '@/types/access.types';

interface UseAccessReturn {
  // Access Records
  records: AccessRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  
  // Stats
  stats: AccessStats | null;
  previewStats: PreviewUsageStats | null;
  revenueStats: RevenueStats | null;
  
  // Preview Usage
  previewRecords: PreviewUsageRecord[];
  previewPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Methods
  refetch: (filters?: AccessFilters) => Promise<void>;
  refetchStats: () => Promise<void>;
  refetchPreview: (page?: number, limit?: number) => Promise<void>;
  refetchRevenue: (period?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  
  // Actions
  grantAccess: (userId: string, days?: number, source?: string) => Promise<AccessRecord | null>;
  extendAccess: (id: string, days?: number) => Promise<AccessRecord | null>;
  revokeAccess: (id: string) => Promise<boolean>;
  exportRecords: (filters?: AccessFilters) => Promise<string | null>;
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function useAccess(initialFilters?: AccessFilters): UseAccessReturn {
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<AccessStats | null>(null);
  const [previewStats, setPreviewStats] = useState<PreviewUsageStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);

  const [previewRecords, setPreviewRecords] = useState<PreviewUsageRecord[]>([]);
  const [previewPagination, setPreviewPagination] = useState(DEFAULT_PAGINATION);

  const fetchAccessRecords = useCallback(async (filters?: AccessFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accessService.getAccessRecords(filters);
      setRecords(response?.records || []);
      setPagination(response?.pagination || DEFAULT_PAGINATION);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch access records');
      console.error('Error fetching access records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccessStats = useCallback(async () => {
    try {
      const data = await accessService.getAccessStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching access stats:', err);
    }
  }, []);

  const fetchPreviewStats = useCallback(async () => {
    try {
      const data = await accessService.getPreviewUsageStats();
      setPreviewStats(data);
    } catch (err) {
      console.error('Error fetching preview stats:', err);
    }
  }, []);

  const fetchPreviewRecords = useCallback(async (page?: number, limit?: number) => {
    try {
      const response = await accessService.getPreviewUsage(page, limit);
      setPreviewRecords(response?.records || []);
      setPreviewPagination(response?.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      console.error('Error fetching preview usage:', err);
    }
  }, []);

  const fetchRevenueStats = useCallback(async (period?: 'daily' | 'weekly' | 'monthly') => {
    try {
      const data = await accessService.getRevenueStats(period);
      setRevenueStats(data);
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
    }
  }, []);

  const refetch = useCallback(async (filters?: AccessFilters) => {
    await fetchAccessRecords(filters);
  }, [fetchAccessRecords]);

  const refetchStats = useCallback(async () => {
    await Promise.all([fetchAccessStats(), fetchPreviewStats()]);
  }, [fetchAccessStats, fetchPreviewStats]);

  const refetchPreview = useCallback(async (page?: number, limit?: number) => {
    await fetchPreviewRecords(page, limit);
  }, [fetchPreviewRecords]);

  const refetchRevenue = useCallback(async (period?: 'daily' | 'weekly' | 'monthly') => {
    await fetchRevenueStats(period);
  }, [fetchRevenueStats]);

  // Initial fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchAccessRecords(initialFilters),
        fetchAccessStats(),
        fetchPreviewStats(),
        fetchPreviewRecords(),
        fetchRevenueStats('monthly'),
      ]);
    };
    
    fetchInitialData();
  }, [
    fetchAccessRecords,
    fetchAccessStats,
    fetchPreviewStats,
    fetchPreviewRecords,
    fetchRevenueStats,
    initialFilters,
  ]);

  const grantAccess = async (userId: string, days: number = 30, source: string = 'manual_grant'): Promise<AccessRecord | null> => {
    try {
      setError(null);
      const record = await accessService.grantManualAccess(userId, days, source);
      await Promise.all([refetch(), refetchStats()]);
      return record;
    } catch (err: any) {
      setError(err.message || 'Failed to grant access');
      return null;
    }
  };

  const extendAccess = async (id: string, days: number = 30): Promise<AccessRecord | null> => {
    try {
      setError(null);
      const record = await accessService.extendAccess(id, days);
      await Promise.all([refetch(), refetchStats()]);
      return record;
    } catch (err: any) {
      setError(err.message || 'Failed to extend access');
      return null;
    }
  };

  const revokeAccess = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await accessService.revokeAccess(id);
      await Promise.all([refetch(), refetchStats()]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to revoke access');
      return false;
    }
  };

  const exportRecords = async (filters?: AccessFilters): Promise<string | null> => {
    try {
      setError(null);
      const csv = await accessService.exportAccessRecords(
        filters?.search,
        filters?.source,
        filters?.status,
      );
      return csv;
    } catch (err: any) {
      setError(err.message || 'Failed to export records');
      return null;
    }
  };

  return {
    records,
    pagination,
    loading,
    error,
    stats,
    previewStats,
    revenueStats,
    previewRecords,
    previewPagination,
    refetch,
    refetchStats,
    refetchPreview,
    refetchRevenue,
    grantAccess,
    extendAccess,
    revokeAccess,
    exportRecords,
  };
}