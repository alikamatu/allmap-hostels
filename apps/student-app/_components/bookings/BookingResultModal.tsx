'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

export type BookingResult =
  | {
      kind: 'success';
      bookingId: string;
      hostelName: string;
      bookingFee: number;
      remainingBalance: number;
    }
  | {
      kind: 'failure';
      message: string;
    }
  | null;

interface BookingResultModalProps {
  result: BookingResult;
  onClose: () => void;
  onViewBookings?: () => void;
  onRetry?: () => void;
}

export function BookingResultModal({
  result,
  onClose,
  onViewBookings,
  onRetry,
}: BookingResultModalProps) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key="booking-result-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>

            {result.kind === 'success' ? (
              <SuccessContent result={result} onViewBookings={onViewBookings} onClose={onClose} />
            ) : (
              <FailureContent message={result.message} onRetry={onRetry} onClose={onClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessContent({
  result,
  onViewBookings,
  onClose,
}: {
  result: Extract<BookingResult, { kind: 'success' }>;
  onViewBookings?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="w-16 h-16 mx-auto mb-5 bg-green-50 rounded-full flex items-center justify-center"
      >
        <FiCheckCircle className="w-9 h-9 text-green-600" />
      </motion.div>

      <h2 className="text-2xl font-bold text-black mb-2">Booking Confirmed</h2>
      <p className="text-gray-600 text-sm mb-6">
        Your room at <span className="font-medium text-black">{result.hostelName}</span> is booked.
      </p>

      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2.5">
        <Row label="Booking ID" value={<span className="font-mono text-xs">{result.bookingId.slice(0, 8)}…</span>} />
        <Row label="Booking fee paid" value={<>GHS {result.bookingFee.toFixed(2)}</>} />
        <Row label="Room balance due" value={<span className="font-semibold">GHS {result.remainingBalance.toFixed(2)}</span>} />
      </div>

      <p className="text-xs text-gray-500 mb-5">
        You'll receive a confirmation email shortly. Pay the room balance before check-in to keep your booking active.
      </p>

      <div className="flex flex-col gap-2">
        {onViewBookings && (
          <button
            onClick={onViewBookings}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            View My Bookings
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-gray-500 hover:text-black text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function FailureContent({
  message,
  onRetry,
  onClose,
}: {
  message: string;
  onRetry?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="w-16 h-16 mx-auto mb-5 bg-red-50 rounded-full flex items-center justify-center"
      >
        <FiAlertTriangle className="w-9 h-9 text-red-600" />
      </motion.div>

      <h2 className="text-2xl font-bold text-black mb-2">Booking Failed</h2>
      <p className="text-gray-600 text-sm mb-6 break-words">{message}</p>

      <div className="flex flex-col gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-gray-500 hover:text-black text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
