import { ReviewFilters as ReviewFiltersType } from '@/hooks/useReviewFilters';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFiltersChange: (filters: Partial<ReviewFiltersType>) => void;
  totalReviews: number;
}

export const ReviewFilters = ({ filters, onFiltersChange, totalReviews }: ReviewFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-black">
          Reviews ({totalReviews})
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.minRating || ''}
          onChange={(e) => onFiltersChange({ 
            minRating: e.target.value ? Number(e.target.value) : undefined 
          })}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>

        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
            onFiltersChange({ sortBy, sortOrder });
          }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="createdAt-DESC">Newest First</option>
          <option value="createdAt-ASC">Oldest First</option>
          <option value="rating-DESC">Highest Rated</option>
          <option value="rating-ASC">Lowest Rated</option>
          <option value="helpfulCount-DESC">Most Helpful</option>
        </select>
      </div>
    </div>
  );
};