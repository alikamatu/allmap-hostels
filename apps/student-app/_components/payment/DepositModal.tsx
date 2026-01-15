'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCreditCard, FaLock, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useDepositBalance } from '@/hooks/useDepositBalance';
import { usePaystack } from '@/hooks/usePaystack';
import { depositService } from '@/service/depositService';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess?: () => void;
}

export function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  const { user } = useAuth();
  const { refreshBalance } = useDepositBalance();
  const { paystackLoaded, loading: paystackLoading, error: paystackError } = usePaystack();
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [createdDepositId, setCreatedDepositId] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      setSuccess(false);
      setProcessingPayment(false);
      setPaymentReference('');
      setCreatedDepositId('');
    }
  }, [isOpen]);

  const validateAmount = useCallback((amount: string): string | null => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      return 'Please enter a valid amount';
    }
    if (numAmount < 1) {
      return 'Minimum deposit amount is GHS 1.00';
    }
    if (numAmount > 100000) {
      return 'Maximum deposit amount is GHS 100,000.00';
    }
    return null;
  }, []);

  const handlePayment = async () => {
    // Validate amount
    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      return;
    }

    // Check if Paystack is loaded
    if (!paystackLoaded) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    if (!window.PaystackPop) {
      setError('Payment system not available. Please refresh the page and try again.');
      return;
    }

    setProcessingPayment(true);
    setError(null);

    const reference = `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log('Creating deposit record...');
      // First create the deposit record
      const deposit = await depositService.createDeposit({
        amount: parseFloat(amount),
        paymentReference: reference,
        notes: 'Account deposit via Paystack',
      });

      setCreatedDepositId(deposit.id);
      console.log('Deposit record created:', deposit.id);

      // Prepare Paystack configuration
      const paystackConfig = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: user?.email || '',
        amount: parseFloat(amount) * 100, // Convert to kobo
        currency: 'GHS',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Deposit Type',
              variable_name: 'deposit_type',
              value: 'account_credit'
            },
            {
              display_name: 'Student Name',
              variable_name: 'student_name',
              value: user?.name || 'Unknown'
            },
            {
              display_name: 'Deposit ID',
              variable_name: 'deposit_id',
              value: deposit.id
            }
          ]
        },
        callback: function(response: any) {
          console.log('Paystack callback received:', response);
          setPaymentReference(response.reference);
          setProcessingPayment(false);

          // Handle the payment verification
          handlePaymentVerification(response.reference, parseFloat(amount));
        },
        onClose: function() {
          console.log('Paystack payment window closed by user');
          setProcessingPayment(false);
          setError('Payment was cancelled. You can try again.');
        }
      };

      console.log('Opening Paystack payment...', paystackConfig);
      
      // Ensure PaystackPop is available and setup method exists
      if (typeof window.PaystackPop.setup !== 'function') {
        throw new Error('Paystack setup method is not available');
      }

      const handler = window.PaystackPop.setup(paystackConfig);
      
      if (handler && typeof handler.openIframe === 'function') {
        handler.openIframe();
      } else {
        throw new Error('Failed to initialize Paystack payment');
      }

    } catch (error: any) {
      console.error('Failed to process deposit:', error);
      setError(`Payment initialization failed: ${error.message}`);
      setProcessingPayment(false);
    }
  };

  const handlePaymentVerification = async (reference: string, amount: number) => {
    try {
      console.log('Verifying deposit payment...', reference);
      const verification = await depositService.verifyDeposit({
        reference: reference,
        expectedAmount: amount
      });

      console.log('Deposit verified:', verification);
      setSuccess(true);
      refreshBalance();
      onDepositSuccess?.();
    } catch (error: any) {
      console.error('Deposit verification failed:', error);
      setError(`Payment successful but verification failed: ${error.message}. Please contact support.`);
    }
  };

  const handleClose = () => {
    if (success) {
      refreshBalance();
    }
    onClose();
  };

  const retryPayment = () => {
    setError(null);
    setProcessingPayment(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-black">Make a Deposit</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {success 
                    ? 'Deposit completed successfully!' 
                    : 'Add funds to your account for future bookings'
                  }
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={processingPayment}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Paystack Loading Status */}
            {paystackLoading && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 -lg flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span className="text-sm">Loading payment system...</span>
              </div>
            )}

            {paystackError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 -lg flex items-center">
                <FiAlertTriangle className="mr-2" />
                <span className="text-sm">{paystackError}</span>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-100 text-red-700 -lg"
              >
                <div className="flex items-start">
                  <FiAlertTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm">{error}</span>
                    {!processingPayment && error.includes('cancelled') && (
                      <button
                        onClick={retryPayment}
                        className="mt-2 flex items-center text-sm text-red-800 hover:text-red-900"
                      >
                        <FiRefreshCw className="mr-1" />
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-green-100 -full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Deposit Successful!
                </h3>
                <p className="text-gray-600 mb-2">
                  Your deposit of {depositService.formatPrice(parseFloat(amount))} has been processed and verified.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Reference: {paymentReference}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-black text-white py-3 -lg hover:bg-gray-800 font-medium transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    Deposit Amount (GHS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      GHS
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError(null);
                      }}
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      max="100000"
                      disabled={processingPayment || !paystackLoaded}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 -lg focus:border-black focus:ring-1 focus:ring-black outline-none text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum: GHS 1.00, Maximum: GHS 100,000.00
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[70, 140, 220, 540, 1000, 2000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={processingPayment || !paystackLoaded}
                      className={`py-2 text-sm border -lg transition ${
                        amount === quickAmount.toString()
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-black disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      GHS {quickAmount}
                    </button>
                  ))}
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 -lg p-4 mb-6">
                  <h4 className="font-medium text-black mb-2">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Amount:</span>
                      <span className="font-medium text-black">
                        {amount ? depositService.formatPrice(parseFloat(amount)) : 'GHS 0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Processing Fee:</span>
                      <span>Free</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-black">Total to Pay:</span>
                      <span className="text-black">
                        {amount ? depositService.formatPrice(parseFloat(amount)) : 'GHS 0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 -lg p-3 mb-6">
                  <div className="flex items-start">
                    <FaLock className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-blue-800 text-sm">
                      Your payment is secured with Paystack. All transactions are encrypted and secure.
                    </p>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={processingPayment || !amount || parseFloat(amount) <= 0 || !paystackLoaded}
                  className="w-full bg-green-600 text-white py-3 -lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center transition-colors"
                >
                  {processingPayment ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : !paystackLoaded ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Loading Payment System...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Pay {amount ? depositService.formatPrice(parseFloat(amount)) : 'GHS 0.00'}
                    </>
                  )}
                </button>

                <div className="text-center mt-3">
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <FaLock className="text-xs" />
                    <span className="text-xs">Secured by Paystack</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}