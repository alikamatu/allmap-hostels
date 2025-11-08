'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FiMessageSquare } from 'react-icons/fi';

// Hooks
import { useReviews } from '@/hooks/useReviews';
import { useReviewFilters } from '@/hooks/useReviewFilters';

// Components
import { ReviewStats } from './ReviewStats';
import { ReviewFilters } from './ReviewFilters';
import { ReviewCard } from './ReviewCard';

interface ReviewsComponentProps {
  hostelId: string;
  hostelName: string;
}

export const ReviewsComponent = ({ hostelId, hostelName }: ReviewsComponentProps) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { filters, updateFilters } = useReviewFilters();
  
  // Pass filters to useReviews hook
  const {
    reviews,
    stats,
    loading,
    error,
    pagination,
    loadMoreReviews,
    toggleHelpfulVote,
  } = useReviews(hostelId, filters);

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

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    console.log('🔄 Filters changed:', newFilters);
    updateFilters(newFilters);
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
    <div className="space-y-8 mt-12">
      {/* Review Summary */}
      {stats && stats.totalReviews > 0 && (
        <ReviewStats stats={stats} hostelName={hostelName} />
      )}

      {/* Filters and Sort */}
      <ReviewFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        totalReviews={stats?.totalReviews || 0}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}


      {/* Reviews List */}
      {reviews.length === 0 && !loading && !error ? (
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
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                onToggleHelpful={toggleHelpfulVote}
                onToggleExpand={toggleExpandReview}
                isExpanded={expandedReviews.has(review.id)}
              />
            ))}
          </AnimatePresence>

          {/* Load More Button */}
          {pagination.page < pagination.totalPages && (
            <div className="text-center">
              <button
                onClick={loadMoreReviews}
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
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