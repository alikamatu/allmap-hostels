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
  onConfirm: (bookingId: string, data: any) => Promise<unknown>;
  onCancel: (bookingId: string, data: any) => Promise<unknown>;
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
  const variants = {
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BookingStatus.CHECKED_IN]: 'bg-green-100 text-green-800 border-green-200',
    [BookingStatus.CHECKED_OUT]: 'bg-gray-100 text-gray-800 border-gray-200',
    [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
    [BookingStatus.NO_SHOW]: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status]}`}>
      {status.replace('_', ' ').toUpperCase()}
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
      {status.toUpperCase()}
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

  // Memoize payment progress to avoid recalculation on every render
  const paymentProgress = useMemo(() => {
    return booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;
  }, [booking.amountPaid, booking.totalAmount]);

  // Track payment updates with a counter to force progress bar animations
  const [paymentUpdateKey, setPaymentUpdateKey] = useState(0);

  useEffect(() => {
    setPaymentUpdateKey(prev => prev + 1);
  }, [booking.amountPaid, booking.paymentStatus]);

  return (
    <tr className={`hover:bg-gray-50 transition-colors duration-150 ${selected ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
            <div className="text-sm text-gray-500">{booking.studentEmail}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.hostel?.name}</div>
        <div className="text-sm text-gray-500">Room {booking.room?.roomNumber}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</div>
            <div className="text-sm text-gray-500">{formatDate(booking.checkOutDate)}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(booking.status)}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          {getPaymentStatusBadge(booking.paymentStatus)}
          {canPayment && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                key={paymentUpdateKey} // Force re-render on payment updates
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${paymentProgress}%` }}
              ></div>
            </div>
          )}
          {booking.paymentStatus === PaymentStatus.PAID && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatCurrency(booking.totalAmount)}</div>
        <div className="text-sm text-green-600">
          Paid: {formatCurrency(booking.amountPaid)}
        </div>
        {booking.amountDue > 0 && (
          <div className="text-sm text-red-600">
            Due: {formatCurrency(booking.amountDue)}
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onViewDetails}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {canPayment && (
            <button
              onClick={onPayment}
              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
              title="Record Payment"
            >
              <CreditCard className="h-4 w-4" />
            </button>
          )}

          {canCheckIn && (
            <button
              onClick={onCheckIn}
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
              title="Check In"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}

          {canCheckOut && (
            <button
              onClick={onCheckOut}
              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
              title="Check Out"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}

          {canConfirm && (
            <button
              onClick={onConfirm}
              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
              title="Confirm Booking"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}

          {canCancel && (
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
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

  // Memoize the booking list to prevent unnecessary re-renders
  const memoizedBookings = useMemo(() => bookings, [bookings]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active bookings found</h3>
          <p className="text-gray-500">
            No pending, confirmed, or checked-in bookings match your current filters.
            <br />
            <span className="text-xs text-gray-400 mt-1 block">
              Note: Checked-out and cancelled bookings are automatically hidden from this view.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accommodation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="relative px-6 py-3">
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
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
                <span className="font-medium">{pagination.total}</span> active bookings
                <br />
                <span className="text-xs text-gray-400">
                  Checked-out and cancelled bookings are hidden
                </span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        isCurrentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
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