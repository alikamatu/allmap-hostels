import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { Booking } from '@/types/booking';
import { canWriteReview } from '@/utils/bookingHelpers';

interface QuickActionsProps {
  bookings: Booking[];
  onRefresh: () => void;
}

export const QuickActions = ({ bookings, onRefresh }: QuickActionsProps) => {
  const reviewsToWriteCount = bookings.filter(b => canWriteReview(b)).length;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-black mb-4">Quick Actions</h2>
      <hr className="border-t border-gray-200 mb-4" />
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800"
        >
          Book Another Room
        </Link>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onRefresh}
          className="px-4 py-2 text-black border border-gray-200 hover:bg-gray-100"
        >
          Refresh
        </motion.button>
        {reviewsToWriteCount > 0 && (
          <div className="px-4 py-2 bg-yellow-50 text-yellow-800 border border-yellow-200">
            <FaStar className="inline mr-2" />
            You have {reviewsToWriteCount} review(s) to write
          </div>
        )}
      </div>
    </div>
  );
};