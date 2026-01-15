// types/review.ts

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export interface DetailedRatings {
  cleanliness?: number;
  security?: number;
  location?: number;
  staff?: number;
  facilities?: number;
  valueForMoney?: number;
}

export interface Review {
  id: string;
  hostelId: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  detailedRatings?: DetailedRatings;
  status: ReviewStatus;
  helpfulVotes: string[];
  helpfulCount: number;
  images?: string[];
  adminNotes?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  hostelResponse?: string;
  hostelRespondedAt?: Date;
  createdAt: string;
  updatedAt: string;
  hostel?: Hostel;
  booking?: Booking;
}

export interface Hostel {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  adminId: string;
  images: string[];
  rating: number;
  total_reviews: number;
  accepting_bookings: boolean;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  hostelId: string;
  studentId: string;
  roomId: string;
  status: BookingStatus;
  checkedOutAt?: string;
  hostel?: Hostel;
  room?: Room;
}

export interface Room {
  id: string;
  roomNumber: string;
  hostelId: string;
}

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  reviewText: string;
  detailedRatings?: DetailedRatings;
  images?: string[];
}

export interface UpdateReviewDto {
  rating?: number;
  reviewText?: string;
  detailedRatings?: DetailedRatings;
  images?: string[];
}

export interface ReviewFilterDto {
  hostelId?: string;
  studentId?: string;
  status?: ReviewStatus;
  rating?: number | string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface HostelResponseDto {
  response: string;
}

export interface ModerateReviewDto {
  status: ReviewStatus;
  notes?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  averageDetailedRatings: Record<string, number>;
  totalHelpfulVotes: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: PaginationInfo;
}

export interface APIResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

// API service interface
export interface ReviewsAPIService {
  getHostels(): Promise<Hostel[]>;
  getHostelReviews(hostelId: string, params?: Partial<ReviewFilterDto>): Promise<ReviewsResponse>;
  getHostelReviewStats(hostelId: string): Promise<ReviewStats>;
  addHostelResponse(reviewId: string, response: string): Promise<Review>;
  getReviewById(reviewId: string): Promise<Review>;
  getReviewByBookingId(bookingId: string): Promise<{ review: Review | null }>;
  toggleHelpfulVote(reviewId: string): Promise<Review>;
  updateReview(reviewId: string, data: UpdateReviewDto): Promise<Review>;
  deleteReview(reviewId: string): Promise<void>;
  moderateReview(reviewId: string, data: ModerateReviewDto): Promise<Review>;
}

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