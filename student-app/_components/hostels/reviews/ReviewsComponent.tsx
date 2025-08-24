'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaThumbsUp, FaReply, FaFlag, FaChevronDown, FaChevronUp, FaImage } from 'react-icons/fa';
import { FiUser, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { reviewService, Review, ReviewStats } from '@/service/reviewService';

interface ReviewsComponentProps {
  hostelId: string;
  hostelName: string;
}

interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export const ReviewsComponent = ({ hostelId, hostelName }: ReviewsComponentProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID for helpful votes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub || payload.id);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Fetch review stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const reviewStats = await reviewService.getHostelReviewStats(hostelId);
        setStats(reviewStats);
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };

    fetchStats();
  }, [hostelId]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getHostelReviews(hostelId, filters);
        setReviews(response.reviews);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [hostelId, filters]);

  const loadMoreReviews = async () => {
    if (pagination.page >= pagination.totalPages) return;

    try {
      setLoadingMore(true);
      const nextFilters = { ...filters, page: filters.page! + 1 };
      const response = await reviewService.getHostelReviews(hostelId, nextFilters);
      
      setReviews(prev => [...prev, ...response.reviews]);
      setPagination(response.pagination);
      setFilters(nextFilters);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleHelpfulVote = async (reviewId: string) => {
    try {
      const updatedReview = await reviewService.toggleHelpfulVote(reviewId);
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? updatedReview : review
        )
      );
    } catch (error) {
      console.error('Error toggling helpful vote:', error);
    }
  };

  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, showNumber: boolean = false) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`text-sm ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      {showNumber && <span className="ml-2 text-sm text-gray-600">{rating}/5</span>}
    </div>
  );

  const renderRatingDistribution = () => {
    if (!stats) return null;

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

  const renderDetailedRatings = (detailedRatings?: Record<string, number>) => {
    if (!detailedRatings || Object.keys(detailedRatings).length === 0) return null;

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

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      {stats && stats.totalReviews > 0 && (
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
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">
            Reviews {stats && `(${stats.totalReviews})`}
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.minRating || ''}
            onChange={(e) => handleFilterChange({ 
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
              handleFilterChange({ sortBy, sortOrder });
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

      {/* Reviews List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {reviews.length === 0 && !loading ? (
        <div className="text-center py-12">
          <FiMessageSquare className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-black mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">
            Be the first to review {hostelName}!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Review Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="text-gray-600 text-lg" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-black">{review.studentName}</h4>
                      <span className="text-sm text-gray-500">•</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiCalendar className="text-xs" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(review.rating, true)}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-16">
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {expandedReviews.has(review.id) || review.reviewText.length <= 300
                        ? review.reviewText
                        : `${review.reviewText.substring(0, 300)}...`
                      }
                      {review.reviewText.length > 300 && (
                        <button
                          onClick={() => toggleExpandReview(review.id)}
                          className="ml-2 text-black hover:underline font-medium"
                        >
                          {expandedReviews.has(review.id) ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </p>
                  </div>

                  {/* Detailed Ratings */}
                  {renderDetailedRatings(review.detailedRatings)}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {review.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              // You can implement image modal here
                              console.log('Open image modal', image);
                            }}
                          />
                          {index === 3 && review.images.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                +{review.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hostel Response */}
                  {review.hostelResponse && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaReply className="text-gray-600 text-sm" />
                        <span className="font-medium text-gray-800">Response from {hostelName}</span>
                        {review.hostelRespondedAt && (
                          <span className="text-sm text-gray-500">
                            • {formatDate(review.hostelRespondedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.hostelResponse}
                      </p>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleHelpfulVote(review.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        currentUserId && review.helpfulVotes.includes(currentUserId)
                          ? 'text-blue-600'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <FaThumbsUp className="text-xs" />
                      Helpful ({review.helpfulCount})
                    </button>
                    
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                      <FaFlag className="text-xs" />
                      Report
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More Button */}
          {pagination.page < pagination.totalPages && (
            <div className="text-center">
              <button
                onClick={loadMoreReviews}
                disabled={loadingMore}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More Reviews'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};