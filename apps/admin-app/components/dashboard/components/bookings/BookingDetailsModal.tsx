"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Calendar, MapPin, Phone, Mail,
  CreditCard, CheckCircle, Clock, AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types/booking';
import { formatDate, formatDateTime } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { usePayments } from '@/hooks/usePayments';
import { PaymentStatus } from '@/types/payment';

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

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      [BookingStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [BookingStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-200',
      [BookingStatus.CHECKED_IN]: 'bg-green-50 text-green-700 border-green-200',
      [BookingStatus.CHECKED_OUT]: 'bg-gray-50 text-gray-700 border-gray-200',
      [BookingStatus.CANCELLED]: 'bg-red-50 text-red-700 border-red-200',
      [BookingStatus.NO_SHOW]: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors = {
      [PaymentStatus.PENDING]: 'bg-yellow-50 text-yellow-700',
      [PaymentStatus.PARTIAL]: 'bg-orange-50 text-orange-700',
      [PaymentStatus.PAID]: 'bg-green-50 text-green-700',
      [PaymentStatus.OVERDUE]: 'bg-red-50 text-red-700',
      [PaymentStatus.REFUNDED]: 'bg-gray-50 text-gray-700',
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
  };

  const timelineEvents = [
    {
      date: booking.createdAt,
      title: 'Booking Created',
      description: 'Initial booking request submitted',
      icon: <FileText className="h-3 w-3" />,
      status: 'completed',
    },
    ...(booking.confirmedAt
      ? [
          {
            date: booking.confirmedAt,
            title: 'Booking Confirmed',
            description: 'Booking confirmed by admin',
            icon: <CheckCircle className="h-3 w-3" />,
            status: 'completed',
          },
        ]
      : []),
    ...(booking.checkedInAt
      ? [
          {
            date: booking.checkedInAt,
            title: 'Checked In',
            description: 'Student checked into the room',
            icon: <CheckCircle className="h-3 w-3" />,
            status: 'completed',
          },
        ]
      : []),
    ...(booking.checkedOutAt
      ? [
          {
            date: booking.checkedOutAt,
            title: 'Checked Out',
            description: 'Student checked out successfully',
            icon: <CheckCircle className="h-3 w-3" />,
            status: 'completed',
          },
        ]
      : []),
    ...(booking.cancelledAt
      ? [
          {
            date: booking.cancelledAt,
            title: 'Booking Cancelled',
            description: booking.cancellationReason || 'Booking was cancelled',
            icon: <X className="h-3 w-3" />,
            status: 'cancelled',
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const paymentProgress = booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;

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
                  <p className="text-xs text-gray-500">Booking ID: {booking.id.substring(0, 8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium ${getPaymentStatusColor(
                      booking.paymentStatus
                    )}`}
                  >
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
                  <div className="w-24 bg-green-100 h-1.5">
                    <div
                      className="bg-green-600 h-1.5 transition-all duration-500"
                      style={{ width: `${paymentProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'details', label: 'Details', icon: <User className="h-3 w-3" /> },
                  {
                    id: 'payments',
                    label: `Payments${booking.amountPaid > 0 ? ` (${formatCurrency(booking.amountPaid)})` : ''}`,
                    icon: <CreditCard className="h-3 w-3" />,
                  },
                  { id: 'timeline', label: 'Timeline', icon: <Clock className="h-3 w-3" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
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
                <div className="space-y-4">
                  {/* Student Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-200 p-3">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                        <User className="h-3 w-3" />
                        Student Information
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{booking.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{booking.studentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{booking.studentPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student ID:</span>
                          <span className="font-medium">{booking.studentId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Accommodation Details */}
                    <div className="bg-gray-50 border border-gray-200 p-3">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                        <MapPin className="h-3 w-3" />
                        Accommodation
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hostel:</span>
                          <span className="font-medium">{booking.hostel?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room:</span>
                          <span className="font-medium">Room {booking.room?.roomNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Type:</span>
                          <span className="font-medium">{booking.room?.roomType?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Type:</span>
                          <span className="font-medium">{booking.bookingType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-3">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3" />
                        Important Dates
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {Math.ceil(
                              (new Date(booking.checkOutDate).getTime() -
                                new Date(booking.checkInDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </span>
                        </div>
                        {booking.paymentDueDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Due:</span>
                            <span
                              className={`font-medium ${
                                new Date() > new Date(booking.paymentDueDate) ? 'text-red-600' : ''
                              }`}
                            >
                              {formatDate(booking.paymentDueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-3">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                        <CreditCard className="h-3 w-3" />
                        Financial Summary
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-medium text-green-600">{formatCurrency(booking.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Due:</span>
                          <span
                            className={`font-medium ${booking.amountDue > 0 ? 'text-red-600' : 'text-gray-900'}`}
                          >
                            {formatCurrency(booking.amountDue)}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Progress:</span>
                            <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
                          </div>
                          <div className="mt-1 w-full bg-gray-100 h-1.5">
                            <div
                              className="bg-green-600 h-1.5 transition-all duration-300"
                              style={{ width: `${paymentProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 p-3">
                      <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2 text-xs">
                        <User className="h-3 w-3" />
                        Emergency Contacts
                      </h3>
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
                    </div>
                  )}

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="bg-purple-50 border border-purple-200 p-3">
                      <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        Special Requests
                      </h3>
                      <p className="text-xs text-purple-700 whitespace-pre-wrap">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <div className="bg-gray-50 border border-gray-200 p-3">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-xs">
                        <FileText className="h-3 w-3" />
                        Notes
                      </h3>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {!isHistorical && (
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                      {booking.status === BookingStatus.CONFIRMED &&
                        booking.paymentStatus === PaymentStatus.PAID && (
                          <button
                            onClick={onCheckIn}
                            disabled={paymentsLoading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Check In
                          </button>
                        )}
                      {booking.status === BookingStatus.CHECKED_IN && (
                        <button
                            onClick={onCheckOut}
                            disabled={paymentsLoading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Check Out
                          </button>
                      )}
                      {[PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus) && (
                        <button
                          onClick={onPayment}
                          disabled={paymentsLoading}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                          <CreditCard className="h-3 w-3" />
                          Record Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {paymentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No payments recorded</h3>
                      <p className="text-xs text-gray-500 mb-3">No payments have been made for this booking yet.</p>
                      {!isHistorical && (
                        <button
                          onClick={onPayment}
                          disabled={paymentsLoading}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 mx-auto"
                        >
                          <CreditCard className="h-3 w-3" />
                          Record Payment
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Payment Summary */}
                      <div className="bg-orange-50 border border-orange-200 p-3">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2 text-xs">
                          <CreditCard className="h-3 w-3" />
                          Payment Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {formatCurrency(booking.amountPaid)}
                            </div>
                            <div className="text-orange-700">Total Paid</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {formatCurrency(booking.amountDue)}
                            </div>
                            <div className="text-red-700">Amount Due</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{paymentProgress.toFixed(1)}%</div>
                            <div className="text-green-700">Complete</div>
                          </div>
                        </div>
                      </div>

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
                            <div className="text-xs text-gray-600 mb-1">
                              Transaction: {payment.transactionRef}
                            </div>
                          )}
                          {payment.notes && (
                            <div className="text-xs text-gray-600">Notes: {payment.notes}</div>
                          )}
                          {payment.receivedBy && (
                            <div className="text-xs text-gray-500 mt-1">
                              Received by: {payment.receivedBy}
                            </div>
                          )}
                        </div>
                      ))}

                      {!isHistorical && [PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus) && (
                        <button
                          onClick={onPayment}
                          disabled={paymentsLoading}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 hover:border-orange-400 hover:text-orange-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                          <CreditCard className="h-3 w-3" />
                          Record Another Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-3">
                  <div className="flow-root">
                    <ul className="-mb-6">
                      {timelineEvents.map((event, eventIdx) => (
                        <li key={eventIdx}>
                          <div className="relative pb-6">
                            {eventIdx !== timelineEvents.length - 1 && (
                              <span
                                className="absolute top-3 left-3 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div
                                className={`h-6 w-6 flex items-center justify-center ${
                                  event.status === 'completed'
                                    ? 'bg-green-500'
                                    : event.status === 'cancelled'
                                    ? 'bg-red-500'
                                    : 'bg-gray-400'
                                }`}
                              >
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;