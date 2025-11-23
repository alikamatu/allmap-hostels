'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import { Booking } from '@/types/booking';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/lib/hooks/useBookings';
import WriteReviewModal from '@/_components/hostels/WriteReviewModal';
import { BookingStats } from '@/_components/bookings/BookingStats';
import { BookingList } from '@/_components/bookings/BookingList';
import { QuickActions } from '@/_components/bookings/QuickActions';
import { BookingDetailsModal } from '@/_components/bookings/BookingDetailsModal';
import { CancelBookingModal } from '@/_components/bookings/CancelBookingModal';

export default function UserBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const { user } = useAuth();
  const { 
    bookings, 
    loading, 
    error, 
    fetchUserBookings, 
    cancelBooking, 
    extendBooking 
  } = useBookings();

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings();
    }
  }, [user, fetchUserBookings]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleWriteReview = (booking: Booking) => {
    setReviewBooking(booking);
    setShowReviewModal(true);
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    await cancelBooking(bookingId, reason);
    setShowCancelModal(false);
    setShowBookingDetails(false);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchUserBookings} />;
  }

  if (!user) {
    return <AuthenticationRequired />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Modals */}
      {reviewBooking && (
        <WriteReviewModal 
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewBooking(null);
          }}
          booking={reviewBooking}
          onSubmit={async (reviewData) => {
            // Handle review submission
            await fetchUserBookings();
          }}
          loading={false}
        />
      )}

      {selectedBooking && (
        <>
          <BookingDetailsModal
            booking={selectedBooking}
            isOpen={showBookingDetails}
            onClose={() => setShowBookingDetails(false)}
            onCancel={() => setShowCancelModal(true)}
            onWriteReview={handleWriteReview}
          />

          <CancelBookingModal
            booking={selectedBooking}
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelBooking}
          />
        </>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Header />
        
        <BookingStats bookings={bookings} />
        
        <BookingList
          bookings={bookings}
          onViewDetails={handleViewDetails}
          onWriteReview={handleWriteReview}
        />

        {bookings.length > 0 && (
          <QuickActions 
            bookings={bookings} 
            onRefresh={fetchUserBookings} 
          />
        )}
      </div>
    </div>
  );
}

// Supporting components for the main page
const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-[400px] sm:h-[600px] flex items-center justify-center"
  >
    <div className="relative flex w-64 animate-pulse gap-2 p-4">
      <div className="h-12 w-12 bg-slate-400"></div>
      <div className="flex-1">
        <div className="mb-1 h-5 w-3/5 bg-slate-400 text-lg"></div>
        <div className="h-5 w-[90%] bg-slate-400 text-sm"></div>
      </div>
      <div className="absolute bottom-5 right-0 h-4 w-4 bg-slate-400"></div>
    </div>
  </motion.div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <FiAlertTriangle className="text-black text-5xl mx-auto mb-4" />
      <h2 className="text-xl font-bold text-black mb-2">Error Loading Bookings</h2>
      <p className="text-gray-800 mb-4">{error}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onRetry}
        className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800"
      >
        Try Again
      </motion.button>
    </div>
  </div>
);

const AuthenticationRequired = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <h2 className="text-xl font-bold text-black mb-2">Authentication Required</h2>
      <p className="text-gray-800 mb-4">Please log in to view your bookings</p>
      <Link
        href="/auth/login"
        className="bg-black text-white px-6 py-2 font-medium hover:bg-gray-800"
      >
        Log In
      </Link>
    </div>
  </div>
);

const Header = () => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-black">My Bookings</h1>
    <p className="text-gray-800 mt-2">Manage your hostel reservations</p>
  </div>
);