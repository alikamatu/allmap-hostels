import { API_BASE_URL } from '@/config/api';

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  reviewText: string;
  detailedRatings?: {
    cleanliness?: number;
    security?: number;
    location?: number;
    staff?: number;
    facilities?: number;
    valueForMoney?: number;
  };
  images?: string[];
}

export interface Review {
  id: string;
  hostelId: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  detailedRatings?: {
    cleanliness?: number;
    security?: number;
    location?: number;
    staff?: number;
    facilities?: number;
    valueForMoney?: number;
  };
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  helpfulVotes: string[];
  helpfulCount: number;
  hostelResponse?: string;
  hostelRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  averageDetailedRatings: Record<string, number>;
  totalHelpfulVotes: number;
}

class ReviewService {
  private baseUrl = `${API_BASE_URL}/reviews`;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new review with optional image upload
   */
  async createReview(reviewData: CreateReviewDto): Promise<Review> {
    try {
      console.log('Creating review with data:', reviewData);
      const token = localStorage.getItem('access_token');

      const response = await this.makeRequest<Review>('', {
        method: 'POST',
        body: JSON.stringify(reviewData),
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      console.log('Review created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

// Update for the getBookingReview method in reviewService.ts

async getBookingReview(bookingId: string): Promise<Review | null> {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${this.baseUrl}/booking/${bookingId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Handle 404 responses gracefully - they mean no review exists
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Only parse as JSON if response has content
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const data = await response.json();
    // Handle the new backend response format that wraps review in an object
    return data.review || data;
  } catch (error) {
    // Handle JSON parsing errors and 404s gracefully
    if (error instanceof SyntaxError || (error instanceof Error && error.message.includes('Unexpected end of JSON input'))) {
      return null;
    }
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    console.error('Error fetching booking review:', error);
    throw error;
  }
}


  /**
   * Get reviews for a hostel
   */
  async getHostelReviews(
    hostelId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
      sortOrder?: 'ASC' | 'DESC';
      minRating?: number;
      maxRating?: number;
    } = {}
  ): Promise<{
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      return await this.makeRequest<{
        reviews: Review[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/hostel/${hostelId}?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error fetching hostel reviews:', error);
      throw error;
    }
  }

  /**
   * Get student's reviews
   */
  async getStudentReviews(
    studentId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'createdAt' | 'rating';
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      return await this.makeRequest<{
        reviews: Review[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/student/${studentId}?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error fetching student reviews:', error);
      throw error;
    }
  }

  /**
   * Get eligible bookings for review
   */
  async getEligibleBookingsForReview(studentId: string): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ bookingIds: string[] }>(
        `/eligible-bookings/${studentId}`
      );
      return response.bookingIds;
    } catch (error) {
      console.error('Error fetching eligible bookings:', error);
      throw error;
    }
  }

  /**
   * Update a review
   */
  async updateReview(
    reviewId: string,
    updateData: Partial<CreateReviewDto>
  ): Promise<Review> {
    try {
      return await this.makeRequest<Review>(`/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await this.makeRequest<void>(`/${reviewId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Toggle helpful vote on a review
   */
  async toggleHelpfulVote(reviewId: string): Promise<Review> {
    try {
      return await this.makeRequest<Review>(`/${reviewId}/helpful`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error toggling helpful vote:', error);
      throw error;
    }
  }

  /**
   * Get review statistics for a hostel
   */
  async getHostelReviewStats(hostelId: string): Promise<ReviewStats> {
    try {
      return await this.makeRequest<ReviewStats>(`/hostel/${hostelId}/stats`);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }

  /**
   * Get recent reviews
   */
  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    try {
      return await this.makeRequest<Review[]>(`/recent?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      throw error;
    }
  }

  /**
   * Search reviews
   */
  async searchReviews(
    searchTerm: string,
    options: {
      hostelId?: string;
      page?: number;
      limit?: number;
      minRating?: number;
      maxRating?: number;
    } = {}
  ): Promise<{
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchTerm);
      
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      return await this.makeRequest<{
        reviews: Review[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/search?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error searching reviews:', error);
      throw error;
    }
  }

  /**
   * Add hostel response to a review (for hostel admins)
   */
  async addHostelResponse(
    reviewId: string,
    response: string
  ): Promise<Review> {
    try {
      return await this.makeRequest<Review>(`/${reviewId}/response`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      });
    } catch (error) {
      console.error('Error adding hostel response:', error);
      throw error;
    }
  }


  /**
   * Moderate a review (for admins)
   */
  async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected' | 'flagged',
    notes?: string
  ): Promise<Review> {
    try {
      return await this.makeRequest<Review>(`/${reviewId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
      });
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  /**
   * Upload review images
   */
  async uploadReviewImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseUrl}/upload-images`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.imageUrls;
    } catch (error) {
      console.error('Error uploading review images:', error);
      throw error;
    }
  }

  /**
   * Check if student can review a booking
   */
  async canReviewBooking(bookingId: string, studentId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ canReview: boolean }>(
        `/can-review/${bookingId}?studentId=${studentId}`
      );
      return response.canReview;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return false;
    }
  }
}

export const reviewService = new ReviewService();