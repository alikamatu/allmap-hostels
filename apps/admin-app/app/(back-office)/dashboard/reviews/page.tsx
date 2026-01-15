"use client";

import { MessageCircle } from "lucide-react";
import { useState, useEffect, useCallback, JSX } from "react";
import RatingDistribution from "@/components/dashboard/components/review/RatingDistribution";
import ReviewCard from "@/components/dashboard/components/review/ReviewCard";
import ReviewFilters from "@/components/dashboard/components/review/ReviewFilters";
import StatsCards from "@/components/dashboard/components/review/StatsCards";
import ReviewResponseModal from "@/components/dashboard/components/review/ReviewResponseModal";
import {
  Review,
  ReviewStats,
  PaginationInfo,
  ReviewFilterDto,
  UseReviewsState
} from "@/types/review";
import reviewsAPI from "@/service/review";

export default function ReviewsPage(): JSX.Element {
  const [state, setState] = useState<UseReviewsState>({
    loading: true,
    hostels: [],
    reviews: [],
    stats: {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      averageDetailedRatings: {},
      totalHelpfulVotes: 0
    },
    selectedReview: null,
    responseModalOpen: false,
    responseLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      hostelId: '',
      rating: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      search: '',
      page: 1,
      limit: 10
    }
  });

  const loadHostels = useCallback(async (): Promise<void> => {
    try {
      const data = await reviewsAPI.getHostels();
      setState(prev => ({
        ...prev,
        hostels: Array.isArray(data) ? data : [],
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load hostels:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const loadReviews = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      let allReviews: Review[] = [];
      let allPagination: PaginationInfo = { 
        page: state.filters.page || 1,
        limit: state.filters.limit || 10,
        total: 0, 
        totalPages: 0 
      };

      if (state.filters.hostelId) {
        const data = await reviewsAPI.getHostelReviews(state.filters.hostelId, state.filters);
        allReviews = data.reviews || [];
        allPagination = data.pagination || allPagination;
      } else {
        const results = await Promise.allSettled(
          state.hostels.map(hostel => 
            reviewsAPI.getHostelReviews(hostel.id, { 
              ...state.filters, 
              page: 1, 
              limit: 1000 
            })
          )
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.reviews) {
            allReviews = [...allReviews, ...result.value.reviews];
          }
        });

        allReviews.sort((a, b) => {
          const sortBy = state.filters.sortBy || 'createdAt';
          const aVal = sortBy === 'createdAt' ? new Date(a[sortBy]).getTime() : a[sortBy];
          const bVal = sortBy === 'createdAt' ? new Date(b[sortBy]).getTime() : b[sortBy];
          return state.filters.sortOrder === 'ASC' ? 
            (aVal as number) - (bVal as number) : 
            (bVal as number) - (aVal as number);
        });

        const page = state.filters.page || 1;
        const limit = state.filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedReviews = allReviews.slice(startIndex, endIndex);
        
        allPagination = {
          page,
          limit,
          total: allReviews.length,
          totalPages: Math.ceil(allReviews.length / limit)
        };
        
        allReviews = paginatedReviews;
      }

      setState(prev => ({
        ...prev,
        reviews: allReviews,
        pagination: allPagination
      }));
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setState(prev => ({ ...prev, reviews: [] }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.filters, state.hostels]);

  const loadStats = useCallback(async (): Promise<void> => {
    if (!state.filters.hostelId) return;
    try {
      const data = await reviewsAPI.getHostelReviewStats(state.filters.hostelId);
      setState(prev => ({ ...prev, stats: data }));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [state.filters.hostelId]);

  const loadCombinedStats = useCallback(async (): Promise<void> => {
    try {
      const results = await Promise.allSettled(
        state.hostels.map(hostel => reviewsAPI.getHostelReviewStats(hostel.id))
      );
      
      const combinedStats = results
        .filter((result): result is PromiseFulfilledResult<ReviewStats> => 
          result.status === 'fulfilled'
        )
        .reduce((acc, result) => {
          const stat = result.value;
          return {
            totalReviews: acc.totalReviews + stat.totalReviews,
            totalHelpfulVotes: acc.totalHelpfulVotes + stat.totalHelpfulVotes,
            averageRating: 0,
            ratingDistribution: {
              1: acc.ratingDistribution[1] + stat.ratingDistribution[1],
              2: acc.ratingDistribution[2] + stat.ratingDistribution[2],
              3: acc.ratingDistribution[3] + stat.ratingDistribution[3],
              4: acc.ratingDistribution[4] + stat.ratingDistribution[4],
              5: acc.ratingDistribution[5] + stat.ratingDistribution[5],
            },
            averageDetailedRatings: {}
          };
        }, {
          totalReviews: 0,
          totalHelpfulVotes: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          averageDetailedRatings: {}
        });

      const totalRatingPoints = Object.entries(combinedStats.ratingDistribution)
        .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0);
      
      combinedStats.averageRating = combinedStats.totalReviews > 0 
        ? Math.round((totalRatingPoints / combinedStats.totalReviews) * 10) / 10
        : 0;

      setState(prev => ({ ...prev, stats: combinedStats }));
    } catch (error) {
      console.error('Failed to load combined stats:', error);
    }
  }, [state.hostels]);

  useEffect(() => {
    loadHostels();
  }, [loadHostels]);

  useEffect(() => {
    if (state.hostels.length > 0) {
      loadReviews();
    }
  }, [loadReviews, state.hostels]);

  useEffect(() => {
    if (state.filters.hostelId) {
      loadStats();
    } else if (state.hostels.length > 0) {
      loadCombinedStats();
    }
  }, [state.filters.hostelId, state.hostels, loadStats, loadCombinedStats]);

  const handleRespond = (review: Review): void => {
    setState(prev => ({
      ...prev,
      selectedReview: review,
      responseModalOpen: true
    }));
  };

  const handleSubmitResponse = async (response: string): Promise<void> => {
    if (!state.selectedReview) return;
    setState(prev => ({ ...prev, responseLoading: true }));
    try {
      await reviewsAPI.addHostelResponse(state.selectedReview.id, response);
      setState(prev => ({
        ...prev,
        responseModalOpen: false,
        selectedReview: null
      }));
      loadReviews();
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setState(prev => ({ ...prev, responseLoading: false }));
    }
  };

  const handleFiltersChange = (newFilters: ReviewFilterDto): void => {
    setState(prev => ({
      ...prev,
      filters: { ...newFilters, page: 1 }
    }));
  };

  const handlePageChange = (newPage: number): void => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, page: newPage }
    }));
  };

  const handleCloseModal = (): void => {
    setState(prev => ({
      ...prev,
      responseModalOpen: false,
      selectedReview: null
    }));
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Reviews Management</h1>
          <p className="text-xs text-gray-600">
            Monitor and respond to guest reviews to maintain excellent service and reputation across your hostels.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={state.stats} loading={state.loading && state.hostels.length === 0} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Filters and Reviews */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
              <ReviewFilters
                filters={state.filters}
                onFiltersChange={handleFiltersChange}
                hostels={state.hostels}
              />
            </div>

            {/* Reviews List */}
            <div className="bg-white border-t-4 border-t-[#FF6A00]">
              {/* Reviews Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-gray-900">
                    REVIEWS ({state.pagination.total || 0})
                  </h2>
                  <div className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1">
                    {state.filters.hostelId ? 
                      state.hostels.find(h => h.id === state.filters.hostelId)?.name || 'Selected Hostel' :
                      'All Hostels'
                    }
                  </div>
                </div>
              </div>
              
              {/* Reviews Content */}
              <div className="divide-y divide-gray-100">
                {state.loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6A00] mx-auto"></div>
                    <p className="mt-2 text-xs text-gray-500 font-medium">Loading reviews...</p>
                  </div>
                ) : state.reviews.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 font-medium">No reviews found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                      Guest reviews will appear here once they start submitting feedback for your hostels.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {state.reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onRespond={handleRespond}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {state.pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Showing {((state.pagination.page - 1) * state.pagination.limit) + 1} to{' '}
                      {Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)} of{' '}
                      {state.pagination.total} reviews
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(state.pagination.page - 1)}
                        disabled={state.pagination.page <= 1}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-150"
                      >
                        Previous
                      </button>
                      
                      {[...Array(Math.min(5, state.pagination.totalPages))].map((_, index) => {
                        const page = state.pagination.page <= 3 
                          ? index + 1 
                          : state.pagination.page + index - 2;
                        if (page <= state.pagination.totalPages) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1.5 text-xs font-medium border ${
                                page === state.pagination.page
                                  ? 'bg-[#FF6A00] border-[#FF6A00] text-white'
                                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                              } transition-colors duration-150`}
                            >
                              {page}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      {state.pagination.totalPages > 5 && state.pagination.page < state.pagination.totalPages - 2 && (
                        <span className="px-2 py-1.5 text-xs text-gray-400">...</span>
                      )}
                      
                      {state.pagination.totalPages > 5 && (
                        <button
                          onClick={() => handlePageChange(state.pagination.totalPages)}
                          className={`px-3 py-1.5 text-xs font-medium border ${
                            state.pagination.page === state.pagination.totalPages
                              ? 'bg-[#FF6A00] border-[#FF6A00] text-white'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          {state.pagination.totalPages}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handlePageChange(state.pagination.page + 1)}
                        disabled={state.pagination.page >= state.pagination.totalPages}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-150"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
            <RatingDistribution 
              distribution={state.stats.ratingDistribution} 
              loading={state.loading && state.hostels.length === 0} 
            />
          </div>
        </div>
      </div>

      <ReviewResponseModal
        review={state.selectedReview}
        isOpen={state.responseModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitResponse}
        loading={state.responseLoading}
      />
    </div>
  );
}