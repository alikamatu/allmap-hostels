import {
  User,
  UserFilters,
  UserStats,
  UserResponse,
  CreateUserData,
  UpdateUserData,
} from '@/types/user.types';

const apiService = {
  async request<T>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
  }): Promise<T> {
    const { method, url, params, data, headers } = options;

    const token = localStorage.getItem('access_token');
    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token) {
      fetchHeaders['Authorization'] = `Bearer ${token}`;
    }

    let fullUrl = 'http://localhost:1000' + url;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      fullUrl += `?${queryString}`;
    }

    const response = await fetch(fullUrl, {
      method,
      headers: fetchHeaders,
      body: data ? JSON.stringify(data) : undefined,
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

class UserService {
  async getUsers(filters?: UserFilters): Promise<UserResponse> {
    return apiService.request<UserResponse>({
      method: 'GET',
      url: '/admin/users',
      params: filters,
    });
  }

  async getUserStats(): Promise<UserStats> {
    return apiService.request<UserStats>({
      method: 'GET',
      url: '/admin/users/stats',
    });
  }

  async getUserById(id: string): Promise<User> {
    return apiService.request<User>({
      method: 'GET',
      url: `/admin/users/${id}`,
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return apiService.request<User>({
      method: 'POST',
      url: '/admin/users',
      data,
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiService.request<User>({
      method: 'PUT',
      url: `/admin/users/${id}`,
      data,
    });
  }

  async updateUserStatus(id: string, status: 'unverified' | 'pending' | 'verified'): Promise<User> {
    return apiService.request<User>({
      method: 'PATCH',
      url: `/admin/users/${id}/status`,
      data: { status },
    });
  }

  async verifyUser(id: string): Promise<User> {
    return apiService.request<User>({
      method: 'PATCH',
      url: `/admin/users/${id}/verify`,
    });
  }

  async updateUserRole(id: string, role: 'student' | 'hostel_admin' | 'super_admin'): Promise<User> {
    return apiService.request<User>({
      method: 'PATCH',
      url: `/admin/users/${id}/role`,
      data: { role },
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiService.request<{ message: string }>({
      method: 'DELETE',
      url: `/admin/users/${id}`,
    });
  }

  async sendVerificationEmail(id: string): Promise<{ message: string }> {
    return apiService.request<{ message: string }>({
      method: 'POST',
      url: `/admin/users/${id}/send-verification`,
    });
  }

  async bulkVerifyUsers(userIds: string[]): Promise<{ verified: number; failed: string[] }> {
    return apiService.request<{ verified: number; failed: string[] }>({
      method: 'POST',
      url: '/admin/users/bulk-verify',
      data: { userIds },
    });
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ deleted: number; failed: string[] }> {
    return apiService.request<{ deleted: number; failed: string[] }>({
      method: 'POST',
      url: '/admin/users/bulk-delete',
      data: { userIds },
    });
  }

  async exportUsers(filters?: UserFilters): Promise<string> {
    return apiService.request<string>({
      method: 'GET',
      url: '/admin/users/export',
      params: filters,
      headers: {
        'Accept': 'text/csv',
      },
    });
  }
}

export const userService = new UserService();