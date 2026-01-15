"use client";

import { useState, useEffect, useCallback } from 'react';
import { reviewService, Review, ReviewStats } from '@/service/reviewService';
import { ReviewFilters } from './useReviewFilters';

export const useReviews = (hostelId: string, filters?: Partial<ReviewFilters>) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchReviews = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reviews with filters:', { 
        hostelId, 
        page, 
        limit, 
        filters 
      });

      const response = await reviewService.getHostelReviews(hostelId, {
        page,
        limit,
        sortBy: filters?.sortBy || 'createdAt',
        sortOrder: filters?.sortOrder || 'DESC',
        minRating: filters?.minRating,
        maxRating: filters?.maxRating,
      });
      
      console.log('✅ Reviews fetched:', {
        count: response.reviews.length,
        total: response.pagination.total
      });

      setReviews(response.reviews);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('❌ Error fetching reviews:', err);
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [hostelId, filters?.sortBy, filters?.sortOrder, filters?.minRating, filters?.maxRating]);

  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching review stats for:', hostelId);
      const reviewStats = await reviewService.getHostelReviewStats(hostelId);
      console.log('✅ Stats fetched:', reviewStats);
      setStats(reviewStats);
    } catch (err: any) {
      console.error('❌ Error fetching review stats:', err);
    }
  }, [hostelId]);

  const loadMoreReviews = useCallback(async () => {
    if (pagination.page >= pagination.totalPages) return;
    
    try {
      const nextPage = pagination.page + 1;
      const response = await reviewService.getHostelReviews(hostelId, {
        page: nextPage,
        limit: pagination.limit,
        sortBy: filters?.sortBy || 'createdAt',
        sortOrder: filters?.sortOrder || 'DESC',
        minRating: filters?.minRating,
        maxRating: filters?.maxRating,
      });
      
      setReviews(prev => [...prev, ...response.reviews]);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error loading more reviews:', err);
    }
  }, [hostelId, pagination, filters]);

  const toggleHelpfulVote = useCallback(async (reviewId: string) => {
    try {
      const updatedReview = await reviewService.toggleHelpfulVote(reviewId);
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? updatedReview : review
        )
      );
    } catch (err: any) {
      console.error('Error toggling helpful vote:', err);
    }
  }, []);

  useEffect(() => {
    if (hostelId) {
      console.log('🔄 useEffect triggered - fetching reviews and stats');
      fetchReviews();
      fetchStats();
    }
  }, [hostelId, fetchReviews, fetchStats]);

  return {
    reviews,
    stats,
    loading,
    error,
    pagination,
    fetchReviews,
    loadMoreReviews,
    toggleHelpfulVote,
    refetchReviews: () => fetchReviews(1, pagination.limit)
  };
};