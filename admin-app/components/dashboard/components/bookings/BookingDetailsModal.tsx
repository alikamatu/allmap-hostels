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
import Swal from 'sweetalert2';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onPayment: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isHistorical?: boolean;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPayment,
  onCheckIn,
  onCheckOut,
  isHistorical,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'payments' | 'timeline'>('details');
  const { fetchBookingPayments, payments, loading: paymentsLoading } = usePayments();

  useEffect(() => {
    if (isOpen && activeTab === 'payments') {
      fetchBookingPayments(booking.id);
    }
  }, [isOpen, activeTab, booking.id, fetchBookingPayments]);

  useEffect(() => {
    if (isOpen && activeTab === 'payments' && booking.amountPaid > 0) {
      fetchBookingPayments(booking.id);
    }
  }, [activeTab, isOpen, booking.amountPaid, booking.id, fetchBookingPayments]);

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      [BookingStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      [BookingStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-100',
      [BookingStatus.CHECKED_IN]: 'bg-green-50 text-green-700 border-green-100',
      [BookingStatus.CHECKED_OUT]: 'bg-gray-50 text-gray-700 border-gray-100',
      [BookingStatus.CANCELLED]: 'bg-red-50 text-red-700 border-red-100',
      [BookingStatus.NO_SHOW]: 'bg-orange-50 text-orange-700 border-orange-100',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-100';
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
      icon: <FileText className="h-4 w-4" />,
      status: 'completed',
    },
    ...(booking.confirmedAt
      ? [
          {
            date: booking.confirmedAt,
            title: 'Booking Confirmed',
            description: 'Booking confirmed by admin',
            icon: <CheckCircle className="h-4 w-4" />,
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
            icon: <CheckCircle className="h-4 w-4" />,
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
            icon: <CheckCircle className="h-4 w-4" />,
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
            icon: <X className="h-4 w-4" />,
            status: 'cancelled',
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const paymentProgress = booking.totalAmount > 0 ? (booking.amountPaid / booking.totalAmount) * 100 : 0;

  const showActionConfirm = (action: 'check-in' | 'check-out', callback: () => void) => {
    Swal.fire({
      title: `Confirm ${action === 'check-in' ? 'Check-In' : 'Check-Out'}`,
      text: `Are you sure you want to ${action === 'check-in' ? 'check in' : 'check out'} ${booking.studentName} for room ${booking.room?.roomNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a73e8', // Google blue
      cancelButtonColor: '#d32f2f',
      confirmButtonText: `Yes, ${action === 'check-in' ? 'Check In' : 'Check Out'}`,
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 font-medium',
        cancelButton: 'px-4 py-2 font-medium',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
        Swal.fire({
          title: `${action === 'check-in' ? 'Checked In' : 'Checked Out'}!`,
          text: `${booking.studentName} has been successfully ${action === 'check-in' ? 'checked in' : 'checked out'}.`,
          icon: 'success',
          confirmButtonColor: '#1a73e8',
          confirmButtonText: 'OK',
          background: '#fff',
          customClass: {
            popup: 'rounded-xl shadow-lg',
            title: 'text-lg font-medium text-gray-900',
            htmlContainer: 'text-sm text-gray-600',
            confirmButton: 'px-4 py-2 font-medium',
          },
        });
      }
    });
  };

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
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{booking.studentName}</h2>
                    <p className="text-sm text-gray-500">Booking ID: {booking.id.substring(0, 8)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                      booking.paymentStatus
                    )}`}
                  >
                    {booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={paymentsLoading}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Payment Status Banner */}
            {booking.amountPaid > 0 && (
              <div className="bg-green-50 border-b border-green-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Payment Progress: {paymentProgress.toFixed(1)}% Complete
                      </p>
                      <p className="text-xs text-green-600">
                        {formatCurrency(booking.amountPaid)} of {formatCurrency(booking.totalAmount)} paid
                      </p>
                    </div>
                  </div>
                  <div className="w-32 bg-green-100 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
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
                  { id: 'details', label: 'Details', icon: <User className="h-4 w-4" /> },
                  {
                    id: 'payments',
                    label: `Payments${booking.amountPaid > 0 ? ` (${formatCurrency(booking.amountPaid)})` : ''}`,
                    icon: <CreditCard className="h-4 w-4" />,
                  },
                  { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    disabled={paymentsLoading}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
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
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Student Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Student Information
                      </h3>
                      <div className="space-y-2 text-sm">
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Accommodation
                      </h3>
                      <div className="space-y-2 text-sm">
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
                          <span className="font-medium">{booking.bookingType.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Important Dates
                      </h3>
                      <div className="space-y-2 text-sm">
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

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Financial Summary
                      </h3>
                      <div className="space-y-2 text-sm">
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
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Progress:</span>
                            <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
                          </div>
                          <div className="mt-2 w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${paymentProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Emergency Contacts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {booking.emergencyContacts.map((contact, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-600">{contact.relationship}</div>
                            <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                              <Phone className="h-4 w-4" />
                              {contact.phone}
                            </div>
                            {contact.email && (
                              <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                <Mail className="h-4 w-4" />
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
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Special Requests
                      </h3>
                      <p className="text-sm text-purple-700 whitespace-pre-wrap">{booking.specialRequests}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes
                      </h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {!isHistorical && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      {booking.status === BookingStatus.CONFIRMED &&
                        booking.paymentStatus === PaymentStatus.PAID && (
                          <button
                            onClick={() => showActionConfirm('check-in', onCheckIn)}
                            disabled={paymentsLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Check In
                          </button>
                        )}
                      {booking.status === BookingStatus.CHECKED_IN && (
                        <button
                          onClick={() => showActionConfirm('check-out', onCheckOut)}
                          disabled={paymentsLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Check Out
                        </button>
                      )}
                      {[PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus) && (
                        <button
                          onClick={onPayment}
                          disabled={paymentsLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CreditCard className="h-4 w-4" />
                          Record Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  {paymentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payments recorded</h3>
                      <p className="text-sm text-gray-500 mb-4">No payments have been made for this booking yet.</p>
                      {!isHistorical && (
                        <button
                          onClick={onPayment}
                          disabled={paymentsLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
                        >
                          <CreditCard className="h-4 w-4" />
                          Record Payment
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Payment Summary */}
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Payment Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(booking.amountPaid)}
                            </div>
                            <div className="text-blue-700">Total Paid</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(booking.amountDue)}
                            </div>
                            <div className="text-red-700">Amount Due</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{paymentProgress.toFixed(1)}%</div>
                            <div className="text-green-700">Complete</div>
                          </div>
                        </div>
                      </div>

                      {/* Payment History */}
                      {payments.map((payment, index) => (
                        <div key={payment.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{formatCurrency(payment.amount)}</span>
                              <span className="text-sm text-gray-500">
                                via {payment.paymentMethod.replace('_', ' ')}
                              </span>
                              {index === 0 && (
                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                  Latest
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">{formatDateTime(payment.paymentDate)}</span>
                          </div>
                          {payment.transactionRef && (
                            <div className="text-sm text-gray-600 mb-1">
                              Transaction: {payment.transactionRef}
                            </div>
                          )}
                          {payment.notes && (
                            <div className="text-sm text-gray-600">Notes: {payment.notes}</div>
                          )}
                          {payment.receivedBy && (
                            <div className="text-xs text-gray-500 mt-2">
                              Received by: {payment.receivedBy}
                            </div>
                          )}
                        </div>
                      ))}

                      {!isHistorical && [PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(booking.paymentStatus) && (
                        <button
                          onClick={onPayment}
                          disabled={paymentsLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CreditCard className="h-4 w-4" />
                          Record Another Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {timelineEvents.map((event, eventIdx) => (
                        <li key={eventIdx}>
                          <div className="relative pb-8">
                            {eventIdx !== timelineEvents.length - 1 && (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex space-x-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  event.status === 'completed'
                                    ? 'bg-green-500'
                                    : event.status === 'cancelled'
                                    ? 'bg-red-500'
                                    : 'bg-gray-400'
                                }`}
                              >
                                <div className="text-white">{event.icon}</div>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                  <p className="mt-0.5 text-sm text-gray-500">{event.description}</p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
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