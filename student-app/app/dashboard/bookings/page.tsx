'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaHome, FaMoneyBillWave, FaClock, FaEye, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { Booking, BookingStatus, BookingType, PaymentStatus } from '@/types/booking';
import { bookingService } from '@/service/bookingService';
import { useAuth } from '@/context/AuthContext';

interface BookingFilters {
  status: BookingStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  bookingType: BookingType | 'all';
  search: string;
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    paymentStatus: 'all',
    bookingType: 'all',
    search: '',
  });
  const { user } = useAuth();

  const fetchUserBookings = useCallback(async () => {
    if (!user?.id) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userBookings = await bookingService.getUserBookings(user.id);
      console.log('User bookings response:', userBookings); // Debug log
      setBookings(
        userBookings.map((booking: any) => ({
          ...booking,
          room: booking.room
            ? {
                ...booking.room,
                roomType: booking.room.roomType
                  ? {
                      ...booking.room.roomType,
                      hostelId: booking.room.roomType.hostelId ?? '',
                      capacity: booking.room.roomType.capacity ?? 0,
                      amenities: booking.room.roomType.amenities ?? [],
                      totalRooms: booking.room.roomType.totalRooms ?? 0,
                      description: booking.room.roomType.description ?? '',
                      images: booking.room.roomType.images ?? [],
                    }
                  : undefined,
              }
            : undefined,
        }))
      );
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings();
    } else if (!user) {
      setError('Please log in to view your bookings');
      setLoading(false);
    }
  }, [user, fetchUserBookings]);

  useEffect(() => {
    if (!showBookingDetails) {
      setSelectedBooking(null);
    }
  }, [showBookingDetails]);

  // Handle Escape key for modals
  useEffect(() => {
    if (!showBookingDetails && !showCancelModal && !showExtendModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBookingDetails(false);
        setShowCancelModal(false);
        setShowExtendModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBookingDetails, showCancelModal, showExtendModal]);

  const getStatusColor = useCallback((status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
      case BookingStatus.NO_SHOW:
      case BookingStatus.CANCELLED:
        return 'bg-gray-100 text-gray-666';
      case BookingStatus.CONFIRMED:
      case BookingStatus.CHECKED_IN:
      case BookingStatus.CHECKED_OUT:
        return 'bg-black text-white';
      default:
        return 'bg-gray-100 text-gray-666';
    }
  }, []);

  const getPaymentStatusColor = useCallback((status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
      case PaymentStatus.REFUNDED:
        return 'bg-black text-white';
      case PaymentStatus.PARTIAL:
      case PaymentStatus.PENDING:
      case PaymentStatus.OVERDUE:
        return 'bg-gray-100 text-gray-666';
      default:
        return 'bg-gray-100 text-gray-666';
    }
  }, []);

  const handleCancelBooking = useCallback(async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId, 'Cancelled by user');
      await fetchUserBookings();
      setShowBookingDetails(false);
      setShowCancelModal(false);
    } catch (error: any) {
      setError(`Failed to cancel booking: ${error.message}`);
    }
  }, [fetchUserBookings]);

  const handleExtendBooking = useCallback(
    async (bookingId: string, newCheckOut: string) => {
      try {
        await bookingService.extendBooking(bookingId, newCheckOut);
        await fetchUserBookings();
        setShowBookingDetails(false);
        setShowExtendModal(false);
        setNewCheckOutDate('');
      } catch (error: any) {
        setError(`Failed to extend booking: ${error.message}`);
      }
    },
    [fetchUserBookings]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesStatus = filters.status === 'all' || booking.status === filters.status;
      const matchesPaymentStatus = filters.paymentStatus === 'all' || booking.paymentStatus === filters.paymentStatus;
      const matchesBookingType = filters.bookingType === 'all' || booking.bookingType === filters.bookingType;
      const matchesSearch =
        !filters.search ||
        (booking.hostel?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (booking.room?.roomNumber || '').toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesPaymentStatus && matchesBookingType && matchesSearch;
    });
  }, [bookings, filters]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const formatPrice = useCallback((price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-black h-12 w-12 mb-4" />
          <span className="text-gray-666">Loading your bookings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FiAlertTriangle className="text-black text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">Error Loading Bookings</h2>
          <p className="text-gray-666 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={fetchUserBookings}
            className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800"
            aria-label="Retry loading bookings"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2">Authentication Required</h2>
          <p className="text-gray-666 mb-4">Please log in to view your bookings</p>
          <Link
            href="/auth/login"
            className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800"
            aria-label="Go to login page"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
            onClick={(e) => e.target === e.currentTarget && setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md"
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black">Confirm Cancellation</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowCancelModal(false)}
                    className="text-black"
                    aria-label="Close cancel confirmation"
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>
                <p className="text-gray-666 mb-6">
                  Are you sure you want to cancel your booking for {selectedBooking.hostel?.name} (Room{' '}
                  {selectedBooking.room?.roomNumber})?
                </p>
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 text-black border-b border-gray-200 hover:bg-gray-100"
                    aria-label="Keep booking"
                  >
                    Keep Booking
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800"
                    aria-label="Confirm cancel booking"
                  >
                    Cancel Booking
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extend Booking Modal */}
      <AnimatePresence>
        {showExtendModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
            onClick={(e) => e.target === e.currentTarget && setShowExtendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md"
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black">Extend Booking</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowExtendModal(false)}
                    className="text-black"
                    aria-label="Close extend booking modal"
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>
                <label className="block text-sm font-medium text-black mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  New Check-out Date
                </label>
                <input
                  type="date"
                  value={newCheckOutDate}
                  onChange={(e) => setNewCheckOutDate(e.target.value)}
                  min={selectedBooking.checkOutDate}
                  className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                  aria-label="Select new check-out date"
                />
                <div className="flex justify-end gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowExtendModal(false)}
                    className="px-4 py-2 text-black border-b border-gray-200 hover:bg-gray-100"
                    aria-label="Cancel extend booking"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => newCheckOutDate && handleExtendBooking(selectedBooking.id, newCheckOutDate)}
                    disabled={!newCheckOutDate}
                    className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50"
                    aria-label="Confirm extend booking"
                  >
                    Extend Booking
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingDetails && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
            onClick={(e) => e.target === e.currentTarget && setShowBookingDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Booking Details</h2>
                    <p className="text-gray-666">ID: {selectedBooking.id}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setShowBookingDetails(false)}
                    className="text-black"
                    aria-label="Close booking details"
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>
                <hr className="border-t border-gray-200 my-4" />
                <div className="space-y-6">
                  {/* Booking Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-black mb-2">Booking Status</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}
                      >
                        {selectedBooking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-black mb-2">Payment Status</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                          selectedBooking.paymentStatus
                        )}`}
                      >
                        {selectedBooking.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Accommodation Details */}
                  <div>
                    <h3 className="font-medium text-black mb-3">Accommodation Details</h3>
                    <hr className="border-t border-gray-200 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-666">Hostel:</span>
                        <p className="font-medium text-black">{selectedBooking.hostel?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-666">Room:</span>
                        <p className="font-medium text-black">{selectedBooking.room?.roomNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-666">Floor:</span>
                        <p className="font-medium text-black">{selectedBooking.room?.floor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-666">Room Type:</span>
                        <p className="font-medium text-black">{selectedBooking.room?.roomType?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-black mb-2">Check-in</h3>
                      <p className="text-gray-666">{formatDate(selectedBooking.checkInDate)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-black mb-2">Check-out</h3>
                      <p className="text-gray-666">{formatDate(selectedBooking.checkOutDate)}</p>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-medium text-black mb-3">Payment Information</h3>
                    <hr className="border-t border-gray-200 mb-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-666">Total Amount:</span>
                        <span className="font-medium text-black">{formatPrice(selectedBooking.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-666">Amount Paid:</span>
                        <span className="font-medium text-black">{formatPrice(selectedBooking.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-666">Amount Due:</span>
                        <span className="font-medium text-black">{formatPrice(selectedBooking.amountDue)}</span>
                      </div>
                      {selectedBooking.paymentDueDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-666">Payment Due:</span>
                          <span className="font-medium text-black">{formatDate(selectedBooking.paymentDueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.specialRequests && (
                    <div>
                      <h3 className="font-medium text-black mb-3">Special Requests</h3>
                      <hr className="border-t border-gray-200 mb-4" />
                      <p className="text-gray-666 text-sm">{selectedBooking.specialRequests}</p>
                    </div>
                  )}

                  {/* Emergency Contacts */}
                  {selectedBooking.emergencyContacts && selectedBooking.emergencyContacts.length > 0 && (
                    <div>
                      <h3 className="font-medium text-black mb-3">Emergency Contacts</h3>
                      <hr className="border-t border-gray-200 mb-4" />
                      <div className="space-y-2">
                        {selectedBooking.emergencyContacts.map((contact, index) => (
                          <div key={index} className="text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <span className="text-gray-666">Name:</span>
                                <p className="font-medium text-black">{contact.name}</p>
                              </div>
                              <div>
                                <span className="text-gray-666">Relationship:</span>
                                <p className="font-medium text-black">{contact.relationship}</p>
                              </div>
                              <div>
                                <span className="text-gray-666">Phone:</span>
                                <p className="font-medium text-black">{contact.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    {selectedBooking.status === BookingStatus.CONFIRMED && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowCancelModal(true)}
                        className="flex-1 bg-black text-white py-2 px-4 font-medium hover:bg-gray-800"
                        aria-label="Cancel booking"
                      >
                        Cancel Booking
                      </motion.button>
                    )}
                    {selectedBooking.status === BookingStatus.CHECKED_IN && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowExtendModal(true)}
                        className="flex-1 bg-black text-white py-2 px-4 font-medium hover:bg-gray-800"
                        aria-label="Extend booking"
                      >
                        Extend Stay
                      </motion.button>
                    )}
                    <Link
                      href={`/dashboard/hostels/${selectedBooking.hostelId}`}
                      className="flex-1 bg-black text-white py-2 px-4 font-medium hover:bg-gray-800 text-center"
                      aria-label="View hostel details"
                    >
                      View Hostel
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">My Bookings</h1>
          <p className="text-gray-666 mt-2">Manage your hostel reservations</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-black mb-4">Filter Bookings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as BookingStatus | 'all' }))}
                className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                aria-label="Filter by booking status"
              >
                <option value="all">All Statuses</option>
                <option value={BookingStatus.PENDING}>Pending</option>
                <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                <option value={BookingStatus.CHECKED_IN}>Checked In</option>
                <option value={BookingStatus.CHECKED_OUT}>Checked Out</option>
                <option value={BookingStatus.CANCELLED}>Cancelled</option>
                <option value={BookingStatus.NO_SHOW}>No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value as PaymentStatus | 'all' }))}
                className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                aria-label="Filter by payment status"
              >
                <option value="all">All Payment Status</option>
                <option value={PaymentStatus.PENDING}>Pending</option>
                <option value={PaymentStatus.PARTIAL}>Partial</option>
                <option value={PaymentStatus.PAID}>Paid</option>
                <option value={PaymentStatus.OVERDUE}>Overdue</option>
                <option value={PaymentStatus.REFUNDED}>Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Booking Type</label>
              <select
                value={filters.bookingType}
                onChange={(e) => setFilters(prev => ({ ...prev, bookingType: e.target.value as BookingType | 'all' }))}
                className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                aria-label="Filter by booking type"
              >
                <option value="all">All Types</option>
                <option value={BookingType.SEMESTER}>Semester</option>
                <option value={BookingType.MONTHLY}>Monthly</option>
                <option value={BookingType.WEEKLY}>Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search hostel or room..."
                className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                aria-label="Search bookings by hostel or room"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-666">Total Bookings</p>
                <p className="text-2xl font-bold text-black">{bookings.length}</p>
              </div>
              <FaHome className="text-black text-2xl" />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-666">Active Bookings</p>
                <p className="text-2xl font-bold text-black">
                  {bookings.filter(b => [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(b.status)).length}
                </p>
              </div>
              <FaCalendarAlt className="text-black text-2xl" />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-666">Pending Payment</p>
                <p className="text-2xl font-bold text-black">
                  {bookings.filter(b => [PaymentStatus.PENDING, PaymentStatus.OVERDUE].includes(b.paymentStatus)).length}
                </p>
              </div>
              <FaMoneyBillWave className="text-black text-2xl" />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-666">Total Spent</p>
                <p className="text-2xl font-bold text-black">
                  {formatPrice(bookings.reduce((sum, b) => sum + b.amountPaid, 0))}
                </p>
              </div>
              <FaMoneyBillWave className="text-black text-2xl" />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <FaHome className="mx-auto text-4xl text-gray-666 mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">No Bookings Found</h3>
            <p className="text-gray-666 mb-6">
              {bookings.length === 0 ? "You haven't made any bookings yet." : 'No bookings match your current filters.'}
            </p>
            {bookings.length === 0 && (
              <Link
                href="/dashboard/hostels"
                className="inline-flex items-center bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
                aria-label="Find hostels"
              >
                Find Hostels
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-black">{booking.hostel?.name || 'N/A'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-666">
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
                        <span className="text-gray-666">Payment Progress</span>
                        <span className="font-medium text-black">
                          {formatPrice(booking.amountPaid)} / {formatPrice(booking.totalAmount)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((booking.amountPaid / booking.totalAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-black">{formatPrice(booking.totalAmount)}</p>
                      {booking.amountDue > 0 && (
                        <p className="text-sm text-black">Due: {formatPrice(booking.amountDue)}</p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}
                      className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 flex items-center"
                      aria-label="View booking details"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </motion.button>
                  </div>
                </div>

                {(booking.status === BookingStatus.PENDING || booking.paymentStatus === PaymentStatus.OVERDUE) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      {booking.paymentStatus === PaymentStatus.OVERDUE && (
                        <div className="flex items-center text-black text-sm">
                          <FiAlertTriangle className="mr-2" />
                          <span>Payment overdue - Please contact hostel management</span>
                        </div>
                      )}
                      {booking.status === BookingStatus.PENDING && (
                        <div className="flex items-center text-black text-sm">
                          <FaClock className="mr-2" />
                          <span>Awaiting confirmation from hostel</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {filteredBookings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-black mb-4">Quick Actions</h2>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/hostels"
                className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800"
                aria-label="Book another room"
              >
                Book Another Room
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() =>
                  setFilters({
                    status: BookingStatus.CHECKED_IN,
                    paymentStatus: 'all',
                    bookingType: 'all',
                    search: '',
                  })
                }
                className="px-4 py-2 text-black border-b border-gray-200 hover:bg-gray-100"
                aria-label="View active stays"
              >
                View Active Stays
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() =>
                  setFilters({
                    status: 'all',
                    paymentStatus: PaymentStatus.OVERDUE,
                    bookingType: 'all',
                    search: '',
                  })
                }
                className="px-4 py-2 text-black border-b border-gray-200 hover:bg-gray-100"
                aria-label="View overdue payments"
              >
                View Overdue Payments
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetchUserBookings}
                className="px-4 py-2 text-black border-b border-gray-200 hover:bg-gray-100"
                aria-label="Refresh bookings"
              >
                Refresh
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}