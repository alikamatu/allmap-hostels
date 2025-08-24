"use client";

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Calendar, 
  User, 
  Filter, 
  Eye, 
  EyeOff, 
  Edit3, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Send,
  X,
  Search,
  ChevronDown,
  MoreVertical,

} from 'lucide-react';

// Types based on your API
interface DetailedRatings {
  cleanliness?: number;
  security?: number;
  location?: number;
  staff?: number;
  facilities?: number;
  valueForMoney?: number;
}

interface Review {
  id: string;
  hostelId: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  detailedRatings: DetailedRatings;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  helpfulCount: number;
  images: string[];
  adminNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  hostelResponse?: string;
  hostelRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
  hostel?: any;
  booking?: any;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  averageDetailedRatings: DetailedRatings;
  totalHelpfulVotes: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: PaginationInfo;
}

export default function ReviewsPage() {
  // State management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    minRating: '',
    maxRating: '',
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC' as 'ASC' | 'DESC'
  });

  // Modal states
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get user info and find their hostel
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      // First, let's get the user profile to understand their role and ID
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data:', userData);

        // Now try to find hostels where this user is the admin
        const hostelResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/fetch`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (hostelResponse.ok) {
          const hostelsData = await hostelResponse.json();
          console.log('Hostels data:', hostelsData);
          
          // If hostelsData is an array, find the hostel where the user is the admin
          let userHostel = null;
          if (Array.isArray(hostelsData)) {
            userHostel = hostelsData.find(hostel => hostel.adminId === userData.id);
          } else if (hostelsData.adminId === userData.id) {
            // If it's a single hostel object
            userHostel = hostelsData;
          }

          if (userHostel) {
            const finalUserData = { ...userData, hostelId: userHostel.id, hostel: userHostel };
            console.log('Final user data with hostel:', finalUserData);
            setUser(finalUserData);
            return finalUserData;
          } else {
            // If no hostel found, try alternative approach - maybe the API returns hostels differently
            // Let's try getting all reviews and see if we can infer the hostel
            console.warn('No hostel found for admin ID:', userData.id);
            setError('No hostel found for your account. Please ensure you are logged in as a hostel administrator.');
            setLoading(false);
            return;
          }
        } else {
          console.error('Failed to fetch hostels:', hostelResponse.status, await hostelResponse.text());
          throw new Error('Failed to fetch hostel information');
        }
      } else {
        console.error('Failed to fetch user profile:', userResponse.status, await userResponse.text());
        throw new Error('Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(`Failed to fetch user information: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Alternative approach - try to get reviews for all hostels and let backend filter
  const fetchAllReviews = async () => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('Attempting to fetch all reviews...');
      const queryParams = new URLSearchParams();
      
      // Don't specify hostelId - let the backend determine based on user
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxRating) queryParams.append('maxRating', filters.maxRating);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Reviews response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reviews API error:', errorText);
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
      }

      const data: ReviewsResponse = await response.json();
      console.log('Reviews data:', data);
      setReviews(data.reviews || []);

      // If we got reviews, try to get the hostel ID from the first review
      if (data.reviews && data.reviews.length > 0) {
        const firstReview = data.reviews[0];
        if (firstReview.hostelId) {
          fetchStats(firstReview.hostelId);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // API functions
  const fetchReviews = async (hostelId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      console.log('Fetching reviews for hostel:', hostelId);
      const queryParams = new URLSearchParams();
      
      queryParams.append('hostelId', hostelId);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.maxRating) queryParams.append('maxRating', filters.maxRating);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());
      queryParams.append('sortBy', filters.sortBy);
      queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Reviews response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reviews API error:', errorText);
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
      }

      const data: ReviewsResponse = await response.json();
      console.log('Reviews data:', data);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (hostelId: string) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      console.log('Fetching stats for hostel:', hostelId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/hostel/${hostelId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Stats response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats API error:', errorText);
        // Don't throw error for stats, just log it
        return;
      }

      const data: ReviewStats = await response.json();
      console.log('Stats data:', data);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Don't throw error for stats
    }
  };

  const addResponse = async (reviewId: string, response: string) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add response: ${errorText}`);
      }

      const updatedReview: Review = await res.json();
      
      // Update reviews list
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? updatedReview : r
      ));

      setShowResponseModal(false);
      setResponseText('');
      setSelectedReview(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add response');
    } finally {
      setSubmitting(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing data...');
      
      // Try the user profile approach first
      const userData = await fetchUserProfile();
      
      if (userData && userData.hostelId) {
        console.log('User data loaded, fetching reviews...');
        await Promise.all([
          fetchReviews(userData.hostelId),
          fetchStats(userData.hostelId)
        ]);
      } else {
        // Fallback - try to fetch all reviews
        console.log('No user hostel found, trying alternative approach...');
        await fetchAllReviews();
      }
    };

    initializeData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (user && user.hostelId) {
      console.log('Filters changed, refetching reviews...');
      fetchReviews(user.hostelId);
    }
  }, [filters, user]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'flagged': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'flagged': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchUserProfile();
                  }}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border rounded-lg p-3 text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>User: {user ? 'Loaded' : 'Not loaded'}</p>
          <p>User Hostel ID: {user?.hostelId || 'None'}</p>
          <p>Reviews Count: {reviews.length}</p>
          <p>Loading: {loading.toString()}</p>
          <p>Error: {error || 'None'}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Helpful Votes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHelpfulVotes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="createdAt">Date</option>
              <option value="rating">Rating</option>
              <option value="helpfulCount">Helpful Votes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'ASC' | 'DESC', page: 1 }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{review.studentName}</h3>
                    {renderStars(review.rating)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(review.status)}`}>
                      {getStatusIcon(review.status)}
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{review.reviewText}</p>

                  {/* Detailed Ratings */}
                  {review.detailedRatings && Object.keys(review.detailedRatings).length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detailed Ratings:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(review.detailedRatings).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium">{value}/5</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Images:</p>
                      <div className="flex gap-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hostel Response */}
                  {review.hostelResponse && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Your Response</span>
                        <span className="text-xs text-blue-600">
                          {formatDate(review.hostelRespondedAt!)}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">{review.hostelResponse}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {review.helpfulCount} helpful votes
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!review.hostelResponse && review.status === 'approved' && (
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setShowResponseModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Respond
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.status !== 'all' || filters.search || filters.minRating
              ? 'Try adjusting your filters'
              : 'Reviews will appear here once students start reviewing your hostel'}
          </p>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Respond to Review</h3>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Review by {selectedReview.studentName}:</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                  </div>
                  <p className="text-sm text-gray-700">{selectedReview.reviewText}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a professional response to this review..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => addResponse(selectedReview.id, responseText)}
                disabled={!responseText.trim() || submitting}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}