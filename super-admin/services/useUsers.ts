"use client";

import { useState, useEffect } from 'react';
import { User, UserFilters, UserStats } from '@/types/user.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useUsers = (filters?: UserFilters) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.is_verified !== undefined) params.append('is_verified', filters.is_verified.toString());
      if (filters?.school_id) params.append('school_id', filters.school_id);
      if (filters?.search) params.append('search', filters.search);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'verified' | 'unverified' | 'pending') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      await fetchUsers(); // Refresh the data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: 'student' | 'hostel_admin') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      await fetchUsers(); // Refresh the data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers(); // Refresh the data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return {
    users,
    stats,
    loading,
    error,
    refetch: fetchUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
  };
};
