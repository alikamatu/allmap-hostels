"use client";

import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, AlertCircle, Check, CheckCircle } from 'lucide-react';
import { Booking } from '@/types/booking';
import { formatCurrency } from '@/utils/currency';
import { PaymentMethod } from '@/types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (paymentData: PaymentFormData) => Promise<void>; // Simplified to match your parent
  loading: boolean;
}

interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethod;
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

  interface PaymentFormErrors {
    amount?: string;
    paymentMethod?: string;
    transactionRef?: string;
    notes?: string;
  }
  
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [quickAmountSelected, setQuickAmountSelected] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or booking changes
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

  // Amount validation
  const amount = Number(formData.amount);
  if (!amount || amount <= 0) {
    newErrors.amount = 'Amount must be greater than 0';
  } else if (amount < 0.01) {
    newErrors.amount = 'Amount must be at least 0.01';
  } else if (amount > booking.amountDue) {
    newErrors.amount = 'Amount cannot exceed amount due';
  }

  // Transaction reference validation for electronic payments
  const electronicMethods = [
    PaymentMethod.BANK_TRANSFER, 
    PaymentMethod.MOBILE_MONEY, 
    PaymentMethod.CARD
  ];
  
  if (electronicMethods.includes(formData.paymentMethod)) {
    if (!formData.transactionRef?.trim()) {
      newErrors.transactionRef = 'Transaction reference is required for this payment method';
    } else if (typeof formData.transactionRef !== 'string') {
      newErrors.transactionRef = 'Transaction reference must be a string';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Submit the payment
      await onSubmit({
        ...formData,
        amount: Number(formData.amount)
      });
      
      // Parent component handles closing and state updates
      
    } catch (error) {
      console.error('Payment submission failed:', error);
      setSubmitError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
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
    setFormData(prev => ({
      ...prev,
      amount: value
    }));
    setQuickAmountSelected(key);
    setErrors(prev => ({ ...prev, amount: undefined }));
    setSubmitError('');
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isProcessing = loading || isSubmitting;
  const remainingAfterPayment = booking.amountDue - Number(formData.amount);
  const willCompletePayment = remainingAfterPayment === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-500">Booking: {booking.id.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
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
          <div className="p-4 bg-red-50 border-b border-red-200">
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
                    className={`p-3 text-sm border rounded-lg transition-colors disabled:opacity-50 ${
                      quickAmountSelected === quick.key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{quick.label}</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(quick.value)}
                    </div>
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
                className={`pl-10 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
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
                setFormData(prev => ({ 
                  ...prev, 
                  paymentMethod: e.target.value as PaymentMethod 
                }));
                setSubmitError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
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
                setFormData(prev => ({ 
                  ...prev, 
                  transactionRef: e.target.value 
                }));
                setSubmitError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
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
                setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }));
                setSubmitError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="Optional notes about this payment..."
              disabled={isProcessing}
            />
          </div>

          {/* Payment Summary */}
          {formData.amount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Payment Amount:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Remaining Balance:</span>
                  <span className="font-medium text-blue-900">
                    {formatCurrency(remainingAfterPayment)}
                  </span>
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isProcessing || formData.amount <= 0}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
      </div>
    </div>
  );
};

export default PaymentModal;