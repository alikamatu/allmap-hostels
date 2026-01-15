"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, User, Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { formatDate } from '@/utils/date';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (checkInData: CheckInFormData) => Promise<void>;
  loading: boolean;
}

export interface CheckInFormData {
  notes?: string;
  actualCheckInTime?: string;
  checklist?: {
    idVerified: boolean;
    keysHanded: boolean;
    rulesExplained: boolean;
    roomInspected: boolean;
    contactUpdated: boolean;
  };
  [key: string]: unknown;
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

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Check-in failed:', error);
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
            className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Check-in Student</h3>
                  <p className="text-xs text-gray-500">Booking: {booking.id.substring(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-1 hover:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Booking Details */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Student</div>
                    <div className="font-medium text-gray-900 text-sm">{booking.studentName}</div>
                    <div className="text-xs text-gray-500">{booking.studentEmail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Room</div>
                    <div className="font-medium text-gray-900 text-sm">{booking.hostel?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Room {booking.room?.roomNumber || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Scheduled Check-in</div>
                    <div className="font-medium text-gray-900 text-sm">{formatDate(booking.checkInDate)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Check-out Date</div>
                    <div className="font-medium text-gray-900 text-sm">{formatDate(booking.checkOutDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {showWarnings.length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <div className="bg-yellow-50 border border-yellow-200 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 text-sm">Attention Required</h4>
                      <ul className="mt-1 text-xs text-yellow-700 space-y-1">
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
              <div className="p-3 border-b border-gray-200">
                <div className="bg-red-50 border border-red-200 p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-800 text-sm">Cannot Check-in</h4>
                      <p className="text-xs text-red-700 mt-1">
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
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Actual Check-in Time */}
              <div>
                <label htmlFor="actualCheckInTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-3 w-3 mr-2" />
                  Actual Check-in Time
                </label>
                <input
                  type="datetime-local"
                  id="actualCheckInTime"
                  value={formData.actualCheckInTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualCheckInTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  disabled={isProcessing}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be recorded as the official check-in time
                </p>
              </div>

              {/* Emergency Contacts Display */}
              {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-3">
                  <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2 text-sm">
                    <User className="h-3 w-3" />
                    Emergency Contacts
                  </h4>
                  <div className="space-y-2">
                    {booking.emergencyContacts.map((contact, index) => (
                      <div key={index} className="text-xs">
                        <div className="font-medium text-orange-900">{contact.name}</div>
                        <div className="text-orange-700">{contact.relationship} • {contact.phone}</div>
                        {contact.email && (
                          <div className="text-orange-600">{contact.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests Display */}
              {booking.specialRequests && (
                <div className="bg-purple-50 border border-purple-200 p-3">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    Special Requests
                  </h4>
                  <p className="text-xs text-purple-700 whitespace-pre-wrap">{booking.specialRequests}</p>
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
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  placeholder="Optional notes about the check-in process..."
                  disabled={isProcessing}
                />
              </div>

              {/* Checklist */}
              <div className="bg-green-50 border border-green-200 p-3">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3" />
                  Check-in Checklist
                </h4>
                <div className="space-y-2 text-xs text-green-700">
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
                      className="text-orange-600 focus:ring-orange-500 disabled:opacity-50"
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
                      className="text-orange-600 focus:ring-orange-500 disabled:opacity-50"
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
                      className="text-orange-600 focus:ring-orange-500 disabled:opacity-50"
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
                      className="text-orange-600 focus:ring-orange-500 disabled:opacity-50"
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
                      className="text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="contact-updated">Contact information updated</label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-medium text-white bg-orange-600 border border-transparent hover:bg-orange-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-150"
                  disabled={isProcessing || !canCheckIn}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
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