'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookingRecord } from '@/types/booking.types';
import {
  X,
  User,
  Mail,
  Phone,
  Home,
  Bed,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  MapPin,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord | null;
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'checked_in':
        return 'text-blue-600 bg-blue-50';
      case 'checked_out':
        return 'text-purple-600 bg-purple-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-18 font-semibold text-gray-900">Booking Details</h2>
                  <p className="text-12 text-gray-500">Booking ID: {booking.id.substring(0, 8)}...</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Student Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User size={16} />
                        Student Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-11 font-medium text-gray-500">Name</div>
                          <div className="text-13 font-medium text-gray-900">{booking.studentName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              Email
                            </div>
                            <div className="text-13 text-gray-900">{booking.studentEmail}</div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Phone size={12} />
                              Phone
                            </div>
                            <div className="text-13 text-gray-900">{booking.studentPhone}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hostel Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Home size={16} />
                        Hostel Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-11 font-medium text-gray-500">Hostel Name</div>
                          <div className="text-13 font-medium text-gray-900">{booking.hostel?.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              Email
                            </div>
                            <div className="text-13 text-gray-900">{booking.hostel?.email}</div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Phone size={12} />
                              Phone
                            </div>
                            <div className="text-13 text-gray-900">{booking.hostel?.phone}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                            <MapPin size={12} />
                            Address
                          </div>
                          <div className="text-13 text-gray-900">{booking.hostel?.address}</div>
                        </div>
                      </div>
                    </div>

                    {/* Room Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bed size={16} />
                        Room Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500">Room Number</div>
                            <div className="text-13 font-medium text-gray-900">{booking.room?.roomNumber}</div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500">Floor</div>
                            <div className="text-13 text-gray-900">{booking.room?.floor}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500">Room Type</div>
                            <div className="text-13 text-gray-900">{booking.room?.roomType?.name}</div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500">Occupancy</div>
                            <div className="text-13 text-gray-900">{booking.room?.currentOccupancy}/{booking.room?.maxOccupancy}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Booking Status */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-14 font-semibold text-gray-900 mb-4">Booking Status</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-11 font-medium text-gray-500">Booking Status</div>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-1 ${getStatusColor(booking.status)}`}>
                            <span className="text-12 font-medium capitalize">
                              {booking.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-11 font-medium text-gray-500">Payment Status</div>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-1 ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            <span className="text-12 font-medium capitalize">
                              {booking.paymentStatus}
                            </span>
                          </div>
                        </div>
                        {/* <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              Created
                            </div>
                            <div className="text-13 text-gray-900">{formatDate(booking.createdAt)}</div>
                          </div>
                          {booking.confirmedAt && (
                            <div>
                              <div className="text-11 font-medium text-gray-500">Confirmed</div>
                              <div className="text-13 text-gray-900">{formatDate(booking.confirmedAt)}</div>
                            </div>
                          )}
                        </div> */}
                      </div>
                    </div>

                    {/* Dates */}
                    {/* <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={16} />
                        Dates
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              Check-in
                            </div>
                            <div className="text-13 font-medium text-gray-900">
                              {formatDate(booking.checkInDate)}
                            </div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              Check-out
                            </div>
                            <div className="text-13 font-medium text-gray-900">
                              {formatDate(booking.checkOutDate)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-11 font-medium text-gray-500">Duration</div>
                          <div className="text-13 font-semibold text-gray-900">
                            {booking.duration} days
                          </div>
                        </div>
                      </div>
                    </div> */}

                    {/* Payment Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard size={16} />
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500">Total Amount</div>
                            <div className="text-15 font-semibold text-gray-900">
                              {formatCurrency(booking.totalAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500">Booking Fee</div>
                            <div className="text-15 font-semibold text-gray-900">
                              {formatCurrency(booking.bookingFee)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-11 font-medium text-gray-500">Amount Paid</div>
                            <div className="text-15 font-semibold text-green-600">
                              {formatCurrency(booking.amountPaid)}
                            </div>
                          </div>
                          <div>
                            <div className="text-11 font-medium text-gray-500">Amount Due</div>
                            <div className="text-15 font-semibold text-red-600">
                              {formatCurrency(booking.amountDue)}
                            </div>
                          </div>
                        </div>
                        {booking.paymentReference && (
                          <div>
                            <div className="text-11 font-medium text-gray-500">Payment Reference</div>
                            <div className="text-13 text-gray-900">{booking.paymentReference}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Users size={16} />
                          Emergency Contacts
                        </h3>
                        <div className="space-y-3">
                          {booking.emergencyContacts.map((contact, index) => (
                            <div key={index} className="bg-white rounded-lg p-3">
                              <div className="text-12 font-medium text-gray-900">{contact.name}</div>
                              <div className="text-11 text-gray-500">{contact.relationship}</div>
                              <div className="text-11 text-gray-600">{contact.phone}</div>
                              {contact.email && (
                                <div className="text-11 text-gray-600">{contact.email}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Requests & Notes */}
                    {(booking.specialRequests || booking.notes) && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-14 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText size={16} />
                          Notes & Requests
                        </h3>
                        <div className="space-y-3">
                          {booking.specialRequests && (
                            <div>
                              <div className="text-11 font-medium text-gray-500">Special Requests</div>
                              <div className="text-13 text-gray-900 mt-1 p-3 bg-white rounded-lg">
                                {booking.specialRequests}
                              </div>
                            </div>
                          )}
                          {booking.notes && (
                            <div>
                              <div className="text-11 font-medium text-gray-500">Notes</div>
                              <div className="text-13 text-gray-900 mt-1 p-3 bg-white rounded-lg">
                                {booking.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-12 font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}