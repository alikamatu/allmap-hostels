import { useState, useCallback } from 'react';
import { Booking } from '@/types/booking';
import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/service/bookingService';
import { reviewService } from '@/service/reviewService';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const bookingsData = await bookingService.getUserBookings(user.id);

      const bookingsWithReviews = await Promise.allSettled(
        bookingsData.map(async (booking) => {
          try {
            const existingReview = await reviewService.getBookingReview(booking.id);
            return {
              ...booking,
              hasReview: !!existingReview
            };
          } catch (error) {
            return {
              ...booking,
              hasReview: false
            };
          }
        })
      );

      const processedBookings = bookingsWithReviews
        .filter((result) => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<Booking & { hasReview: boolean }>).value);

      setBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    try {
      await bookingService.cancelBooking(bookingId, reason);
      await fetchUserBookings();
    } catch (error: any) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }, [fetchUserBookings]);

  const extendBooking = useCallback(async (bookingId: string, newCheckOut: string) => {
    try {
      await bookingService.extendBooking(bookingId, newCheckOut);
      await fetchUserBookings();
    } catch (error: any) {
      throw new Error(`Failed to extend booking: ${error.message}`);
    }
  }, [fetchUserBookings]);

  return {
    bookings,
    loading,
    error,
    fetchUserBookings,
    cancelBooking,
    extendBooking,
  };
};