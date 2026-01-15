"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UserFeedbackItem {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'archived';
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  type: 'user'; // Added to distinguish feedback types
}

interface PublicFeedbackItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'archived';
  created_at: string;
  updated_at: string;
  type: 'public'; // Added to distinguish feedback types
  user?: {
    id?: string;
    name?: string;
    role?: string;
  };
}

type FeedbackItem = UserFeedbackItem | PublicFeedbackItem;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  byCategory: Record<string, number>;
}

export default function AdminFeedbackDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: '',
    page: 1,
    limit: 10,
    feedbackType: 'all' as 'all' | 'user' | 'public', // Added feedback type filter
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'public'>('user'); // Tab state

  const fetchFeedbacks = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    if (!token) return;

    setLoading(true);
    try {
      let endpoint = '';
      
      // Determine which endpoint to call based on activeTab
      if (activeTab === 'user') {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/feedback/admin/all`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/feedback/admin/public/all`;
      }

      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(
        `${endpoint}?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          throw new Error('Access denied. Super admin only.');
        }
        throw new Error('Failed to fetch feedbacks');
      }

      const data = await response.json();
      
      // Add type to each feedback item
      const typedData = data.data.map((item: FeedbackItem) => ({
        ...item,
        type: activeTab
      }));
      
      setFeedbacks(typedData);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Fetch feedbacks error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, router, activeTab]);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    if (!token) return;

    try {
      // Fetch combined stats for both types
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/feedback/admin/combined-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Combine authenticated and public stats
        const combinedStats = {
          total: data.overall?.total || 0,
          pending: data.overall?.pending || 0,
          reviewed: (data.authenticated?.reviewed || 0) + (data.public?.reviewed || 0),
          resolved: (data.authenticated?.resolved || 0) + (data.public?.resolved || 0),
          byCategory: {
            ...data.authenticated?.byCategory,
            ...data.public?.byCategory
          }
        };
        
        setStats(combinedStats);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
      // Fallback to user feedback stats only
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/feedback/admin/stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (fallbackErr) {
        console.error('Fallback stats error:', fallbackErr);
      }
    }
  }, []);

  const updateStatus = async (feedbackId: string, status: FeedbackItem['status']) => {
    const token = localStorage.getItem('access_token');

    if (!token) return;

    setUpdating(feedbackId);
    try {
      // Determine which endpoint to use based on feedback type
      const selected = feedbacks.find(f => f.id === feedbackId);
      const isPublicFeedback = selected?.type === 'public';
      
      const endpoint = isPublicFeedback
        ? `${process.env.NEXT_PUBLIC_API_URL}/feedback/admin/public/${feedbackId}/status`
        : `${process.env.NEXT_PUBLIC_API_URL}/feedback/admin/${feedbackId}/status`;

      const response = await fetch(
        endpoint,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            adminNotes: adminNotes || undefined,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      // Refresh data
      fetchFeedbacks();
      fetchStats();
      setSelectedFeedback(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [user, fetchFeedbacks, fetchStats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500';
      case 'reviewed': return 'text-blue-500';
      case 'resolved': return 'text-green-500';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-50';
      case 'reviewed': return 'bg-blue-50';
      case 'resolved': return 'bg-green-50';
      case 'archived': return 'bg-gray-50';
      default: return 'bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'text-red-600';
      case 'feature': return 'text-purple-600';
      case 'support': return 'text-blue-600';
      default: return 'text-gray-700';
    }
  };

  const handleTabChange = (tab: 'user' | 'public') => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, page: 1 })); // Reset to page 1 when changing tabs
  };


  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Feedback Dashboard</h1>
          <p className="text-gray-600">Manage and review all user feedback</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6">
            <div className="text-2xl font-light text-gray-900 mb-1">{stats?.total || 0}</div>
            <div className="text-sm text-gray-500">Total Feedback</div>
          </div>
          <div className="bg-white p-6">
            <div className="text-2xl font-light text-orange-500 mb-1">{stats?.pending || 0}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-6">
            <div className="text-2xl font-light text-blue-500 mb-1">{stats?.reviewed || 0}</div>
            <div className="text-sm text-gray-500">Reviewed</div>
          </div>
          <div className="bg-white p-6">
            <div className="text-2xl font-light text-green-500 mb-1">{stats?.resolved || 0}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('user')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'user'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registered Users Feedback
            </button>
            <button
              onClick={() => handleTabChange('public')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'public'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Public Feedback
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="feedback">Feedback</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder={activeTab === 'user' ? "Search subject or message..." : "Search name, email, subject or message..."}
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: 'all',
                  category: 'all',
                  search: '',
                  page: 1,
                  limit: 10,
                  feedbackType: 'all',
                })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {activeTab === 'user' ? 'registered user' : 'public'} feedback found
            </div>
          ) : (
            <>
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-6 border-b border-gray-100 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {feedback.subject}
                        </h3>
                        <span className={`px-3 py-1 text-xs ${getStatusBg(feedback.status)} ${getStatusColor(feedback.status)}`}>
                          {feedback.status}
                        </span>
                        <span className={`text-xs ${getCategoryColor(feedback.category)}`}>
                          {feedback.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                          {feedback.type === 'user' ? 'Registered User' : 'Public'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 whitespace-pre-line">
                        {feedback.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div>
                          {feedback.type === 'user' ? (
                            <>
                              <span className="font-medium">{feedback.user?.name}</span>
                              <span className="mx-1">·</span>
                              <span>{feedback.user?.email}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{feedback.name}</span>
                              <span className="mx-1">·</span>
                              <span>{feedback.email}</span>
                              {feedback.user && (
                                <span className="ml-2 text-xs text-orange-500">
                                  (Registered User)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div>
                          <span>Submitted: {formatDate(feedback.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setSelectedFeedback(feedback)}
                        className="px-4 py-2 text-sm bg-white text-orange-500 hover:bg-orange-50 transition-colors"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 flex justify-between items-center border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                {Math.min(filters.page * filters.limit, pagination.total)} of{' '}
                {pagination.total} feedbacks
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-orange-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.totalPages}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-orange-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update Feedback Status
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>Subject:</strong> {selectedFeedback.subject}
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Admin Notes (Optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
                className="w-full px-3 py-2 bg-white text-gray-900 border-b border-gray-300 focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['pending', 'reviewed', 'resolved', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(selectedFeedback.id, status)}
                  disabled={updating === selectedFeedback.id}
                  className={`px-4 py-2 text-sm ${selectedFeedback.status === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedFeedback(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}