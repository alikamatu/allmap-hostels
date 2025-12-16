import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/dashboard';
import { RecentActivity } from '@/types/dashboard';

interface UseRecentActivitiesReturn {
  activities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecentActivities(limit?: number): UseRecentActivitiesReturn {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getRecentActivities(limit);
      setActivities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recent activities');
      console.error('Error fetching recent activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, isLoading, error, refetch: fetchActivities };
}