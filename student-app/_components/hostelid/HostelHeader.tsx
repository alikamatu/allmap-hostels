import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Hostel } from '@/types/hostels';
import { formatPrice } from '@/utils/formatters';
import { useReviews } from '@/hooks/useReviews';

interface HostelHeaderProps {
  hostel: Hostel;
}

export const HostelHeader = ({ hostel }: HostelHeaderProps) => {
  const startingPrice = Math.min(...hostel.roomTypes.map(rt => rt.pricePerSemester));
  
  // Use real reviews data
  const { stats, loading: reviewsLoading } = useReviews(hostel.id);

  // Use real stats if available, otherwise use hostel data (which might be mock data)
  const displayRating = stats?.averageRating || hostel.rating;
  const displayReviews = stats?.totalReviews || hostel.reviews;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <Link href="/dashboard/hostels" className="inline-flex items-center text-black hover:underline font-medium mb-4">
        Back to Hostels
      </Link>
      <h1 className="text-4xl sm:text-3xl font-bold text-black">{hostel.name}</h1>
      <span>
        {hostel.accepting_bookings ? (
          <span className="text-green-500">Accepting Bookings</span>
        ) : (
          <span className="text-red-500">Not Accepting Bookings</span>
        )}
      </span>
      <div className="flex items-center mt-2 gap-2">
        <div className="flex text-black">
          {[...Array(5)].map((_, i) => (
            <FaStar 
              key={i} 
              className={i < Math.floor(displayRating) ? 'text-yellow-400' : 'text-gray-300'} 
            />
          ))}
        </div>
        <span className="text-gray-800">
          {reviewsLoading ? (
            'Loading reviews...'
          ) : (
            <>
              {displayRating.toFixed(1)} ({displayReviews} reviews)
            </>
          )}
        </span>
      </div>
      <div className="mt-2 text-gray-800">{hostel.address}</div>
      {hostel.roomTypes[0] && (
        <div className="mt-4">
          <div className="text-lg font-bold text-black">
            {formatPrice(startingPrice)}
          </div>
          <div className="text-sm text-gray-800">Starting price per Semester</div>
        </div>
      )}
    </motion.div>
  );
};