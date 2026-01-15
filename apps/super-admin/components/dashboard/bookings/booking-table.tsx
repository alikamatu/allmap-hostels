'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Home,
  Bed,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { BookingRecord, BookingStatus, PaymentStatus } from '@/types/booking.types';
import { formatCurrency } from '@/lib/formatters';

interface BookingTableProps {
  bookings: BookingRecord[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onStatusUpdate?: (id: string, status: BookingStatus) => void;
  onViewDetails?: (booking: BookingRecord) => void;
}

export default function BookingTable({
  bookings,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
}: BookingTableProps) {
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'checked_in':
        return 'text-blue-600 bg-blue-50';
      case 'checked_out':
        return 'text-purple-600 bg-purple-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
      case 'checked_in':
        return CheckCircle;
      case 'checked_out':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg ">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a00]"></div>
          <p className="mt-2 text-12 text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white p-8 text-center rounded-lg ">
        <Bed size={32} className="mx-auto text-gray-300 mb-3" />
        <h3 className="text-14 font-medium text-gray-900 mb-1">No bookings found</h3>
        <p className="text-12 text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg  overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-11 font-medium text-gray-700">
        <div className="col-span-3">Student & Hostel</div>
        <div className="col-span-2">Booking Details</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2">Payment</div>
        <div className="col-span-2">Dates</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {bookings.map((booking, index) => {
          const StatusIcon = getStatusIcon(booking.status);
          const statusColor = getStatusColor(booking.status);
          const paymentStatusColor = getPaymentStatusColor(booking.paymentStatus);

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-10 gap-4 p-4 items-center">
                {/* Student & Hostel Info */}
                <div className="col-span-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-12 font-medium text-gray-900 truncate">
                        {booking.studentName}
                      </div>
                      <div className="text-11 text-gray-500 flex items-center gap-1">
                        <Mail size={10} />
                        <span className="truncate">{booking.studentEmail}</span>
                      </div>
                      <div className="text-10 text-gray-400 flex items-center gap-1">
                        <Phone size={10} />
                        {booking.studentPhone}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Home size={10} className="text-gray-400" />
                        <span className="text-10 text-gray-500 truncate">
                          {booking.hostel?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Bed size={12} className="text-gray-400" />
                      <span className="text-11 font-medium text-gray-900">
                        Room {booking.room?.roomNumber}
                      </span>
                    </div>
                    <div className="text-10 text-gray-500 capitalize">
                      {booking.bookingType.replace('_', ' ')}
                    </div>
                    <div className="text-10 text-gray-400">
                      {booking.duration} days
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusColor}`}>
                    <StatusIcon size={10} />
                    <span className="text-10 font-medium capitalize">
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Payment */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${paymentStatusColor}`}>
                      <span className="text-10 font-medium capitalize">
                        {booking.paymentStatus}
                      </span>
                    </div>
                    <div className="text-11 font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-10 text-gray-500">
                      Paid: {formatCurrency(booking.amountPaid)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails?.(booking)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <Eye size={14} className="text-gray-600" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === booking.id ? null : booking.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="More Actions"
                      >
                        <MoreVertical size={14} className="text-gray-600" />
                      </button>
                    </div>
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
            {pagination.total} bookings
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