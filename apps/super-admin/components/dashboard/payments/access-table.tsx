'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  Shield,
  MoreVertical,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import { AccessRecord, AccessStatus } from '@/types/access.types';
import { formatDate } from '@/lib/formatters';

interface AccessTableProps {
  records: AccessRecord[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function AccessTable({
  records,
  loading,
  pagination,
  onPageChange,
}: AccessTableProps) {
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00]"></div>
          <p className="mt-2 text-12 text-gray-500">Loading access records...</p>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
        <h3 className="text-14 font-medium text-gray-900 mb-1">No access records found</h3>
        <p className="text-12 text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  const getStatusColor = (status: AccessStatus, daysRemaining: number) => {
    if (status === 'expired') return 'text-red-600 bg-red-50';
    if (status === 'upcoming') return 'text-yellow-600 bg-yellow-50';
    if (daysRemaining > 7) return 'text-green-600 bg-green-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getStatusIcon = (status: AccessStatus) => {
    if (status === 'expired') return XCircle;
    if (status === 'upcoming') return TrendingDown;
    return CheckCircle;
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('paystack')) return CreditCard;
    if (source.includes('manual')) return Shield;
    return User;
  };

  const getSourceColor = (source: string) => {
    if (source.includes('paystack')) return 'text-green-600 bg-green-50';
    if (source.includes('manual')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-11 font-medium text-gray-700">
        <div className="col-span-3">User</div>
        <div className="col-span-2">Access Type</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Expires</div>
        <div className="col-span-2">Days Left</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {records.map((record, index) => {
          const StatusIcon = getStatusIcon(record.status);
          const SourceIcon = getSourceIcon(record.source);
          const statusColor = getStatusColor(record.status, record.daysRemaining);
          const sourceColor = getSourceColor(record.source);

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="hover:bg-gray-50"
            >
              <div className="grid grid-cols-12 gap-4 p-4 items-center">
                {/* User Info */}
                <div className="col-span-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-11 font-semibold text-gray-700">
                        {record.user.name?.charAt(0) || record.user.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-12 font-medium text-gray-900">
                        {record.user.name || 'Unnamed User'}
                      </div>
                      <div className="text-11 text-gray-500 flex items-center gap-1">
                        <Mail size={10} />
                        {record.user.email}
                      </div>
                      <div className="text-10 text-gray-400 capitalize">
                        {record.user.role.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access Type */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${sourceColor}`}>
                    <SourceIcon size={12} />
                    <span className="text-11 font-medium capitalize">
                      {record.source.replace('_', ' ')}
                    </span>
                  </div>
                  {record.paystackReference && (
                    <div className="text-10 text-gray-500 mt-1 truncate" title={record.paystackReference}>
                      Ref: {record.paystackReference.substring(0, 8)}...
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusColor}`}>
                    <StatusIcon size={12} />
                    <span className="text-11 font-medium capitalize">
                      {record.status}
                    </span>
                  </div>
                </div>

                {/* Expires */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-11 text-gray-900">
                      {formatDate(record.expiresAt)}
                    </span>
                  </div>
                  <div className="text-10 text-gray-500 mt-1">
                    Purchased: {formatDate(record.createdAt)}
                  </div>
                </div>

                {/* Days Left */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className={
                      record.daysRemaining > 30 ? 'text-green-600' :
                      record.daysRemaining > 7 ? 'text-yellow-600' :
                      'text-red-600'
                    } />
                    <span className={`text-12 font-semibold ${
                      record.daysRemaining > 30 ? 'text-green-600' :
                      record.daysRemaining > 7 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {record.daysRemaining}
                    </span>
                    <span className="text-11 text-gray-500">days</span>
                  </div>
                  {record.daysRemaining <= 7 && record.status === 'active' && (
                    <div className="text-10 text-red-500 mt-1">Expiring soon</div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="relative">
                    <button
                      onClick={() => setActionMenu(actionMenu === record.id ? null : record.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="More Actions"
                    >
                      <MoreVertical size={14} className="text-gray-600" />
                    </button>
                    
                    {actionMenu === record.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              // Extend access logic
                              setActionMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-11 text-gray-700 hover:bg-gray-100"
                          >
                            <RefreshCw size={12} />
                            Extend 30 Days
                          </button>
                          {record.status === 'active' && (
                            <button
                              onClick={() => {
                                // Revoke access logic
                                setActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-11 text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={12} />
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="text-11 text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-11 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-11 font-medium ${
                    pagination.page === pageNum
                      ? 'bg-[#ff7a00] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
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