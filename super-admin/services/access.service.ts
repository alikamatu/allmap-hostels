import {
  AccessRecord,
  AccessStats,
  AccessFilters,
  AccessResponse,
  PreviewUsageRecord,
  PreviewUsageStats,
  RevenueStats,
  AccessPagination,
} from '@/types/access.types';


const apiService = {
    async request<T>(options: {
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      url: string;
      params?: any;
      headers?: any;
    }): Promise<T> {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:1000' + options.url  , {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        body: options.params && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')
          ? JSON.stringify(options.params)
          : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'API request failed');
      }

      if (response.status === 204) {
        // No Content
        return {} as T;
      }

      return response.json() as Promise<T>;
    },
    async requestNoBody<T>(options: {
        method: 'GET' | 'DELETE';
        url: string;
        params?: any;
        headers?: any;
    }): Promise<T> {
        let fullUrl = 'http://localhost:1000' + options.url;
        if (options.params) {
            const queryString = new URLSearchParams(options.params).toString();
            fullUrl += `?${queryString}`;
        }

        const response = await fetch(fullUrl, {
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'API request failed');
        }

        if (response.status === 204) {
            // No Content
            return {} as T;
        }

        return response.json() as Promise<T>;
    },
    async requestNoContent<T>(options: {
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        url: string;
        params?: any;
        headers?: any;
    }): Promise<T> {
        const response = await fetch(options.url, {
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.params ? JSON.stringify(options.params) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'API request failed');
        }

        if (response.status === 204) {
            // No Content
            return {} as T;
        }

        return response.json() as Promise<T>;
    },
};

class AccessService {
  async getAccessRecords(filters?: AccessFilters): Promise<AccessResponse> {
    return apiService.request<AccessResponse>({
      method: 'GET',
      url: '/admin/access',
      params: filters,
    });
  }

  async getAccessStats(): Promise<AccessStats> {
    return apiService.request<AccessStats>({
      method: 'GET',
      url: '/admin/access/stats',
    });
  }

  async getPreviewUsage(page?: number, limit?: number): Promise<{
    records: PreviewUsageRecord[];
    pagination: AccessPagination;
  }> {
    return apiService.request({
      method: 'GET',
      url: '/admin/access/preview-usage',
      params: { page, limit },
    });
  }

  async getPreviewUsageStats(): Promise<PreviewUsageStats> {
    return apiService.request<PreviewUsageStats>({
      method: 'GET',
      url: '/admin/access/preview-usage/stats',
    });
  }

  async getUserAccessHistory(userId: string): Promise<{
    accessHistory: AccessRecord[];
    previewHistory: PreviewUsageRecord[];
    currentAccess?: AccessRecord;
    hasActiveAccess: boolean;
  }> {
    return apiService.request({
      method: 'GET',
      url: `/admin/access/user/${userId}`,
    });
  }

  async getRevenueStats(period?: 'daily' | 'weekly' | 'monthly'): Promise<RevenueStats> {
    return apiService.request<RevenueStats>({
      method: 'GET',
      url: '/admin/access/revenue',
      params: { period },
    });
  }

  async grantManualAccess(
    userId: string,
    days: number = 30,
    source: string = 'manual_grant',
  ): Promise<AccessRecord> {
    return apiService.request<AccessRecord>({
      method: 'POST',
      url: `/admin/access/grant/${userId}`,
      params: { days, source },
    });
  }

  async extendAccess(id: string, days: number = 30): Promise<AccessRecord> {
    return apiService.request<AccessRecord>({
      method: 'PATCH',
      url: `/admin/access/extend/${id}`,
      params: { days },
    });
  }

  async revokeAccess(id: string): Promise<{ message: string }> {
    return apiService.request<{ message: string }>({
      method: 'DELETE',
      url: `/admin/access/${id}`,
    });
  }

  async exportAccessRecords(
    search?: string,
    source?: string,
    status?: 'active' | 'expired' | 'upcoming',
  ): Promise<string> {
    return apiService.request<string>({
      method: 'GET',
      url: '/admin/access/export',
      params: { search, source, status },
      headers: {
        'Accept': 'text/csv',
      },
    });
  }
}

export const accessService = new AccessService();