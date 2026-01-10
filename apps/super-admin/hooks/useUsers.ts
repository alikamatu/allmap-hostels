'use client';

import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/user.service';
import {
  User,
  UserFilters,
  UserStats,
  CreateUserData,
  UpdateUserData,
} from '@/types/user.types';

interface UseUsersReturn {
  users: User[];
  stats: UserStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (data: CreateUserData) => Promise<User | null>;
  updateUser: (id: string, data: UpdateUserData) => Promise<User | null>;
  updateUserStatus: (id: string, status: 'unverified' | 'pending' | 'verified') => Promise<boolean>;
  verifyUser: (id: string) => Promise<boolean>;
  updateUserRole: (id: string, role: 'student' | 'hostel_admin' | 'super_admin') => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  sendVerificationEmail: (id: string) => Promise<boolean>;
  bulkVerifyUsers: (userIds: string[]) => Promise<{ verified: number; failed: string[] }>;
  bulkDeleteUsers: (userIds: string[]) => Promise<{ deleted: number; failed: string[] }>;
  exportUsers: (filters?: UserFilters) => Promise<string | null>;
}

export function useUsers(filters?: UserFilters): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUsers(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await userService.getUserStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
  }, [fetchUsers, fetchStats]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createUser = async (data: CreateUserData): Promise<User | null> => {
    try {
      setError(null);
      const user = await userService.createUser(data);
      await refetch();
      return user;
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      return null;
    }
  };

  const updateUser = async (id: string, data: UpdateUserData): Promise<User | null> => {
    try {
      setError(null);
      const user = await userService.updateUser(id, data);
      await refetch();
      return user;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      return null;
    }
  };

  const updateUserStatus = async (id: string, status: 'unverified' | 'pending' | 'verified'): Promise<boolean> => {
    try {
      setError(null);
      await userService.updateUserStatus(id, status);
      await refetch();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
      return false;
    }
  };

  const verifyUser = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await userService.verifyUser(id);
      await refetch();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to verify user');
      return false;
    }
  };

  const updateUserRole = async (id: string, role: 'student' | 'hostel_admin' | 'super_admin'): Promise<boolean> => {
    try {
      setError(null);
      await userService.updateUserRole(id, role);
      await refetch();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await refetch();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      return false;
    }
  };

  const sendVerificationEmail = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await userService.sendVerificationEmail(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
      return false;
    }
  };

  const bulkVerifyUsers = async (userIds: string[]): Promise<{ verified: number; failed: string[] }> => {
    try {
      setError(null);
      const result = await userService.bulkVerifyUsers(userIds);
      await refetch();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to bulk verify users');
      return { verified: 0, failed: userIds };
    }
  };

  const bulkDeleteUsers = async (userIds: string[]): Promise<{ deleted: number; failed: string[] }> => {
    try {
      setError(null);
      const result = await userService.bulkDeleteUsers(userIds);
      await refetch();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to bulk delete users');
      return { deleted: 0, failed: userIds };
    }
  };

  const exportUsers = async (filters?: UserFilters): Promise<string | null> => {
    try {
      setError(null);
      const csv = await userService.exportUsers(filters);
      return csv;
    } catch (err: any) {
      setError(err.message || 'Failed to export users');
      return null;
    }
  };

  return {
    users,
    stats,
    pagination,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    updateUserStatus,
    verifyUser,
    updateUserRole,
    deleteUser,
    sendVerificationEmail,
    bulkVerifyUsers,
    bulkDeleteUsers,
    exportUsers,
  };
}