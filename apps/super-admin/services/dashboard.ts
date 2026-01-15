import { BookingsOverview, DashboardStats, HostelsOverview, RecentActivity, RevenueOverview, UsersOverview } from '@/types/dashboard';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request(config);
      return response.data;
    } catch (error: any) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<DashboardStats>({
      method: 'GET',
      url: '/admin/dashboard/stats',
    });
  }

  async getRecentActivities(limit?: number) {
    return this.request<RecentActivity[]>({
      method: 'GET',
      url: '/admin/dashboard/recent-activities',
      params: { limit },
    });
  }

  async getUsersOverview() {
    return this.request<UsersOverview>({
      method: 'GET',
      url: '/admin/dashboard/users/overview',
    });
  }

  async getBookingsOverview() {
    return this.request<BookingsOverview>({
      method: 'GET',
      url: '/admin/dashboard/bookings/overview',
    });
  }

  async getHostelsOverview() {
    return this.request<HostelsOverview>({
      method: 'GET',
      url: '/admin/dashboard/hostels/overview',
    });
  }

  async getRevenueOverview(period?: 'daily' | 'weekly' | 'monthly') {
    return this.request<RevenueOverview>({
      method: 'GET',
      url: '/admin/dashboard/revenue/overview',
      params: { period },
    });
  }
}

export const apiService = new ApiService();