import { motion } from 'framer-motion';
import { Booking } from '@/types/booking';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaClock, 
  FaEye, 
  FaPen,
  FaStar 
} from 'react-icons/fa';
import { 
  getStatusColor, 
  getPaymentStatusColor, 
  formatDate, 
  formatPrice, 
  canWriteReview 
} from '@/utils/bookingHelpers';
import { AutoCancellationWarning } from './AutoCancellationWarning';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onWriteReview: (booking: Booking) => void;
}

export const BookingCard = ({ 
  booking, 
  onViewDetails, 
  onWriteReview 
}: BookingCardProps) => {
  const progressPercentage = Math.min(
    (booking.amountPaid / booking.totalAmount) * 100, 
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-50 border hover:bg-gray-100 transition-colors"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 mb-4 lg:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-black">
              {booking.hostel?.name || 'N/A'}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus.toUpperCase()}
            </span>
            {booking.hasReview && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 flex items-center">
                <FaStar className="mr-1" />
                Reviewed
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-800">
            <div className="flex items-center">
              <FaHome className="mr-2" />
              <span>Room {booking.room?.roomNumber || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>
                {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
              </span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2" />
              <span className="capitalize">{booking.bookingType} booking</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-800">Payment Progress</span>
              <span className="font-medium text-black">
                {formatPrice(booking.amountPaid)} / {formatPrice(booking.totalAmount)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold text-black">
              {formatPrice(booking.totalAmount)}
            </p>
            {booking.amountDue > 0 && (
              <p className="text-sm text-black">
                Due: {formatPrice(booking.amountDue)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {canWriteReview(booking) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onWriteReview(booking)}
                className="bg-yellow-500 text-white px-3 py-2 font-medium hover:bg-yellow-600 flex items-center text-sm"
              >
                <FaPen className="mr-1" />
                Review
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => onViewDetails(booking)}
              className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 flex items-center"
            >
              <FaEye className="mr-2" />
              View Details
            </motion.button>
          </div>
        </div>
      </div>

      <AutoCancellationWarning booking={booking} />
    </motion.div>
  );
};