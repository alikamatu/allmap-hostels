"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Booking, BookingStatus } from '@/types/booking';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { formatDate, formatPrice } from '@/utils/bookingHelpers';
import { FaCreditCard, FaMobileAlt } from 'react-icons/fa';

interface AutoCancellationWarningProps {
  booking: Booking;
}

export const AutoCancellationWarning = ({ booking }: AutoCancellationWarningProps) => {
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  if (!booking.paymentRequirements || 
      booking.status !== BookingStatus.CONFIRMED ||
      booking.paymentRequirements.meetsRequirement) {
    return null;
  }

  const { daysUntilAutoCancel, minimumRequired } = booking.paymentRequirements;
  const amountNeeded = minimumRequired - booking.amountPaid + 70;

  const getWarningColor = () => {
    if (daysUntilAutoCancel <= 2) return 'bg-red-50 border-red-200 text-red-800';
    if (daysUntilAutoCancel <= 4) return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  const getUrgencyText = () => {
    if (daysUntilAutoCancel <= 1) return 'URGENT';
    if (daysUntilAutoCancel <= 3) return 'Important';
    return 'Reminder';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className={`mt-4 p-4 border ${getWarningColor()} flex items-start space-x-3`}
      >
        <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-lg" />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h4 className="font-semibold text-sm mb-1 sm:mb-0">
              {getUrgencyText()}: Payment Required to Secure Booking
            </h4>
            <span className="text-xs font-medium bg-white px-2 py-1">
              {daysUntilAutoCancel} day{daysUntilAutoCancel !== 1 ? 's' : ''} remaining
            </span>
          </div>
          
          <p className="text-sm mb-2">
            At least 50% ({formatPrice(minimumRequired)}) of the semester fee must be paid within 7 days to avoid automatic cancellation.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Amount Paid:</span>{' '}
              {formatPrice(booking.amountPaid)}
            </div>
            <div>
              <span className="font-medium">Still Needed:</span>{' '}
              {formatPrice(amountNeeded)}
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium">Deadline:</span>{' '}
              {booking.autoCancelAt ? formatDate(booking.autoCancelAt) : '7 days from booking'}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress to 50% requirement</span>
              <span>
                {Math.min(Math.round((booking.amountPaid / minimumRequired) * 100), 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((booking.amountPaid / minimumRequired) * 100, 100)}%`,
                  backgroundColor: daysUntilAutoCancel <= 2 ? '#dc2626' : 
                                 daysUntilAutoCancel <= 4 ? '#ea580c' : '#ca8a04'
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {/* <Link
              href={`/dashboard/payments?bookingId=${booking.id}`}
              className="bg-black text-white px-3 py-1.5 text-xs font-medium hover:bg-gray-800"
            >
              Make Payment Now
            </Link> */}
            <button
              onClick={() => setShowPaymentDetails(true)}
              className="border border-current px-3 py-1.5 text-xs font-medium hover:bg-white hover:bg-opacity-20"
            >
              View Payment Details
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hostel Payment Details Modal */}
      <HostelPaymentDetailsModal
        hostel={booking.hostel}
        isOpen={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
      />
    </>
  );
};

// Hostel Payment Details Modal Component
interface HostelPaymentDetailsModalProps {
  hostel: any;
  isOpen: boolean;
  onClose: () => void;
}

const HostelPaymentDetailsModal = ({ hostel, isOpen, onClose }: HostelPaymentDetailsModalProps) => {
  if (!isOpen) return null;

  if (!hostel) return null;

  const showBankDetails = hostel.payment_method === 'bank' || hostel.payment_method === 'both';
  const showMomoDetails = hostel.payment_method === 'momo' || hostel.payment_method === 'both';

  // Parse bank details if it's a string
  let bankDetails = null;
  if (hostel.bank_details) {
    try {
      bankDetails = typeof hostel.bank_details === 'string' 
        ? JSON.parse(hostel.bank_details) 
        : hostel.bank_details;
    } catch (e) {
      console.error('Error parsing bank details:', e);
    }
  }

  // Parse momo details if it's a string
  let momoDetails = null;
  if (hostel.momo_details) {
    try {
      momoDetails = typeof hostel.momo_details === 'string' 
        ? JSON.parse(hostel.momo_details) 
        : hostel.momo_details;
    } catch (e) {
      console.error('Error parsing momo details:', e);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md border shadow-lg"
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Hostel Payment Details</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onClose}
                className="text-black"
              >
                <FiX className="text-xl" />
              </motion.button>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-black mb-2">{hostel.name}</h3>
              <p className="text-gray-800 text-sm">
                Use the payment details below to complete your payment for room {hostel.room?.roomNumber}.
              </p>
            </div>

            {/* Bank Transfer Details */}
            {showBankDetails && bankDetails && (
              <div className="mb-4">
                <h4 className="font-medium text-black mb-2 flex items-center">
                  <FaCreditCard className="mr-2" />
                  Bank Transfer
                </h4>
                <div className="bg-gray-50 p-3 border text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-800">Bank Name:</span>
                    <span className="font-medium text-black">{bankDetails.bank_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Account Name:</span>
                    <span className="font-medium text-black">{bankDetails.account_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Account Number:</span>
                    <span className="font-medium text-black">{bankDetails.account_number || 'N/A'}</span>
                  </div>
                  {bankDetails.branch && (
                    <div className="flex justify-between">
                      <span className="text-gray-800">Branch:</span>
                      <span className="font-medium text-black">{bankDetails.branch}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Money Details */}
            {showMomoDetails && momoDetails && (
              <div className="mb-4">
                <h4 className="font-medium text-black mb-2 flex items-center">
                  <FaMobileAlt className="mr-2" />
                  Mobile Money
                </h4>
                <div className="bg-gray-50 p-3 border text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-800">Provider:</span>
                    <span className="font-medium text-black">{momoDetails.provider || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Number:</span>
                    <span className="font-medium text-black">{momoDetails.number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800">Name:</span>
                    <span className="font-medium text-black">{momoDetails.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* No Payment Methods Configured */}
            {!showBankDetails && !showMomoDetails && (
              <div className="bg-gray-50 p-4 border text-center">
                <p className="text-gray-800 text-sm">
                  No payment methods configured for this hostel.
                </p>
                <p className="text-gray-800 text-sm mt-1">
                  Please contact the hostel directly for payment instructions.
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-50 p-3 border text-sm">
              <h4 className="font-medium text-black mb-2">Contact Hostel</h4>
              <div className="space-y-1 text-gray-800">
                <p><strong>Phone:</strong> {hostel.phone}</p>
                {hostel.SecondaryNumber && (
                  <p><strong>Alt. Phone:</strong> {hostel.SecondaryNumber}</p>
                )}
                <p><strong>Email:</strong> {hostel.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-black border border-gray-200 hover:bg-gray-100 font-medium"
              >
                Close
              </button>
              {/* <Link
                href={`/dashboard/payments?bookingId=${hostel.id}`}
                className="flex-1 bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 text-center"
              >
                Make Payment
              </Link> */}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};