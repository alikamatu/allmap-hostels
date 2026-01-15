"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Eye, CreditCard, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight,
  Calendar,
  User
} from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

interface ConfirmBookingData {
  notes?: string;
}

interface CancelBookingData {
  reason: string;
  notes?: string;
}

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  selectedBookings: string[];
  onBookingSelect: (bookingId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (booking: Booking) => void;
  onPayment: (booking: Booking) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onConfirm: (bookingId: string, data: ConfirmBookingData) => Promise<unknown>;
  onCancel: (bookingId: string, data: CancelBookingData) => Promise<unknown>;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

const getStatusBadge = (status: BookingStatus) => {
  const variants: Partial<Record<BookingStatus, string>> = {
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BookingStatus.CHECKED_IN]: 'bg-green-100 text-green-800 border-green-200',
    [BookingStatus.CHECKED_OUT]: 'bg-gray-100 text-gray-800 border-gray-200',
    [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
    [BookingStatus.NO_SHOW]: 'bg-red-100 text-red-800 border-red-200',
  };

  const variantClass = variants[status] ?? 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${variantClass}`}>
      {String(status).replace('_', ' ')}
    </span>
  );
};

const getPaymentStatusBadge = (status: PaymentStatus) => {
  const variants = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.PARTIAL]: 'bg-orange-100 text-orange-800',
    [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
    [PaymentStatus.OVERDUE]: 'bg-red-100 text-red-800',
    [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${variants[status]}`}>
      {status}
    </span>
  );
};

const BookingRow: React.FC<{
  booking: Booking;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onViewDetails: () => void;
  onPayment: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ booking, selected, onSelect, onViewDetails, onPayment, onCheckIn, onCheckOut, onConfirm, onCancel }) => {
  const canCheckIn = booking.status === BookingStatus.CONFIRMED && booking.paymentStatus === PaymentStatus.PAID;
  const canCheckOut = booking.status === BookingStatus.CHECKED_IN;
  const canPayment = [PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus);
  const canConfirm = booking.status === BookingStatus.PENDING;
  const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);

  const paymentProgress = useMemo(() => {
    return booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;
  }, [booking.amountPaid, booking.totalAmount]);

  const [paymentUpdateKey, setPaymentUpdateKey] = useState(0);

  useEffect(() => {
    setPaymentUpdateKey(prev => prev + 1);
  }, [booking.amountPaid, booking.paymentStatus]);

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${selected ? 'bg-orange-50' : ''}`}>
      <td className="px-4 py-3 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
        />
      </td>
      
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
            <div className="text-xs text-gray-500">{booking.studentEmail}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.hostel?.name}</div>
        <div className="text-xs text-gray-500">Room {booking.room?.roomNumber}</div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</div>
            <div className="text-xs text-gray-500">{formatDate(booking.checkOutDate)}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        {getStatusBadge(booking.status)}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="space-y-2">
          {getPaymentStatusBadge(booking.paymentStatus)}
          {canPayment && (
            <div className="w-full bg-gray-200 h-1.5">
              <div 
                key={paymentUpdateKey}
                className="bg-orange-600 h-1.5 transition-all duration-500 ease-out" 
                style={{ width: `${paymentProgress}%` }}
              ></div>
            </div>
          )}
          {booking.paymentStatus === PaymentStatus.PAID && (
            <div className="w-full bg-gray-200 h-1.5">
              <div className="bg-green-600 h-1.5 w-full"></div>
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatCurrency(booking.totalAmount)}</div>
        <div className="text-xs text-green-600">
          Paid: {formatCurrency(booking.amountPaid)}
        </div>
        {booking.amountDue > 0 && (
          <div className="text-xs text-red-600">
            Due: {formatCurrency(booking.amountDue)}
          </div>
        )}
      </td>

      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={onViewDetails}
            className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 transition-colors duration-150"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {canPayment && (
            <button
              onClick={onPayment}
              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 transition-colors duration-150"
              title="Record Payment"
            >
              <CreditCard className="h-4 w-4" />
            </button>
          )}

          {canCheckIn && (
            <button
              onClick={onCheckIn}
              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 transition-colors duration-150"
              title="Check In"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}

          {canCheckOut && (
            <button
              onClick={onCheckOut}
              className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 transition-colors duration-150"
              title="Check Out"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}

          {canConfirm && (
            <button
              onClick={onConfirm}
              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 transition-colors duration-150"
              title="Confirm Booking"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}

          {canCancel && (
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 transition-colors duration-150"
              title="Cancel Booking"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  loading,
  selectedBookings,
  onBookingSelect,
  onSelectAll,
  onViewDetails,
  onPayment,
  onCheckIn,
  onCheckOut,
  onConfirm,
  onCancel,
  pagination,
  currentPage,
  onPageChange,
}) => {
  const allSelected = bookings.length > 0 && selectedBookings.length === bookings.length;
  const someSelected = selectedBookings.length > 0 && selectedBookings.length < bookings.length;

  const memoizedBookings = useMemo(() => bookings, [bookings]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-gray-200">
        <div className="p-8 text-center">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active bookings found</h3>
          <p className="text-gray-500 text-sm">
            No pending, confirmed, or checked-in bookings match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accommodation
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {memoizedBookings.map((booking) => (
              <BookingRow
                key={`${booking.id}-${booking.amountPaid}-${booking.paymentStatus}`}
                booking={booking}
                selected={selectedBookings.includes(booking.id)}
                onSelect={(selected) => onBookingSelect(booking.id, selected)}
                onViewDetails={() => onViewDetails(booking)}
                onPayment={() => onPayment(booking)}
                onCheckIn={() => onCheckIn(booking)}
                onCheckOut={() => onCheckOut(booking)}
                onConfirm={() => onConfirm(booking.id, { notes: 'Confirmed from list' })}
                onCancel={() => onCancel(booking.id, { 
                  reason: 'Cancelled from list', 
                  notes: 'Cancelled by admin' 
                })}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> bookings
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  const isCurrentPage = pageNum === currentPage;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ${
                        isCurrentPage
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;