// services/reviewsAPI.ts
import { 
  Hostel, 
  Review, 
  ReviewStats, 
  ReviewsResponse, 
  ReviewFilterDto, 
  ReviewsAPIService,
  HostelResponseDto,
  ModerateReviewDto,
  UpdateReviewDto
} from '../types/review';

class ReviewsAPI implements ReviewsAPIService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // If not JSON, use the text as is
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }

  async getHostels(): Promise<Hostel[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/fetch`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Hostel[]>(response);
  }

async getHostelReviews(hostelId: string, params: Partial<ReviewFilterDto> = {}): Promise<ReviewsResponse> {
  console.log('🌐 API Call - getHostelReviews:', { hostelId, params });
  
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();

  const url = `${process.env.NEXT_PUBLIC_API_URL}/reviews/hostel/${hostelId}${queryString ? `?${queryString}` : ''}`;
  console.log('🔗 API URL:', url);
  
  const response = await fetch(url, {
    headers: this.getAuthHeaders()
  });
  
  console.log('📡 API Response status:', response.status);
  const result = await this.handleResponse<ReviewsResponse>(response);
  console.log('📝 API Response data:', result);
  
  return result;
}
  async getHostelReviewStats(hostelId: string): Promise<ReviewStats> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/hostel/${hostelId}/stats`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ReviewStats>(response);
  }

  async addHostelResponse(reviewId: string, responseText: string): Promise<Review> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/response`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ response: responseText })
    });
    return this.handleResponse<Review>(response);
  }

  async getReviewById(reviewId: string): Promise<Review> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Review>(response);
  }

  async getReviewByBookingId(bookingId: string): Promise<{ review: Review | null }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/booking/${bookingId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ review: Review | null }>(response);
  }

  async toggleHelpfulVote(reviewId: string): Promise<Review> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Review>(response);
  }

  async updateReview(reviewId: string, data: UpdateReviewDto): Promise<Review> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<Review>(response);
  }

  async deleteReview(reviewId: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  async moderateReview(reviewId: string, data: ModerateReviewDto): Promise<Review> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/moderate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<Review>(response);
  }

  // Additional utility methods
  async searchReviews(searchTerm: string, filters: Partial<ReviewFilterDto> = {}): Promise<ReviewsResponse> {
    const queryString = new URLSearchParams({
      search: searchTerm,
      ...Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
    }).toString();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/search?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ReviewsResponse>(response);
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/recent?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Review[]>(response);
  }

  async getStudentReviews(studentId: string, filters: Partial<ReviewFilterDto> = {}): Promise<ReviewsResponse> {
    const queryString = new URLSearchParams(
      Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `${process.env.NEXT_PUBLIC_API_URL}/reviews/student/${studentId}${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ReviewsResponse>(response);
  }

  async getEligibleBookingsForReview(studentId: string): Promise<{ bookingIds: string[] }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/eligible-bookings/${studentId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ bookingIds: string[] }>(response);
  }

  async canReviewBooking(bookingId: string, studentId: string): Promise<{ canReview: boolean }> {
    const response = await fetch(`/reviews/can-review/${bookingId}?studentId=${studentId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ canReview: boolean }>(response);
  }
}

// Export singleton instance
export const reviewsAPI = new ReviewsAPI();
export default reviewsAPI;