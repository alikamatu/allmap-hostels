'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaHome, FaMoneyBillWave, FaClock, FaEye, FaTimes, FaSpinner, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaMobileAlt, FaStar, FaPen } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { Booking, BookingStatus, BookingType, PaymentStatus } from '@/types/booking';
import { bookingService } from '@/service/bookingService';
import { reviewService } from '@/service/reviewService'; // Import the real review service
import { useAuth } from '@/context/AuthContext';
import WriteReviewModal from '@/_components/hostels/WriteReviewModal';
import { useRouter } from 'next/navigation';

interface ExtendedBooking extends Booking {
  hostel?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    SecondaryNumber: string;
    address: string;
    payment_method: 'bank' | 'momo' | 'both';
    bank_details?: {
      bank_name: string;
      account_name: string;
      account_number: string;
      branch: string;
    };
    momo_details?: {
      provider: string;
      number: string;
      name: string;
    };
  };
  hasReview?: boolean; // Track if booking has a review
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<ExtendedBooking | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

const fetchUserBookings = useCallback(async () => {
  try {
    setLoading(true);
    const bookingsData = await bookingService.getUserBookings(user.id);

    const bookingsWithReviews = await Promise.allSettled(
      bookingsData.map(async (booking) => {
        try {
          const existingReview = await reviewService.getBookingReview(booking.id);
          return {
            ...booking,
            review: existingReview // Will be null if no review exists
          };
        } catch (error) {
          console.warn(`No review found for booking: ${booking.id}`);
          return {
            ...booking,
            review: null
          };
        }
      })
    );

    const processedBookings = bookingsWithReviews
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    setBookings(processedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    setError('Failed to load your bookings. Please try again.');
  } finally {
    setLoading(false);
  }
}, [user.id]);

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
    if (!showBookingDetails && !showCancelModal && !showExtendModal && !showReviewModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBookingDetails(false);
        setShowCancelModal(false);
        setShowExtendModal(false);
        setShowReviewModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBookingDetails, showCancelModal, showExtendModal, showReviewModal]);

  const getStatusColor = useCallback((status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
      case BookingStatus.NO_SHOW:
      case BookingStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      case BookingStatus.CONFIRMED:
      case BookingStatus.CHECKED_IN:
      case BookingStatus.CHECKED_OUT:
        return 'bg-black text-white';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const handleCancelBooking = useCallback(async (bookingId: string) => {
    try {
      await bookingService.cancelBooking(bookingId, 'Cancelled by user');
      await fetchUserBookings();
      setShowBookingDetails(false);
      setShowCancelModal(false);
      //refresh page
      router.push(`/dashboard`);
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

  const handleWriteReview = useCallback((booking: ExtendedBooking) => {
    setReviewBooking(booking);
    setShowReviewModal(true);
  }, []);

  const handleSubmitReview = useCallback(async (reviewData: {
    bookingId: string;
    rating: number;
    reviewText: string;
    detailedRatings: any;
    images: string[];
  }) => {
    try {
      setSubmittingReview(true);
      // Use the real review service
      await reviewService.createReview(reviewData);
      
      // Refresh bookings to update review status
      await fetchUserBookings();
      
      // Show success message (you can implement a toast notification)
      console.log('Review submitted successfully!');
      
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setSubmittingReview(false);
    }
  }, [fetchUserBookings]);

  const canWriteReview = useCallback((booking: ExtendedBooking) => {
    return booking.status === BookingStatus.CHECKED_OUT && !booking.hasReview;
  }, []);

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

  // ... rest of your component remains the same
  // (PaymentDetailsSection, ContactDetailsSection, JSX render logic)

  const PaymentDetailsSection = ({ hostel }: { hostel: ExtendedBooking['hostel'] }) => {
    if (!hostel) return null;

    console.log('PaymentDetailsSection - hostel data:', hostel);
    console.log('Payment method:', hostel.payment_method);
    console.log('Bank details:', hostel.bank_details);
    console.log('Momo details:', hostel.momo_details);

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

    console.log('Parsed bank details:', bankDetails);
    console.log('Parsed momo details:', momoDetails);

    return (
      <div>
        <h3 className="font-medium text-black mb-3">Payment Details</h3>
        <hr className="border-t border-gray-200 mb-4" />
        
        {showBankDetails && bankDetails && (
          <div className="mb-4">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <FaCreditCard className="mr-2" />
              Bank Transfer Details
            </h4>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
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
              <div className="flex justify-between">
                <span className="text-gray-800">Branch:</span>
                <span className="font-medium text-black">{bankDetails.branch || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {showMomoDetails && momoDetails && (
          <div className="mb-4">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <FaMobileAlt className="mr-2" />
              Mobile Money Details
            </h4>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
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

        {!showBankDetails && !showMomoDetails && (
          <div className="text-gray-800 text-sm">
            No payment methods configured for this hostel.
          </div>
        )}

        {showBankDetails && !bankDetails && (
          <div className="mb-4">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <FaCreditCard className="mr-2" />
              Bank Transfer Details
            </h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-800">Bank details not configured.</p>
            </div>
          </div>
        )}

        {showMomoDetails && !momoDetails && (
          <div className="mb-4">
            <h4 className="font-medium text-black mb-2 flex items-center">
              <FaMobileAlt className="mr-2" />
              Mobile Money Details
            </h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-800">Mobile money details not configured.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ContactDetailsSection = ({ hostel }: { hostel: ExtendedBooking['hostel'] }) => {
    if (!hostel) return null;

    return (
      <div>
        <h3 className="font-medium text-black mb-3">Contact Details</h3>
        <hr className="border-t border-gray-200 mb-4" />
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <FaPhone className="text-black mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-black">{hostel.phone}</p>
              <span className="text-gray-800">Primary Contact</span>
            </div>
          </div>
          
          {hostel.SecondaryNumber && (
            <div className="flex items-start">
              <FaPhone className="text-black mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-black">{hostel.SecondaryNumber}</p>
                <span className="text-gray-800">Secondary Contact</span>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <FaEnvelope className="text-black mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-black">{hostel.email}</p>
              <span className="text-gray-800">Email Address</span>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-black mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-black">{hostel.address}</p>
              <span className="text-gray-800">Address</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] sm:h-[600px] flex items-center justify-center"
      >
        <div className="relative flex w-64 animate-pulse gap-2 p-4">
          <div className="h-12 w-12 rounded-full bg-slate-400"></div>
          <div className="flex-1">
            <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
            <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
          </div>
          <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FiAlertTriangle className="text-black text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">Error Loading Bookings</h2>
          <p className="text-gray-800 mb-4">{error}</p>
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
          <p className="text-gray-800 mb-4">Please log in to view your bookings</p>
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
      {/* Write Review Modal */}
      {reviewBooking && (
        <WriteReviewModal 
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewBooking(null);
          }}
          booking={reviewBooking}
          onSubmit={handleSubmitReview}
          loading={submittingReview}
        />
      )}

      {/* ... rest of your modals and JSX remain the same ... */}
      {/* I'm keeping the rest of your JSX as it was since the main issue was the mock service */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">My Bookings</h1>
          <p className="text-gray-800 mt-2">Manage your hostel reservations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-800">Total Bookings</p>
                <p className="text-2xl font-bold text-black">{bookings.length}</p>
              </div>
              <FaHome className="text-black text-2xl" />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-800">Active Bookings</p>
                <p className="text-2xl font-bold text-black">
                  {bookings.filter(b => [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(b.status)).length}
                </p>
              </div>
              <FaCalendarAlt className="text-black text-2xl" />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-800">Pending Payment</p>
                <p className="text-2xl font-bold text-black">
                  {bookings.filter(b => [PaymentStatus.PENDING, PaymentStatus.OVERDUE].includes(b.paymentStatus)).length}
                </p>
              </div>
              <FaMoneyBillWave className="text-black text-2xl" />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-800">Reviews to Write</p>
                <p className="text-2xl font-bold text-black">
                  {bookings.filter(b => canWriteReview(b)).length}
                </p>
              </div>
              <FaStar className="text-black text-2xl" />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <FaHome className="mx-auto text-4xl text-gray-800 mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">No Bookings Found</h3>
            <p className="text-gray-800 mb-6">You haven&apos;t made any bookings yet.</p>
            <Link
              href="/dashboard/hostels"
              className="inline-flex items-center bg-black text-white px-6 py-3 font-medium hover:bg-gray-800"
              aria-label="Find hostels"
            >
              Find Hostels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
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
                      {booking.hasReview && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
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

                    <div className="flex gap-2">
                      {canWriteReview(booking) && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleWriteReview(booking)}
                          className="bg-yellow-500 text-white px-3 py-2 font-medium hover:bg-yellow-600 flex items-center text-sm"
                          aria-label="Write review"
                        >
                          <FaPen className="mr-1" />
                          Review
                        </motion.button>
                      )}

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
        {bookings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-black mb-4">Quick Actions</h2>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800"
                aria-label="Book another room"
              >
                Book Another Room
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetchUserBookings}
                className="px-4 py-2 text-black border border-gray-200 hover:bg-gray-100"
                aria-label="Refresh bookings"
              >
                Refresh
              </motion.button>
              {bookings.filter(b => canWriteReview(b)).length > 0 && (
                <div className="px-4 py-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded">
                  <FaStar className="inline mr-2" />
                  You have {bookings.filter(b => canWriteReview(b)).length} review(s) to write
                </div>
              )}
            </div>
          </div>
        )}

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
                className="bg-white w-full max-w-md shadow-lg border"
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
                  <p className="text-gray-800 mb-6">
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
        {/* <AnimatePresence>
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
                className="bg-white w-full max-w-md shadow-lg border"
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
        </AnimatePresence> */}

        {/* Booking Details Modal */}
        <AnimatePresence>
          {showBookingDetails && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/90 z-40 flex items-center justify-center p-4 sm:p-6 font-sans"
              onClick={(e) => e.target === e.currentTarget && setShowBookingDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg border"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-black">Booking Details</h2>
                      <p className="text-gray-800">ID: {selectedBooking.id}</p>
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
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
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
                            <span className="text-gray-800">Hostel:</span>
                            <p className="font-medium text-black">{selectedBooking.hostel?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-800">Room:</span>
                            <p className="font-medium text-black">{selectedBooking.room?.roomNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-800">Floor:</span>
                            <p className="font-medium text-black">{selectedBooking.room?.floor || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-800">Room Type:</span>
                            <p className="font-medium text-black">{selectedBooking.room?.roomType?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-black mb-2">Check-in</h3>
                          <p className="text-gray-800">{formatDate(selectedBooking.checkInDate)}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-black mb-2">Check-out</h3>
                          <p className="text-gray-800">{formatDate(selectedBooking.checkOutDate)}</p>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <h3 className="font-medium text-black mb-3">Payment Information</h3>
                        <hr className="border-t border-gray-200 mb-4" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-800">Total Amount:</span>
                            <span className="font-medium text-black">{formatPrice(selectedBooking.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-800">Amount Paid:</span>
                            <span className="font-medium text-black">{formatPrice(selectedBooking.amountPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-800">Amount Due:</span>
                            <span className="font-medium text-black">{formatPrice(selectedBooking.amountDue)}</span>
                          </div>
                          {selectedBooking.paymentDueDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-800">Payment Due:</span>
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
                          <p className="text-gray-800 text-sm">{selectedBooking.specialRequests}</p>
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
                      <ContactDetailsSection hostel={selectedBooking.hostel} />

                      {/* Payment Details */}
                      <PaymentDetailsSection hostel={selectedBooking.hostel} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
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
                    {canWriteReview(selectedBooking) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleWriteReview(selectedBooking)}
                        className="flex-1 bg-yellow-500 text-white py-2 px-4 font-medium hover:bg-yellow-600 flex items-center justify-center"
                        aria-label="Write review"
                      >
                        <FaPen className="mr-2" />
                        Write Review
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}