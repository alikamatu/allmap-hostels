// types/review.ts

import { 
  Review, 
  ReviewStatus, 
  ReviewStats, 
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilterDto,
  ModerateReviewDto,
  ReviewsResponse,
  PaginationInfo,
  BookingStatus,
  Hostel,
  Booking,
  Room,
  HostelResponseDto,
  ReviewsAPIService
} from '@repo/types';

export { ReviewStatus, BookingStatus };
export type { 
  Review, 
  ReviewStats, 
  CreateReviewDto, 
  UpdateReviewDto, 
  ReviewFilterDto, 
  ModerateReviewDto, 
  ReviewsResponse, 
  PaginationInfo,
  Hostel, 
  Booking, 
  Room,
  HostelResponseDto,
  ReviewsAPIService
};

export interface APIResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

// Stats components props

// Component prop types
export interface StatsCardsProps {
  stats: ReviewStats;
  loading: boolean;
}

export interface RatingDistributionProps {
  distribution?: ReviewStats['ratingDistribution'];
  loading: boolean;
}

export interface ReviewCardProps {
  review: Review;
  onRespond: (review: Review) => void;
}

export interface ReviewFiltersProps {
  filters: ReviewFilterDto;
  onFiltersChange: (filters: ReviewFilterDto) => void;
  hostels: Hostel[];
}

export interface ReviewResponseModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
  loading: boolean;
}

// Hook types
export interface UseReviewsState {
  loading: boolean;
  hostels: Hostel[];
  reviews: Review[];
  stats: ReviewStats;
  selectedReview: Review | null;
  responseModalOpen: boolean;
  responseLoading: boolean;
  pagination: PaginationInfo;
  filters: ReviewFilterDto;
}

export interface UseReviewsActions {
  loadHostels: () => Promise<void>;
  loadReviews: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadCombinedStats: () => Promise<void>;
  handleRespond: (review: Review) => void;
  handleSubmitResponse: (response: string) => Promise<void>;
  handleFiltersChange: (newFilters: ReviewFilterDto) => void;
  handlePageChange: (newPage: number) => void;
  setSelectedReview: (review: Review | null) => void;
  setResponseModalOpen: (open: boolean) => void;
}