import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHome, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaMobileAlt, FaPen } from 'react-icons/fa';
import { Booking } from '@/types/booking';
import { formatDate, formatPrice, getStatusColor, getPaymentStatusColor, canWriteReview } from '@/utils/bookingHelpers';
import Link from 'next/link';
import { PaymentDetailsSection } from './PaymentDetailsSection';
import { ContactDetailsSection } from './ContactDetailsSection';

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onWriteReview: (booking: Booking) => void;
}

export const BookingDetailsModal = ({
  booking,
  isOpen,
  onClose,
  onCancel,
  onWriteReview,
}: BookingDetailsModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 sm:p-6 font-sans"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-lg"
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black">Booking Details</h2>
                <p className="text-gray-800">ID: {booking.id}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onClose}
                className="text-black"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>
            <hr className="border-t border-gray-200 my-4" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Booking Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-black mb-2">Booking Status</h3>
                    <span
                      className={`px-3 py-1 text-sm font-medium ${getStatusColor(booking.status)}`}
                    >
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-black mb-2">Payment Status</h3>
                    <span
                      className={`px-3 py-1 text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}
                    >
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Accommodation Details */}
                <div>
                  <h3 className="font-medium text-black mb-3">Accommodation Details</h3>
                  <hr className="border-t border-gray-200 mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-800">Hostel:</span>
                      <p className="font-medium text-black">{booking.hostel?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-800">Room:</span>
                      <p className="font-medium text-black">{booking.room?.roomNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-800">Floor:</span>
                      <p className="font-medium text-black">{booking.room?.floor || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-800">Room Type:</span>
                      <p className="font-medium text-black">{booking.room?.roomType?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-black mb-2">Check-in</h3>
                    <p className="text-gray-800">{formatDate(booking.checkInDate)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-black mb-2">Check-out</h3>
                    <p className="text-gray-800">{formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-medium text-black mb-3">Payment Information</h3>
                  <hr className="border-t border-gray-200 mb-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-800">Total Amount:</span>
                      <span className="font-medium text-black">{formatPrice(booking.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Amount Paid:</span>
                      <span className="font-medium text-black">{formatPrice(booking.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Amount Due:</span>
                      <span className="font-medium text-black">{formatPrice(booking.amountDue)}</span>
                    </div>
                    {booking.paymentDueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-800">Payment Due:</span>
                        <span className="font-medium text-black">{formatDate(booking.paymentDueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-cancellation Warning */}
                {booking.paymentRequirements && !booking.paymentRequirements.meetsRequirement && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-600 mt-0.5 flex-shrink-0">⚠️</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Payment Requirement Notice
                        </h4>
                        <p className="text-yellow-700 text-sm mb-3">
                          {booking.paymentRequirements.requirementDescription}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-yellow-700">Days Remaining:</span>
                            <p className="font-semibold text-yellow-800">
                              {booking.paymentRequirements.daysUntilAutoCancel}
                            </p>
                          </div>
                          <div>
                            <span className="text-yellow-700">Minimum Required:</span>
                            <p className="font-semibold text-yellow-800">
                              {formatPrice(booking.paymentRequirements.minimumRequired)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div>
                    <h3 className="font-medium text-black mb-3">Special Requests</h3>
                    <hr className="border-t border-gray-200 mb-4" />
                    <p className="text-gray-800 text-sm">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Emergency Contacts */}
                {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
                  <div>
                    <h3 className="font-medium text-black mb-3">Emergency Contacts</h3>
                    <hr className="border-t border-gray-200 mb-4" />
                    <div className="space-y-2">
                      {booking.emergencyContacts.map((contact, index) => (
                        <div key={index} className="text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <span className="text-gray-800">Name:</span>
                              <p className="font-medium text-black">{contact.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-800">Relationship:</span>
                              <p className="font-medium text-black">{contact.relationship}</p>
                            </div>
                            <div>
                              <span className="text-gray-800">Phone:</span>
                              <p className="font-medium text-black">{contact.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contact Details */}
                <ContactDetailsSection hostel={booking.hostel} />

                {/* Payment Details */}
                <PaymentDetailsSection hostel={booking.hostel} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              {booking.status === 'confirmed' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onCancel}
                  className="flex-1 bg-black text-white py-2 px-4 font-medium hover:bg-gray-800"
                >
                  Cancel Booking
                </motion.button>
              )}
              {canWriteReview(booking) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onWriteReview(booking)}
                  className="flex-1 bg-yellow-500 text-white py-2 px-4 font-medium hover:bg-yellow-600 flex items-center justify-center"
                >
                  <FaPen className="mr-2" />
                  Write Review
                </motion.button>
              )}
              <Link
                href={`/dashboard/hostels/${booking.hostelId}`}
                className="flex-1 bg-black text-white py-2 px-4 font-medium hover:bg-gray-800 text-center"
              >
                View Hostel
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};