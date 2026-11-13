"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { userService } from "@/services/user.service";
import {
  User,
  UserFilters,
  UserStats,
  UserPagination,
  CreateUserData,
  UpdateUserData,
  UserRole,
  UserStatus,
} from "@/types/user.types";

interface UsersCacheEntry {
  users: User[];
  pagination: UserPagination;
  timestamp: number;
}

const CACHE_TTL_MS = 45_000;
const usersCache = new Map<string, UsersCacheEntry>();
let statsCache: { data: UserStats; timestamp: number } | null = null;

function getFiltersCacheKey(filters: UserFilters): string {
  return JSON.stringify({
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    search: filters.search || "",
    role: filters.role || "",
    status: filters.status || "",
    is_verified: filters.is_verified ?? "",
    school_id: filters.school_id || "",
    sortBy: filters.sortBy || "created_at",
    sortOrder: filters.sortOrder || "DESC",
  });
}

function invalidateUsersCache() {
  usersCache.clear();
  statsCache = null;
}

export function useUsers(filters: UserFilters = {}) {
  const cacheKey = getFiltersCacheKey(filters);
  const initialCached = usersCache.get(cacheKey);

  const [users, setUsers] = useState<User[]>(initialCached?.users ?? []);
  const [stats, setStats] = useState<UserStats | null>(
    statsCache?.data ?? null,
  );
  const [pagination, setPagination] = useState<UserPagination>(
    initialCached?.pagination ?? {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      total: 0,
      totalPages: 0,
    },
  );
  const [loading, setLoading] = useState(!initialCached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchUsers = useCallback(
    async (force = false) => {
      const currentRequestId = ++requestIdRef.current;
      const cached = usersCache.get(cacheKey);
      const now = Date.now();

      if (cached) {
        setUsers(cached.users);
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
        const response = await userService.getUsers(filters);
        if (currentRequestId !== requestIdRef.current) return;

        usersCache.set(cacheKey, {
          users: response.users,
          pagination: response.pagination,
          timestamp: Date.now(),
        });
        setUsers(response.users);
        setPagination(response.pagination);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to fetch users";
        setError(message);
      } finally {
        if (currentRequestId === requestIdRef.current) {
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
      const statsData = await userService.getUserStats();
      statsCache = { data: statsData, timestamp: Date.now() };
      setStats(statsData);
    } catch {
      // Keep previous stats if background refresh fails
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    invalidateUsersCache();
    await Promise.all([fetchUsers(true), fetchStats(true)]);
  }, [fetchUsers, fetchStats]);

  const createUser = async (data: CreateUserData): Promise<User | null> => {
    try {
      setError(null);
      const newUser = await userService.createUser(data);
      invalidateUsersCache();
      await Promise.all([fetchUsers(true), fetchStats(true)]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
      return null;
    }
  };

  const updateUser = async (
    id: string,
    data: UpdateUserData,
  ): Promise<User | null> => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(id, data);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
      );
      invalidateUsersCache();
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      return null;
    }
  };

  const updateUserStatus = async (
    id: string,
    status: UserStatus,
  ): Promise<User | null> => {
    const previous = users;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status,
              is_verified: status === "verified" ? true : u.is_verified,
            }
          : u,
      ),
    );
    try {
      setError(null);
      const updatedUser = await userService.updateUserStatus(id, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
      );
      invalidateUsersCache();
      fetchStats(true);
      return updatedUser;
    } catch (err) {
      setUsers(previous);
      setError(
        err instanceof Error ? err.message : "Failed to update user status",
      );
      return null;
    }
  };

  const verifyUser = async (id: string): Promise<User | null> => {
    const previous = users;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              is_verified: true,
              status: "verified",
              verified_at: new Date().toISOString(),
            }
          : u,
      ),
    );
    try {
      setError(null);
      const updatedUser = await userService.verifyUser(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
      );
      invalidateUsersCache();
      fetchStats(true);
      return updatedUser;
    } catch (err) {
      setUsers(previous);
      setError(err instanceof Error ? err.message : "Failed to verify user");
      return null;
    }
  };

  const updateUserRole = async (
    id: string,
    role: UserRole,
  ): Promise<User | null> => {
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      setError(null);
      const updatedUser = await userService.updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
      );
      invalidateUsersCache();
      fetchStats(true);
      return updatedUser;
    } catch (err) {
      setUsers(previous);
      setError(
        err instanceof Error ? err.message : "Failed to update user role",
      );
      return null;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const previous = users;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      setError(null);
      await userService.deleteUser(id);
      invalidateUsersCache();
      fetchStats(true);
      return true;
    } catch (err) {
      setUsers(previous);
      setError(err instanceof Error ? err.message : "Failed to delete user");
      return false;
    }
  };

  const sendVerificationEmail = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await userService.sendVerificationEmail(id);
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification email",
      );
      return false;
    }
  };

  const bulkVerifyUsers = async (
    userIds: string[],
  ): Promise<{ verified: number; failed: string[] }> => {
    try {
      setError(null);
      const result = await userService.bulkVerifyUsers(userIds);
      await refetch();
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk verify users",
      );
      return { verified: 0, failed: userIds };
    }
  };

  const bulkDeleteUsers = async (
    userIds: string[],
  ): Promise<{ deleted: number; failed: string[] }> => {
    try {
      setError(null);
      const result = await userService.bulkDeleteUsers(userIds);
      await refetch();
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk delete users",
      );
      return { deleted: 0, failed: userIds };
    }
  };

  const exportUsers = async (
    exportFilters?: UserFilters,
  ): Promise<string | null> => {
    try {
      setError(null);
      return await userService.exportUsers(exportFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export users");
      return null;
    }
  };

  return {
    users,
    stats,
    pagination,
    loading,
    isRefreshing,
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
