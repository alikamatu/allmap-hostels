"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Booking } from '@/types/booking';
import { formatCurrency } from '@/utils/currency';
import { PaymentMethod } from '@/types/payment';
import Swal from 'sweetalert2';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (paymentData: PaymentFormData) => Promise<void>;
  loading: boolean;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

interface PaymentFormErrors {
  amount?: string;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: booking.amountDue > 0 ? booking.amountDue : 0.01,
    paymentMethod: PaymentMethod.CASH,
    transactionRef: '',
    notes: '',
  });
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [quickAmountSelected, setQuickAmountSelected] = useState<string>('full');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: booking.amountDue > 0 ? booking.amountDue : 0.01,
        paymentMethod: PaymentMethod.CASH,
        transactionRef: '',
        notes: '',
      });
      setQuickAmountSelected('full');
      setErrors({});
      setSubmitError('');
      setIsSubmitting(false);
    }
  }, [isOpen, booking.id, booking.amountDue]);

  const quickAmounts = [
    { label: 'Full Amount', value: booking.amountDue, key: 'full' },
    { label: 'Half Amount', value: Math.round((booking.amountDue / 2) * 100) / 100, key: 'half' },
    { label: '25%', value: Math.round((booking.amountDue * 0.25) * 100) / 100, key: 'quarter' },
  ].filter(item => item.value > 0);

  const validateForm = (): boolean => {
    const newErrors: PaymentFormErrors = {};
    const amount = Number(formData.amount);

    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amount < 0.01) {
      newErrors.amount = 'Amount must be at least 0.01';
    } else if (amount > booking.amountDue) {
      newErrors.amount = 'Amount cannot exceed amount due';
    }

    const electronicMethods = [PaymentMethod.BANK_TRANSFER, PaymentMethod.MOBILE_MONEY, PaymentMethod.CARD];
    if (electronicMethods.includes(formData.paymentMethod) && !formData.transactionRef?.trim()) {
      newErrors.transactionRef = 'Transaction reference is required for this payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    const result = await Swal.fire({
      title: 'Confirm Payment',
      text: `Are you sure you want to record a payment of ${formatCurrency(formData.amount)} for ${booking.studentName}'s booking?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a73e8',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, Record Payment',
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
    setSubmitError('');

    try {
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
      });
      Swal.fire({
        title: 'Payment Recorded',
        text: `Payment of ${formatCurrency(formData.amount)} has been successfully recorded.`,
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
      setSubmitError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      Swal.fire({
        title: 'Payment Failed',
        text: error instanceof Error ? error.message : 'An error occurred while recording the payment.',
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

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, amount: numericValue }));
    setQuickAmountSelected('');
    setErrors(prev => ({ ...prev, amount: undefined }));
    setSubmitError('');
  };

  const handleQuickAmount = (value: number, key: string): void => {
    setFormData(prev => ({ ...prev, amount: value }));
    setQuickAmountSelected(key);
    setErrors(prev => ({ ...prev, amount: undefined }));
    setSubmitError('');
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  const isProcessing = loading || isSubmitting;
  const remainingAfterPayment = booking.amountDue - Number(formData.amount);
  const willCompletePayment = remainingAfterPayment === 0;

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
            if (e.target === e.currentTarget && !isProcessing) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-medium">{booking.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(booking.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(booking.amountDue)}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{submitError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Quick Amount Selection */}
              {quickAmounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Amount Selection
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((quick) => (
                      <button
                        key={quick.key}
                        type="button"
                        onClick={() => handleQuickAmount(quick.value, quick.key)}
                        disabled={isProcessing}
                        className={`p-3 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          quickAmountSelected === quick.key
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-medium">{quick.label}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(quick.value)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0.01"
                    max={booking.amountDue}
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={isProcessing}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }));
                    setErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    setSubmitError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.paymentMethod ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
                  <option value={PaymentMethod.CARD}>Card Payment</option>
                  <option value={PaymentMethod.CHEQUE}>Cheque</option>
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              {/* Transaction Reference */}
              <div>
                <label htmlFor="transactionRef" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Reference
                  {[PaymentMethod.BANK_TRANSFER, PaymentMethod.MOBILE_MONEY, PaymentMethod.CARD].includes(formData.paymentMethod) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  id="transactionRef"
                  value={formData.transactionRef}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, transactionRef: e.target.value }));
                    setErrors(prev => ({ ...prev, transactionRef: undefined }));
                    setSubmitError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.transactionRef ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter transaction reference or receipt number"
                  disabled={isProcessing}
                />
                {errors.transactionRef && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.transactionRef}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, notes: e.target.value }));
                    setErrors(prev => ({ ...prev, notes: undefined }));
                    setSubmitError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Optional notes about this payment..."
                  disabled={isProcessing}
                />
              </div>

              {/* Payment Summary */}
              {formData.amount > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Payment Amount:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(formData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Remaining Balance:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(remainingAfterPayment)}</span>
                    </div>
                    {willCompletePayment && (
                      <div className="flex items-center gap-2 text-green-700 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">This payment will complete the booking</span>
                      </div>
                    )}
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
                  disabled={isProcessing || formData.amount <= 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Record Payment
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

export default PaymentModal;