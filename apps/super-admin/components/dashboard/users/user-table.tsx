'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Building,
  GraduationCap,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { User, UserRole, UserStatus } from '@/types/user.types';
import { formatDate } from '@/lib/formatters';

interface UserTableProps {
  users: User[];
  loading: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  selectedUsers: Set<string>;
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
  onPageChange: (page: number) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onVerifyUser: (userId: string) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserTable({
  users = [],
  loading = false,
  pagination,
  selectedUsers = new Set(),
  onSelectAll,
  onSelectUser,
  onPageChange,
  onViewUser,
  onEditUser,
  onVerifyUser,
  onUpdateRole,
  onDeleteUser,
}: UserTableProps) {
  const [expandedUser] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  // Default pagination values
  const defaultPagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  const safePagination = pagination || defaultPagination;

  if (loading) {
    return (
      <div className="bg-white">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00]"></div>
          <p className="mt-2 text-12 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
        <h3 className="text-14 font-medium text-gray-900 mb-1">No users found</h3>
        <p className="text-12 text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return GraduationCap;
      case 'hostel_admin':
        return Building;
      case 'super_admin':
        return Shield;
      default:
        return GraduationCap;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'text-purple-600 bg-purple-50';
      case 'hostel_admin':
        return 'text-orange-600 bg-orange-50';
      case 'super_admin':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: UserStatus, isVerified: boolean) => {
    if (isVerified) {
      return CheckCircle;
    } else if (status === 'pending') {
      return Clock;
    } else {
      return XCircle;
    }
  };

  const getStatusColor = (status: UserStatus, isVerified: boolean) => {
    if (isVerified) {
      return 'text-green-600 bg-green-50';
    } else if (status === 'pending') {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-11 font-medium text-gray-700">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={selectedUsers.size === users.length && users.length > 0}
            onChange={onSelectAll}
            className="h-4 w-4 text-[#ff7a00] focus:ring-[#ff7a00] border-gray-300 rounded"
          />
        </div>
        <div className="col-span-3">User</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Joined</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {users.map((user, index) => {
          const RoleIcon = getRoleIcon(user.role);
          const StatusIcon = getStatusIcon(user.status, user.is_verified);
          const isSelected = selectedUsers.has(user.id);
          const isExpanded = expandedUser === user.id;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
            >
              {/* Main Row */}
              <div className="grid grid-cols-12 gap-4 p-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectUser(user.id)}
                    className="h-4 w-4 text-[#ff7a00] focus:ring-[#ff7a00] border-gray-300 rounded"
                  />
                </div>

                {/* User Info */}
                <div className="col-span-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-11 font-semibold text-gray-700">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-12 font-medium text-gray-900">
                        {user.name || 'Unnamed User'}
                      </div>
                      <div className="text-11 text-gray-500 flex items-center gap-1">
                        <Mail size={10} />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-11 text-gray-500 flex items-center gap-1">
                          <Phone size={10} />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                    <RoleIcon size={12} />
                    <span className="text-11 font-medium capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(user.status, user.is_verified)}`}>
                    <StatusIcon size={12} />
                    <span className="text-11 font-medium capitalize">
                      {user.is_verified ? 'Verified' : user.status}
                    </span>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="col-span-2">
                  <div className="text-11 text-gray-900">
                    {formatDate(user.created_at)}
                  </div>
                  <div className="text-10 text-gray-500">
                    {user.school?.name || 'No school'}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewUser(user)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="View Details"
                    >
                      <Eye size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => onEditUser(user)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Edit"
                    >
                      <Edit size={14} className="text-blue-600" />
                    </button>
                    {!user.is_verified && (
                      <button
                        onClick={() => onVerifyUser(user.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Verify User"
                      >
                        <CheckCircle size={14} className="text-green-600" />
                      </button>
                    )}
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="More Actions"
                      >
                        <MoreVertical size={14} className="text-gray-600" />
                      </button>
                      
                      {actionMenu === user.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-10">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onUpdateRole(user.id, 'student');
                                setActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-11 text-gray-700 hover:bg-gray-100"
                            >
                              <GraduationCap size={12} />
                              Set as Student
                            </button>
                            <button
                              onClick={() => {
                                onUpdateRole(user.id, 'hostel_admin');
                                setActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-11 text-gray-700 hover:bg-gray-100"
                            >
                              <Building size={12} />
                              Set as Hostel Admin
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  onDeleteUser(user.id);
                                }
                                setActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-11 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Stats */}
              {isExpanded && user.stats && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-100 rounded">
                    <div className="text-center">
                      <div className="text-14 font-semibold text-gray-900">
                        {user.stats.totalBookings || 0}
                      </div>
                      <div className="text-11 text-gray-500">Total Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-14 font-semibold text-gray-900">
                        {user.stats.activeBookings || 0}
                      </div>
                      <div className="text-11 text-gray-500">Active Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-14 font-semibold text-gray-900">
                        {user.stats.totalHostels || 0}
                      </div>
                      <div className="text-11 text-gray-500">Hostels Managed</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pagination - Only show if totalPages > 1 */}
      {safePagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="text-11 text-gray-500">
            Showing {((safePagination.page - 1) * safePagination.limit) + 1} to{' '}
            {Math.min(safePagination.page * safePagination.limit, safePagination.total)} of{' '}
            {safePagination.total} users
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(safePagination.page - 1)}
              disabled={safePagination.page === 1}
              className="px-3 py-1 text-11 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, safePagination.totalPages) }, (_, i) => {
              let pageNum;
              if (safePagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (safePagination.page <= 3) {
                pageNum = i + 1;
              } else if (safePagination.page >= safePagination.totalPages - 2) {
                pageNum = safePagination.totalPages - 4 + i;
              } else {
                pageNum = safePagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-11 font-medium ${
                    safePagination.page === pageNum
                      ? 'bg-[#ff7a00] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(safePagination.page + 1)}
              disabled={safePagination.page === safePagination.totalPages}
              className="px-3 py-1 text-11 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}