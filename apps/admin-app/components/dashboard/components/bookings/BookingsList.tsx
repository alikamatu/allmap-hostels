"use client";

import React, { useMemo } from 'react';
import {
  Calendar, CheckCircle, ChevronLeft, ChevronRight,
  CreditCard, Eye, Home, User, XCircle,
} from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

interface ConfirmBookingData { notes?: string }
interface CancelBookingData { reason: string; notes?: string }

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
  pagination?: { page: number; totalPages: number; total: number; limit: number };
  currentPage: number;
  onPageChange: (page: number) => void;
}

// ─── Status / Payment helpers ─────────────────────────────────────────────────

const STATUS_CLASSES: Partial<Record<BookingStatus, string>> = {
  [BookingStatus.PENDING]:     'bg-yellow-100 text-yellow-800 border-yellow-200',
  [BookingStatus.CONFIRMED]:   'bg-blue-100 text-blue-800 border-blue-200',
  [BookingStatus.CHECKED_IN]:  'bg-green-100 text-green-800 border-green-200',
  [BookingStatus.CHECKED_OUT]: 'bg-gray-100 text-gray-700 border-gray-200',
  [BookingStatus.CANCELLED]:   'bg-red-100 text-red-800 border-red-200',
  [BookingStatus.NO_SHOW]:     'bg-red-100 text-red-800 border-red-200',
};

const PAYMENT_CLASSES: Partial<Record<PaymentStatus, string>> = {
  [PaymentStatus.PENDING]:  'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PARTIAL]:  'bg-orange-100 text-orange-800',
  [PaymentStatus.PAID]:     'bg-green-100 text-green-800',
  [PaymentStatus.OVERDUE]:  'bg-red-100 text-red-800',
  [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-700',
};

const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border rounded-md ${STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
    {String(status).replace('_', ' ')}
  </span>
);

const PaymentBadge = ({ status }: { status: PaymentStatus }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-md ${PAYMENT_CLASSES[status] ?? 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
);

// ─── Action buttons ───────────────────────────────────────────────────────────

const ActionBtn = ({
  icon, label, onClick, colorClass = 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  colorClass?: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-1.5 rounded-lg transition-colors ${colorClass}`}
  >
    {icon}
  </button>
);

// ─── Mobile Booking Card ──────────────────────────────────────────────────────

const BookingCard: React.FC<{
  booking: Booking;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onViewDetails: () => void;
  onPayment: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ booking, selected, onSelect, onViewDetails, onPayment, onCheckIn, onCheckOut, onConfirm, onCancel }) => {
  const canCheckIn  = booking.status === BookingStatus.CONFIRMED && booking.paymentStatus === PaymentStatus.PAID;
  const canCheckOut = booking.status === BookingStatus.CHECKED_IN;
  const canPayment  = [PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus);
  const canConfirm  = booking.status === BookingStatus.PENDING;
  const canCancel   = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);

  const payPct = booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;

  return (
    <div className={`bg-white rounded-xl border transition-colors ${selected ? 'border-[#FF6A00] bg-orange-50/30' : 'border-gray-200'}`}>
      <div className="p-3">
        {/* Top row: checkbox + name + badges */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={e => onSelect(e.target.checked)}
            className="mt-0.5 h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{booking.studentName}</p>
              <div className="flex gap-1 flex-shrink-0">
                <StatusBadge status={booking.status} />
              </div>
            </div>
            <p className="text-xs text-gray-500 truncate">{booking.studentEmail}</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-2.5 space-y-1.5 pl-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{booking.hostel?.name || '—'}</span>
            {booking.room?.roomNumber && (
              <span className="text-gray-400">· Rm {booking.room.roomNumber}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span>{formatDate(booking.checkInDate)}</span>
            <span className="text-gray-400">→</span>
            <span>{formatDate(booking.checkOutDate)}</span>
          </div>

          {/* Payment row */}
          <div className="flex items-center justify-between gap-2">
            <PaymentBadge status={booking.paymentStatus} />
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
              {booking.amountDue > 0 && (
                <p className="text-[10px] text-red-600">Due {formatCurrency(booking.amountDue)}</p>
              )}
            </div>
          </div>

          {/* Payment progress bar */}
          {booking.totalAmount > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${booking.paymentStatus === PaymentStatus.PAID ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(payPct, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-100">
        <ActionBtn
          icon={<Eye className="h-4 w-4" />}
          label="View details"
          onClick={onViewDetails}
          colorClass="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        />
        {canPayment && (
          <ActionBtn
            icon={<CreditCard className="h-4 w-4" />}
            label="Record payment"
            onClick={onPayment}
            colorClass="text-green-600 hover:bg-green-50"
          />
        )}
        {canConfirm && (
          <ActionBtn
            icon={<CheckCircle className="h-4 w-4" />}
            label="Confirm"
            onClick={onConfirm}
            colorClass="text-blue-600 hover:bg-blue-50"
          />
        )}
        {canCheckIn && (
          <ActionBtn
            icon={<CheckCircle className="h-4 w-4" />}
            label="Check in"
            onClick={onCheckIn}
            colorClass="text-green-600 hover:bg-green-50"
          />
        )}
        {canCheckOut && (
          <ActionBtn
            icon={<XCircle className="h-4 w-4" />}
            label="Check out"
            onClick={onCheckOut}
            colorClass="text-purple-600 hover:bg-purple-50"
          />
        )}
        {canCancel && (
          <ActionBtn
            icon={<XCircle className="h-4 w-4" />}
            label="Cancel"
            onClick={onCancel}
            colorClass="text-red-600 hover:bg-red-50"
          />
        )}
      </div>
    </div>
  );
};

// ─── Desktop Table Row ────────────────────────────────────────────────────────

const BookingRow: React.FC<{
  booking: Booking;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onViewDetails: () => void;
  onPayment: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ booking, selected, onSelect, onViewDetails, onPayment, onCheckIn, onCheckOut, onConfirm, onCancel }) => {
  const canCheckIn  = booking.status === BookingStatus.CONFIRMED && booking.paymentStatus === PaymentStatus.PAID;
  const canCheckOut = booking.status === BookingStatus.CHECKED_IN;
  const canPayment  = [PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus);
  const canConfirm  = booking.status === BookingStatus.PENDING;
  const canCancel   = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);
  const payPct      = booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;

  return (
    <tr className={`border-b border-gray-100 transition-colors ${selected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
      <td className="pl-4 pr-2 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={e => onSelect(e.target.checked)}
          className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
        />
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 leading-none">{booking.studentName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{booking.studentEmail}</p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <Home className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900">{booking.hostel?.name || '—'}</p>
            <p className="text-xs text-gray-400">
              {booking.room?.roomNumber ? `Room ${booking.room.roomNumber}` : '—'}
              {booking.room?.roomType?.name && ` · ${booking.room.roomType.name}`}
            </p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-gray-400" />
          <div>
            <p className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</p>
            <p className="text-xs text-gray-400">{formatDate(booking.checkOutDate)}</p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3"><StatusBadge status={booking.status} /></td>

      <td className="px-3 py-3">
        <div className="space-y-1.5">
          <PaymentBadge status={booking.paymentStatus} />
          <div className="w-20 bg-gray-100 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all ${booking.paymentStatus === PaymentStatus.PAID ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(payPct, 100)}%` }}
            />
          </div>
        </div>
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <p className="text-sm font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</p>
        <p className="text-xs text-green-600">Paid {formatCurrency(booking.amountPaid)}</p>
        {booking.amountDue > 0 && (
          <p className="text-xs text-red-600">Due {formatCurrency(booking.amountDue)}</p>
        )}
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-0.5">
          <ActionBtn icon={<Eye className="h-4 w-4" />} label="View" onClick={onViewDetails} />
          {canPayment && (
            <ActionBtn icon={<CreditCard className="h-4 w-4" />} label="Payment" onClick={onPayment} colorClass="text-green-600 hover:bg-green-50" />
          )}
          {canConfirm && (
            <ActionBtn icon={<CheckCircle className="h-4 w-4" />} label="Confirm" onClick={onConfirm} colorClass="text-blue-600 hover:bg-blue-50" />
          )}
          {canCheckIn && (
            <ActionBtn icon={<CheckCircle className="h-4 w-4" />} label="Check in" onClick={onCheckIn} colorClass="text-green-600 hover:bg-green-50" />
          )}
          {canCheckOut && (
            <ActionBtn icon={<XCircle className="h-4 w-4" />} label="Check out" onClick={onCheckOut} colorClass="text-purple-600 hover:bg-purple-50" />
          )}
          {canCancel && (
            <ActionBtn icon={<XCircle className="h-4 w-4" />} label="Cancel" onClick={onCancel} colorClass="text-red-600 hover:bg-red-50" />
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Pagination ────────────────────────────────────────────────────────────────

const Pagination = ({
  pagination, currentPage, onPageChange,
}: {
  pagination: { page: number; totalPages: number; total: number; limit: number };
  currentPage: number;
  onPageChange: (p: number) => void;
}) => {
  if (pagination.totalPages <= 1) return null;

  const start = (currentPage - 1) * pagination.limit + 1;
  const end   = Math.min(currentPage * pagination.limit, pagination.total);

  const pageNums = Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
    return Math.max(1, currentPage - 2) + i;
  }).filter(p => p <= pagination.totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 hidden sm:block">
        {start}–{end} of {pagination.total}
      </p>
      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageNums.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 text-sm rounded-lg font-medium transition-colors ${
              p === currentPage
                ? 'bg-[#FF6A00] text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
          disabled={currentPage === pagination.totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const Skeleton = () => (
  <>
    {/* Mobile skeletons */}
    <div className="md:hidden space-y-3 p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 animate-pulse">
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Desktop skeleton */}
    <div className="hidden md:block">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 animate-pulse">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <div className="w-8 h-8 bg-gray-100 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-1/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/5" />
          </div>
          <div className="w-16 h-5 bg-gray-100 rounded" />
          <div className="w-12 h-5 bg-gray-100 rounded" />
          <div className="w-20 h-5 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingsList: React.FC<BookingsListProps> = ({
  bookings, loading, selectedBookings,
  onBookingSelect, onSelectAll, onViewDetails, onPayment,
  onCheckIn, onCheckOut, onConfirm, onCancel,
  pagination, currentPage, onPageChange,
}) => {
  const allSelected  = bookings.length > 0 && selectedBookings.length === bookings.length;
  const someSelected = selectedBookings.length > 0 && selectedBookings.length < bookings.length;

  const memoBookings = useMemo(() => bookings, [bookings]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Skeleton />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700 mb-1">No active bookings</p>
        <p className="text-xs text-gray-400">No pending, confirmed, or checked-in bookings match your filters.</p>
      </div>
    );
  }

  const rowProps = (booking: Booking) => ({
    booking,
    selected: selectedBookings.includes(booking.id),
    onSelect: (v: boolean) => onBookingSelect(booking.id, v),
    onViewDetails: () => onViewDetails(booking),
    onPayment:     () => onPayment(booking),
    onCheckIn:     () => onCheckIn(booking),
    onCheckOut:    () => onCheckOut(booking),
    onConfirm:     () => onConfirm(booking.id, { notes: 'Confirmed' }),
    onCancel:      () => onCancel(booking.id, { reason: 'Cancelled by admin', notes: 'Cancelled' }),
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Mobile card list */}
      <div className="md:hidden">
        {/* Select all row */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => { if (el) el.indeterminate = someSelected; }}
            onChange={e => onSelectAll(e.target.checked)}
            className="h-4 w-4 text-orange-600 rounded border-gray-300"
          />
          <span className="text-xs text-gray-500">
            {selectedBookings.length > 0 ? `${selectedBookings.length} selected` : `${bookings.length} bookings`}
          </span>
        </div>
        <div className="space-y-2 p-2.5">
          {memoBookings.map(booking => (
            <BookingCard key={`${booking.id}-${booking.amountPaid}`} {...rowProps(booking)} />
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="pl-4 pr-2 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={e => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-orange-600 rounded border-gray-300"
                />
              </th>
              {['Student', 'Accommodation', 'Dates', 'Status', 'Payment', 'Amount'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {memoBookings.map(booking => (
              <BookingRow key={`${booking.id}-${booking.amountPaid}-${booking.paymentStatus}`} {...rowProps(booking)} />
            ))}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination pagination={pagination} currentPage={currentPage} onPageChange={onPageChange} />}
    </div>
  );
};

export default BookingsList;
