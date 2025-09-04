"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, AlertCircle, User, Calendar, MapPin, Clock, DollarSign, Loader2, CheckCircle } from 'lucide-react';
import { Booking, BookingStatus } from '@/types/booking';
import { formatDate, formatDateTime } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import Swal from 'sweetalert2';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (checkOutData: CheckOutFormData) => Promise<void>;
  loading: boolean;
}

interface CheckOutFormData {
  notes?: string;
  actualCheckOutTime?: string;
  roomCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  keyReturned?: boolean;
  damageNotes?: string;
  cleaningFee?: number;
  depositRefund?: number;
  checklist?: {
    personalItemsRemoved: boolean;
    roomCleaned: boolean;
    utilitiesChecked: boolean;
    damagesNoted: boolean;
    forwardingAddressObtained: boolean;
  };
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CheckOutFormData>({
    notes: '',
    actualCheckOutTime: new Date().toISOString().slice(0, 16),
    roomCondition: 'good',
    keyReturned: false,
    damageNotes: '',
    cleaningFee: 0,
    depositRefund: 0,
    checklist: {
      personalItemsRemoved: false,
      roomCleaned: false,
      utilitiesChecked: false,
      damagesNoted: false,
      forwardingAddressObtained: false,
    },
  });
  const [showDamageSection, setShowDamageSection] = useState(false);
  const [showWarnings, setShowWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ cleaningFee?: string; depositRefund?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        notes: '',
        actualCheckOutTime: new Date().toISOString().slice(0, 16),
        roomCondition: 'good',
        keyReturned: false,
        damageNotes: '',
        cleaningFee: 0,
        depositRefund: 0,
        checklist: {
          personalItemsRemoved: false,
          roomCleaned: false,
          utilitiesChecked: false,
          damagesNoted: false,
          forwardingAddressObtained: false,
        },
      });

      const warnings = [];
      const today = new Date();
      const checkOutDate = new Date(booking.checkOutDate);

      if (checkOutDate > today) {
        warnings.push('Early check-out - scheduled date not reached');
      }
      const daysDiff = Math.ceil((today.getTime() - checkOutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        warnings.push(`Check-out is ${daysDiff} days late`);
      }

      setShowWarnings(warnings);
      setShowDamageSection(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, booking]);

  const canCheckOut = booking.status === BookingStatus.CHECKED_IN;

  const validateForm = (): boolean => {
    const newErrors: { cleaningFee?: string; depositRefund?: string } = {};

    if (formData.cleaningFee && formData.cleaningFee < 0) {
      newErrors.cleaningFee = 'Cleaning fee cannot be negative';
    }
    if (formData.depositRefund && formData.depositRefund < 0) {
      newErrors.depositRefund = 'Deposit refund cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoomConditionChange = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      roomCondition: condition as 'excellent' | 'good' | 'fair' | 'poor',
    }));
    setShowDamageSection(condition === 'fair' || condition === 'poor');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCheckOut || isSubmitting || loading || !formData.keyReturned || !validateForm()) return;

    const result = await Swal.fire({
      title: 'Confirm Check-out',
      text: `Are you sure you want to check out ${booking.studentName} from Room ${booking.room?.roomNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a73e8',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, Check Out',
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
        title: 'Check-out Successful',
        text: `${booking.studentName} has been successfully checked out.`,
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
        title: 'Check-out Failed',
        text: error instanceof Error ? error.message : 'An error occurred during check-out.',
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

  const stayDuration = Math.ceil(
    (new Date().getTime() - new Date(booking.checkedInAt || booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

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
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <LogOut className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Check-out Student</h3>
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

            {/* Booking Summary */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Student</div>
                    <div className="font-medium text-gray-900">{booking.studentName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Room</div>
                    <div className="font-medium text-gray-900">{booking.hostel?.name || 'N/A'} - Room {booking.room?.roomNumber || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Stay Duration</div>
                    <div className="font-medium text-gray-900">{stayDuration} days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Total Paid</div>
                    <div className="font-medium text-gray-900">{formatCurrency(booking.amountPaid)}</div>
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

            {/* Check-out Status */}
            {!canCheckOut && (
              <div className="p-4 border-b border-gray-100">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-800">Cannot Check-out</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {booking.status === BookingStatus.PENDING && 'Student is not checked in'}
                        {booking.status === BookingStatus.CONFIRMED && 'Student is not checked in'}
                        {booking.status === BookingStatus.CHECKED_OUT && 'Student is already checked out'}
                        {booking.status === BookingStatus.CANCELLED && 'Booking has been cancelled'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Actual Check-out Time */}
              <div>
                <label htmlFor="actualCheckOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Actual Check-out Time
                </label>
                <input
                  type="datetime-local"
                  id="actualCheckOutTime"
                  value={formData.actualCheckOutTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualCheckOutTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                />
              </div>

              {/* Room Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Room Condition Assessment
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'excellent', label: 'Excellent', color: 'green' },
                    { value: 'good', label: 'Good', color: 'blue' },
                    { value: 'fair', label: 'Fair', color: 'yellow' },
                    { value: 'poor', label: 'Poor', color: 'red' },
                  ].map((condition) => (
                    <button
                      key={condition.value}
                      type="button"
                      onClick={() => handleRoomConditionChange(condition.value)}
                      disabled={isProcessing}
                      className={`p-3 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.roomCondition === condition.value
                          ? `border-${condition.color}-500 bg-${condition.color}-50 text-${condition.color}-700`
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {condition.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Return */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="keyReturned"
                  checked={formData.keyReturned}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyReturned: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  disabled={isProcessing}
                />
                <label htmlFor="keyReturned" className="text-sm font-medium text-gray-700">
                  Room keys returned
                </label>
              </div>

              {/* Damage Assessment */}
              {showDamageSection && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-orange-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Damage Assessment
                  </h4>
                  <div>
                    <label htmlFor="damageNotes" className="block text-sm font-medium text-orange-700 mb-2">
                      Describe any damages or issues
                    </label>
                    <textarea
                      id="damageNotes"
                      rows={3}
                      value={formData.damageNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, damageNotes: e.target.value }))}
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Detail any damages, missing items, or cleanliness issues..."
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cleaningFee" className="block text-sm font-medium text-orange-700 mb-2">
                        Cleaning Fee (if applicable)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          id="cleaningFee"
                          step="0.01"
                          min="0"
                          value={formData.cleaningFee || ''}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, cleaningFee: parseFloat(e.target.value) || 0 }));
                            setErrors(prev => ({ ...prev, cleaningFee: undefined }));
                          }}
                          className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.cleaningFee ? 'border-red-300' : 'border-orange-300'
                          }`}
                          placeholder="0.00"
                          disabled={isProcessing}
                        />
                      </div>
                      {errors.cleaningFee && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.cleaningFee}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="depositRefund" className="block text-sm font-medium text-orange-700 mb-2">
                        Deposit Refund Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          id="depositRefund"
                          step="0.01"
                          min="0"
                          value={formData.depositRefund || ''}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, depositRefund: parseFloat(e.target.value) || 0 }));
                            setErrors(prev => ({ ...prev, depositRefund: undefined }));
                          }}
                          className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.depositRefund ? 'border-red-300' : 'border-orange-300'
                          }`}
                          placeholder="0.00"
                          disabled={isProcessing}
                        />
                      </div>
                      {errors.depositRefund && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.depositRefund}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Check-out Checklist */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Check-out Checklist
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="personal-items"
                      checked={formData.checklist?.personalItemsRemoved}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, personalItemsRemoved: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="personal-items">All personal items removed</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="room-cleaned"
                      checked={formData.checklist?.roomCleaned}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, roomCleaned: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="room-cleaned">Room cleaned and inspected</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="utilities-checked"
                      checked={formData.checklist?.utilitiesChecked}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, utilitiesChecked: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="utilities-checked">All utilities turned off</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="damages-noted"
                      checked={formData.checklist?.damagesNoted}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, damagesNoted: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="damages-noted">Any damages documented</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="contact-info"
                      checked={formData.checklist?.forwardingAddressObtained}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          checklist: { ...prev.checklist!, forwardingAddressObtained: e.target.checked },
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    />
                    <label htmlFor="contact-info">Forwarding address obtained</label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Optional notes about the check-out process..."
                  disabled={isProcessing}
                />
              </div>

              {/* Financial Summary */}
              {((formData.cleaningFee ?? 0) > 0 || (formData.depositRefund ?? 0) > 0) && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    {(formData.cleaningFee ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-red-600">Cleaning Fee:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(formData.cleaningFee ?? 0)}</span>
                      </div>
                    )}
                    {(formData.depositRefund ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-600">Deposit Refund:</span>
                        <span className="font-medium text-green-600">+{formatCurrency(formData.depositRefund ?? 0)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Net Amount:</span>
                      <span className={((formData.depositRefund ?? 0) - (formData.cleaningFee ?? 0)) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {((formData.depositRefund ?? 0) - (formData.cleaningFee ?? 0)) >= 0 ? '+' : ''}{formatCurrency((formData.depositRefund ?? 0) - (formData.cleaningFee ?? 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={isProcessing || !canCheckOut || !formData.keyReturned}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Complete Check-out
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

export default CheckOutModal;