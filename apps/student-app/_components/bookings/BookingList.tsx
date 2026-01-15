import { Booking } from '@/types/booking';
import { BookingCard } from './BookingCard';

interface BookingListProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onWriteReview: (booking: Booking) => void;
}

export const BookingList = ({ 
  bookings, 
  onViewDetails, 
  onWriteReview 
}: BookingListProps) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-black mb-2">No Bookings Found</h3>
        <p className="text-gray-800 mb-6">You haven&apos;t made any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onViewDetails={onViewDetails}
          onWriteReview={onWriteReview}
        />
      ))}
    </div>
  );
};