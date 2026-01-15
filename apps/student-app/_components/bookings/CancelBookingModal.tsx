import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { Booking } from '@/types/booking';
import { formatDate } from '@/utils/bookingHelpers';
import { useState } from 'react';

interface CancelBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string, reason: string) => void;
}

export const CancelBookingModal = ({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: CancelBookingModalProps) => {
  const [cancellationReason, setCancellationReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (cancellationReason.trim()) {
      onConfirm(booking.id, cancellationReason);
      setCancellationReason('');
    }
  };

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
              <h2 className="text-xl font-bold text-black">Confirm Cancellation</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onClose}
                className="text-black"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>
            
            <p className="text-gray-800 mb-4">
              Are you sure you want to cancel your booking for {booking.hostel?.name} (Room{' '}
              {booking.room?.roomNumber})?
            </p>

            <div className="mb-4">
              <label htmlFor="cancellationReason" className="block text-sm font-medium text-black mb-2">
                Reason for cancellation
              </label>
              <textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-200 focus:border-black text-black outline-none bg-white text-sm min-h-[80px]"
                required
              />
            </div>

            <div className="bg-gray-50 p-3 mb-4">
              <h4 className="font-medium text-black mb-2">Booking Details</h4>
              <div className="text-sm text-gray-800 space-y-1">
                <p><strong>Hostel:</strong> {booking.hostel?.name}</p>
                <p><strong>Room:</strong> {booking.room?.roomNumber}</p>
                <p><strong>Dates:</strong> {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</p>
                <p><strong>Amount Paid:</strong> GHS {booking.amountPaid}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onClose}
                className="px-4 py-2 text-black border border-gray-200 hover:bg-gray-100"
              >
                Keep Booking
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleConfirm}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};