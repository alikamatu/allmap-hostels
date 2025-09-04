"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, User, Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { formatDate, formatDateTime } from '@/utils/date';
import Swal from 'sweetalert2';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (checkInData: CheckInFormData) => Promise<void>;
  loading: boolean;
}

interface CheckInFormData {
  notes?: string;
  actualCheckInTime?: string;
  checklist?: {
    idVerified: boolean;
    keysHanded: boolean;
    rulesExplained: boolean;
    roomInspected: boolean;
    contactUpdated: boolean;
  };
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CheckInFormData>({
    notes: '',
    actualCheckInTime: new Date().toISOString().slice(0, 16),
    checklist: {
      idVerified: false,
      keysHanded: false,
      rulesExplained: false,
      roomInspected: false,
      contactUpdated: false,
    },
  });
  const [showWarnings, setShowWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        notes: '',
        actualCheckInTime: new Date().toISOString().slice(0, 16),
        checklist: {
          idVerified: false,
          keysHanded: false,
          rulesExplained: false,
          roomInspected: false,
          contactUpdated: false,
        },
      });

      const warnings = [];
      const today = new Date();
      const checkInDate = new Date(booking.checkInDate);

      if (booking.paymentStatus !== PaymentStatus.PAID) {
        warnings.push('Payment is not fully completed');
      }
      if (checkInDate > today) {
        warnings.push('Check-in date is in the future');
      }
      const daysDiff = Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        warnings.push(`Check-in is ${daysDiff} days late`);
      }

      setShowWarnings(warnings);
      setIsSubmitting(false);
    }
  }, [isOpen, booking]);

  const canCheckIn = booking.status === BookingStatus.CONFIRMED;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCheckIn || isSubmitting || loading) return;

    const result = await Swal.fire({
      title: 'Confirm Check-in',
      text: `Are you sure you want to check in ${booking.studentName} for Room ${booking.room?.roomNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a73e8',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, Check In',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 font-medium',
        cancelButton: 'px-4 py-2 font-medium',
      },
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      Swal.fire({
        title: 'Check-in Successful',
        text: `${booking.studentName} has been successfully checked in.`,
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
      }).then(() => {
        onClose();
      });
    } catch (error) {
      Swal.fire({
        title: 'Check-in Failed',
        text: error instanceof Error ? error.message : 'An error occurred during check-in.',
        icon: 'error',
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  const isProcessing = loading || isSubmitting;

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
            if (e.target === e.currentTarget && !isProcessing) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Check-in Student</h3>
                  <p className="text-sm text-gray-500">Booking: {booking.id.substring(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-1.5 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Booking Details */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Student</div>
                    <div className="font-medium text-gray-900">{booking.studentName}</div>
                    <div className="text-sm text-gray-500">{booking.studentEmail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Room</div>
                    <div className="font-medium text-gray-900">{booking.hostel?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Room {booking.room?.roomNumber || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Scheduled Check-in</div>
                    <div className="font-medium text-gray-900">{formatDate(booking.checkInDate)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Check-out Date</div>
                    <div className="font-medium text-gray-900">{formatDate(booking.checkOutDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {showWarnings.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Attention Required</h4>
                      <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                        {showWarnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Check-in Status */}
            {!canCheckIn && (
              <div className="p-4 border-b border-gray-100">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-800">Cannot Check-in</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {booking.status === BookingStatus.PENDING && 'Booking must be confirmed first'}
                        {booking.status === BookingStatus.CHECKED_IN && 'Student is already checked in'}
                        {booking.status === BookingStatus.CHECKED_OUT && 'Booking is already completed'}
                        {booking.status === BookingStatus.CANCELLED && 'Booking has been cancelled'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Actual Check-in Time */}
              <div>
                <label htmlFor="actualCheckInTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Actual Check-in Time
                </label>
                <input
                  type="datetime-local"
                  id="actualCheckInTime"
                  value={formData.actualCheckInTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualCheckInTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be recorded as the official check-in time
                </p>
              </div>

              {/* Emergency Contacts Display */}
              {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Emergency Contacts
                  </h4>
                  <div className="space-y-2">
                    {booking.emergencyContacts.map((contact, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-blue-900">{contact.name}</div>
                        <div className="text-blue-700">{contact.relationship} • {contact.phone}</div>
                        {contact.email && (
                          <div className="text-blue-600">{contact.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests Display */}
              {booking.specialRequests && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Special Requests
                  </h4>
                  <p className="text-sm text-purple-700 whitespace-pre-wrap">{booking.specialRequests}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Optional notes about the check-in process..."
                  disabled={isProcessing}
                />
              </div>

              {/* Checklist */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Check-in Checklist
                </h4>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="id-verified"
                      checked={formData.checklist?.idVerified}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, idVerified: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="id-verified">Student ID verified</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keys-handed"
                      checked={formData.checklist?.keysHanded}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, keysHanded: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="keys-handed">Room keys handed over</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rules-explained"
                      checked={formData.checklist?.rulesExplained}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, rulesExplained: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="rules-explained">Hostel rules explained</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="room-inspected"
                      checked={formData.checklist?.roomInspected}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, roomInspected: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="room-inspected">Room condition inspected</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="contact-updated"
                      checked={formData.checklist?.contactUpdated}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, contactUpdated: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="contact-updated">Contact information updated</label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  disabled={isProcessing || !canCheckIn}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Check-in
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckInModal;