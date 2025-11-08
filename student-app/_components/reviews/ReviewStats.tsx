import { ReviewStats as ReviewStatsType } from '@/service/reviewService';
import { FaStar } from 'react-icons/fa';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  hostelName: string;
}

export const ReviewStats = ({ stats, hostelName }: ReviewStatsProps) => {
  const renderRatingDistribution = () => {
    const { ratingDistribution, totalReviews } = stats;
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm font-medium">{rating}</span>
                <FaStar className="text-xs text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailedRatings = (detailedRatings: Record<string, number>) => {
    const ratingLabels: Record<string, string> = {
      cleanliness: 'Cleanliness',
      security: 'Security',
      location: 'Location',
      staff: 'Staff',
      facilities: 'Facilities',
      valueForMoney: 'Value for Money'
    };

    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        {Object.entries(detailedRatings).map(([key, rating]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{ratingLabels[key] || key}</span>
            {renderStars(rating)}
          </div>
        ))}
      </div>
    );
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`text-xs ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-3xl font-bold text-black mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          {renderStars(Math.round(stats.averageRating))}
          <div className="text-sm text-gray-600 mt-1">
            Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <h3 className="font-semibold text-black mb-3">Rating Distribution</h3>
          {renderRatingDistribution()}
        </div>
      </div>

      {/* Average Detailed Ratings */}
      {Object.keys(stats.averageDetailedRatings).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-black mb-3">Detailed Ratings</h3>
          {renderDetailedRatings(stats.averageDetailedRatings)}
        </div>
      )}
    </div>
  );
};