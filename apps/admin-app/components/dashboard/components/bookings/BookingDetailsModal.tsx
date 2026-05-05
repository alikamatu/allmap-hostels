"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Calendar, Phone, Mail,
  CreditCard, CheckCircle, Clock, AlertCircle,
  FileText, Loader2, Home,
} from 'lucide-react';
import { Button } from '@repo/ui';
import { Booking, BookingStatus } from '@/types/booking';
import { formatDate, formatDateTime } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { usePayments } from '@/hooks/usePayments';
import { Payment, PaymentStatus } from '@/types/payment';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPayment: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isHistorical?: boolean;
}

type TabType = 'details' | 'payments' | 'timeline';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  [BookingStatus.PENDING]:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  [BookingStatus.CONFIRMED]:   'bg-blue-50 text-blue-700 border-blue-200',
  [BookingStatus.CHECKED_IN]:  'bg-green-50 text-green-700 border-green-200',
  [BookingStatus.CHECKED_OUT]: 'bg-gray-50 text-gray-700 border-gray-200',
  [BookingStatus.CANCELLED]:   'bg-red-50 text-red-700 border-red-200',
  [BookingStatus.NO_SHOW]:     'bg-orange-50 text-orange-700 border-orange-200',
};

const PAYMENT_STATUS_COLORS: Partial<Record<PaymentStatus, string>> = {
  [PaymentStatus.PENDING]:   'bg-yellow-50 text-yellow-700',
  [PaymentStatus.PARTIAL]:   'bg-orange-50 text-orange-700',
  [PaymentStatus.PAID]:      'bg-green-50 text-green-700',
  [PaymentStatus.OVERDUE]:   'bg-red-50 text-red-700',
  [PaymentStatus.REFUNDED]:  'bg-gray-50 text-gray-700',
  [PaymentStatus.CANCELLED]: 'bg-red-50 text-red-700',
};

function getDurationInDays(checkIn: string, checkOut: string): number {
  return Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Reusable info row for detail sections */
const InfoRow: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({
  label, value, className = '',
}) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-medium ${className}`}>{value}</span>
  </div>
);

/** Section card with icon and title */
const DetailSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'orange' | 'purple';
}> = ({ icon, title, children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-50 border-gray-200',
    orange:  'bg-orange-50 border-orange-200',
    purple:  'bg-purple-50 border-purple-200',
  };

  const titleColors = {
    default: 'text-gray-900',
    orange:  'text-orange-900',
    purple:  'text-purple-900',
  };

  return (
    <div className={`border p-3 ${variants[variant]}`}>
      <h3 className={`font-semibold mb-2 flex items-center gap-2 text-xs ${titleColors[variant]}`}>
        {icon}
        {title}
      </h3>
      <div className="space-y-1 text-xs">{children}</div>
    </div>
  );
};

/** Progress bar for payment */
const ProgressBar: React.FC<{ percent: number; color?: string }> = ({
  percent, color = 'bg-green-600',
}) => (
  <div className="w-full bg-gray-100 h-1.5">
    <div
      className={`${color} h-1.5 transition-all duration-300`}
      style={{ width: `${Math.min(percent, 100)}%` }}
    />
  </div>
);

// ─── Tab: Details ────────────────────────────────────────────────────────────

const DetailsTab: React.FC<{
  booking: Booking;
  paymentProgress: number;
  isHistorical?: boolean;
  paymentsLoading: boolean;
  onPayment: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}> = ({ booking, paymentProgress, isHistorical, paymentsLoading, onPayment, onCheckIn, onCheckOut }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Student Information */}
      <DetailSection icon={<User className="h-3 w-3" />} title="Student Information">
        <InfoRow label="Name" value={booking.studentName} />
        <InfoRow label="Email" value={booking.studentEmail} />
        <InfoRow label="Phone" value={booking.studentPhone} />
        <InfoRow label="Student ID" value={booking.studentId} />
      </DetailSection>

      {/* Accommodation Details */}
      <DetailSection icon={<Home className="h-3 w-3" />} title="Accommodation">
        <InfoRow
          label="Hostel"
          value={booking.hostel?.name || '—'}
        />
        <InfoRow
          label="Room"
          value={booking.room?.roomNumber ? `Room ${booking.room.roomNumber}` : '—'}
        />
        <InfoRow
          label="Floor"
          value={booking.room?.floor != null ? `Floor ${booking.room.floor}` : '—'}
        />
        <InfoRow
          label="Room Type"
          value={booking.room?.roomType?.name || '—'}
        />
        <InfoRow
          label="Booking Type"
          value={booking.bookingType}
        />
      </DetailSection>

      {/* Important Dates */}
      <DetailSection icon={<Calendar className="h-3 w-3" />} title="Important Dates">
        <InfoRow label="Check-in" value={formatDate(booking.checkInDate)} />
        <InfoRow label="Check-out" value={formatDate(booking.checkOutDate)} />
        <InfoRow
          label="Duration"
          value={`${getDurationInDays(booking.checkInDate, booking.checkOutDate)} days`}
        />
        {booking.paymentDueDate && (
          <InfoRow
            label="Payment Due"
            value={formatDate(booking.paymentDueDate)}
            className={new Date() > new Date(booking.paymentDueDate) ? 'text-red-600' : ''}
          />
        )}
      </DetailSection>

      {/* Financial Summary */}
      <DetailSection icon={<CreditCard className="h-3 w-3" />} title="Financial Summary">
        <InfoRow label="Total Amount" value={formatCurrency(booking.totalAmount)} />
        <InfoRow
          label="Amount Paid"
          value={formatCurrency(booking.amountPaid)}
          className="text-green-600"
        />
        <InfoRow
          label="Amount Due"
          value={formatCurrency(booking.amountDue)}
          className={booking.amountDue > 0 ? 'text-red-600' : ''}
        />
        <div className="mt-2 pt-2 border-t border-gray-200">
          <InfoRow label="Payment Progress" value={`${paymentProgress.toFixed(1)}%`} />
          <div className="mt-1">
            <ProgressBar percent={paymentProgress} />
          </div>
        </div>
      </DetailSection>
    </div>

    {/* Emergency Contacts */}
    {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
      <DetailSection
        icon={<User className="h-3 w-3" />}
        title="Emergency Contacts"
        variant="orange"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {booking.emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white border border-gray-200 p-2">
              <div className="font-medium text-gray-900 text-xs">{contact.name}</div>
              <div className="text-xs text-gray-600">{contact.relationship}</div>
              <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </div>
              {contact.email && (
                <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </div>
              )}
            </div>
          ))}
        </div>
      </DetailSection>
    )}

    {/* Special Requests */}
    {booking.specialRequests && (
      <DetailSection
        icon={<AlertCircle className="h-3 w-3" />}
        title="Special Requests"
        variant="purple"
      >
        <p className="text-xs text-purple-700 whitespace-pre-wrap">{booking.specialRequests}</p>
      </DetailSection>
    )}

    {/* Notes */}
    {booking.notes && (
      <DetailSection icon={<FileText className="h-3 w-3" />} title="Notes">
        <p className="text-xs text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
      </DetailSection>
    )}

    {/* Quick Actions */}
    {!isHistorical && (
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        {booking.status === BookingStatus.CONFIRMED &&
          booking.paymentStatus === PaymentStatus.PAID && (
            <Button
              size="sm"
              onClick={onCheckIn}
              disabled={paymentsLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <CheckCircle className="h-3 w-3 mr-2" />
              Check In
            </Button>
          )}
        {booking.status === BookingStatus.CHECKED_IN && (
          <Button
            size="sm"
            onClick={onCheckOut}
            disabled={paymentsLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CheckCircle className="h-3 w-3 mr-2" />
            Check Out
          </Button>
        )}
        {[PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus) && (
          <Button
            size="sm"
            onClick={onPayment}
            disabled={paymentsLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CreditCard className="h-3 w-3 mr-2" />
            Record Payment
          </Button>
        )}
      </div>
    )}
  </div>
);

// ─── Tab: Payments ───────────────────────────────────────────────────────────

const PaymentsTab: React.FC<{
  booking: Booking;
  payments: Payment[];
  paymentsLoading: boolean;
  paymentProgress: number;
  isHistorical?: boolean;
  onPayment: () => void;
}> = ({ booking, payments, paymentsLoading, paymentProgress, isHistorical, onPayment }) => {
  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">No payments recorded</h3>
        <p className="text-xs text-gray-500 mb-3">No payments have been made for this booking yet.</p>
        {!isHistorical && (
          <Button
            size="sm"
            onClick={onPayment}
            disabled={paymentsLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white mx-auto"
          >
            <CreditCard className="h-3 w-3 mr-2" />
            Record Payment
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Payment Summary */}
      <DetailSection icon={<CreditCard className="h-3 w-3" />} title="Payment Summary" variant="orange">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{formatCurrency(booking.amountPaid)}</div>
            <div className="text-orange-700">Total Paid</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{formatCurrency(booking.amountDue)}</div>
            <div className="text-red-700">Amount Due</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{paymentProgress.toFixed(1)}%</div>
            <div className="text-green-700">Complete</div>
          </div>
        </div>
      </DetailSection>

      {/* Payment History */}
      {payments.map((payment, index) => (
        <div key={payment.id} className="bg-gray-50 border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-gray-500" />
              <span className="font-medium text-xs">{formatCurrency(payment.amount)}</span>
              <span className="text-xs text-gray-500">
                via {payment.paymentMethod.replace('_', ' ')}
              </span>
              {index === 0 && (
                <span className="bg-green-50 text-green-700 px-1 py-0.5 text-xs font-medium">
                  Latest
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">{formatDateTime(payment.paymentDate)}</span>
          </div>
          {payment.transactionRef && (
            <div className="text-xs text-gray-600 mb-1">Transaction: {payment.transactionRef}</div>
          )}
          {payment.notes && <div className="text-xs text-gray-600">Notes: {payment.notes}</div>}
          {payment.receivedBy && (
            <div className="text-xs text-gray-500 mt-1">Received by: {payment.receivedBy}</div>
          )}
        </div>
      ))}

      {!isHistorical &&
        [PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPayment}
            disabled={paymentsLoading}
            className="w-full"
          >
            <CreditCard className="h-3 w-3 mr-2" />
            Record Another Payment
          </Button>
        )}
    </div>
  );
};

// ─── Tab: Timeline ───────────────────────────────────────────────────────────

const TimelineTab: React.FC<{ booking: Booking }> = ({ booking }) => {
  const events = [
    {
      date: booking.createdAt,
      title: 'Booking Created',
      description: 'Initial booking request submitted',
      icon: <FileText className="h-3 w-3" />,
      status: 'completed' as const,
    },
    ...(booking.confirmedAt
      ? [{ date: booking.confirmedAt, title: 'Booking Confirmed', description: 'Booking confirmed by admin', icon: <CheckCircle className="h-3 w-3" />, status: 'completed' as const }]
      : []),
    ...(booking.checkedInAt
      ? [{ date: booking.checkedInAt, title: 'Checked In', description: 'Student checked into the room', icon: <CheckCircle className="h-3 w-3" />, status: 'completed' as const }]
      : []),
    ...(booking.checkedOutAt
      ? [{ date: booking.checkedOutAt, title: 'Checked Out', description: 'Student checked out successfully', icon: <CheckCircle className="h-3 w-3" />, status: 'completed' as const }]
      : []),
    ...(booking.cancelledAt
      ? [{ date: booking.cancelledAt, title: 'Booking Cancelled', description: booking.cancellationReason || 'Booking was cancelled', icon: <X className="h-3 w-3" />, status: 'cancelled' as const }]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const statusBg = {
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
    pending: 'bg-gray-400',
  };

  return (
    <div className="space-y-3">
      <div className="flow-root">
        <ul className="-mb-6">
          {events.map((event, idx) => (
            <li key={idx}>
              <div className="relative pb-6">
                {idx !== events.length - 1 && (
                  <span className="absolute top-3 left-3 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                )}
                <div className="relative flex space-x-3">
                  <div className={`h-6 w-6 flex items-center justify-center ${statusBg[event.status]}`}>
                    <div className="text-white">{event.icon}</div>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-3 pt-0.5">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{event.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{event.description}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-gray-500">
                      <time dateTime={event.date}>{formatDateTime(event.date)}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPayment,
  onCheckIn,
  onCheckOut,
  isHistorical,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const { fetchBookingPayments, payments, loading: paymentsLoading } = usePayments();

  useEffect(() => {
    if (isOpen && activeTab === 'payments') {
      fetchBookingPayments(booking.id);
    }
  }, [isOpen, activeTab, booking.id, fetchBookingPayments]);

  const paymentProgress =
    booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;

  const tabs = [
    { id: 'details' as TabType, label: 'Details', icon: <User className="h-3 w-3" /> },
    {
      id: 'payments' as TabType,
      label: `Payments${booking.amountPaid > 0 ? ` (${formatCurrency(booking.amountPaid)})` : ''}`,
      icon: <CreditCard className="h-3 w-3" />,
    },
    { id: 'timeline' as TabType, label: 'Timeline', icon: <Clock className="h-3 w-3" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{booking.studentName}</h2>
                  <p className="text-xs text-gray-500">
                    Booking ID: {booking.id.substring(0, 8)}
                    {booking.hostel?.name && (
                      <span className="ml-2 text-gray-400">
                        • {booking.hostel.name}
                        {booking.room?.roomNumber && ` — Room ${booking.room.roomNumber}`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${STATUS_COLORS[booking.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'bg-gray-50 text-gray-700'}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  disabled={paymentsLoading}
                  className="p-1 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Payment Status Banner */}
            {booking.amountPaid > 0 && (
              <div className="bg-green-50 border-b border-green-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-medium text-green-800">
                        Payment Progress: {paymentProgress.toFixed(1)}% Complete
                      </p>
                      <p className="text-xs text-green-600">
                        {formatCurrency(booking.amountPaid)} of {formatCurrency(booking.totalAmount)} paid
                      </p>
                    </div>
                  </div>
                  <div className="w-24">
                    <ProgressBar percent={paymentProgress} color="bg-green-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={paymentsLoading}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'details' && (
                <DetailsTab
                  booking={booking}
                  paymentProgress={paymentProgress}
                  isHistorical={isHistorical}
                  paymentsLoading={paymentsLoading}
                  onPayment={onPayment}
                  onCheckIn={onCheckIn}
                  onCheckOut={onCheckOut}
                />
              )}
              {activeTab === 'payments' && (
                <PaymentsTab
                  booking={booking}
                  payments={payments}
                  paymentsLoading={paymentsLoading}
                  paymentProgress={paymentProgress}
                  isHistorical={isHistorical}
                  onPayment={onPayment}
                />
              )}
              {activeTab === 'timeline' && <TimelineTab booking={booking} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;