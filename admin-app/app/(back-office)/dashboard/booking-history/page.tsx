"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Calendar,
  User,
  Eye,
  Filter,
  X,
  Search,
  Archive,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { Hostel } from '@/types/hostel';
import { useBookings } from '@/hooks/useBookings';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { exportToExcel } from '@/utils/export';
import BookingDetailsModal from '@/components/dashboard/components/bookings/BookingDetailsModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface HistoryFilters {
  search: string;
  status: BookingStatus[] | 'all'; // Changed to support array
  hostelId: string;
  dateRange: {
    from: string;
    to: string;
  };
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

const getStatusBadge = (status: BookingStatus) => {
  const variants: Record<BookingStatus, string> = {
    [BookingStatus.CHECKED_OUT]: 'bg-gray-100 text-gray-800 border-gray-200',
    [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
    [BookingStatus.NO_SHOW]: 'bg-orange-100 text-orange-800 border-orange-200',
    [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BookingStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BookingStatus.CHECKED_IN]: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const getPaymentStatusBadge = (status: PaymentStatus) => {
  const variants = {
    [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PaymentStatus.PARTIAL]: 'bg-orange-100 text-orange-800',
    [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
    [PaymentStatus.OVERDUE]: 'bg-red-100 text-red-800',
    [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default function BookingHistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>({
    search: '',
    status: 'all',
    hostelId: '',
    dateRange: { from: '', to: '' },
    sortBy: 'updatedAt',
    sortOrder: 'DESC'
  });

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const pageSize = 20;

  // Fetch hostels on mount
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/hostels/fetch`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHostels(data);
        }
      } catch (error) {
        console.error('Failed to fetch hostels:', error);
      }
    };
    
    fetchHostels();
  }, []);

const fetchHistoryBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Fix: Handle multiple statuses correctly
      if (filters.status === 'all') {
        // Use excludeStatuses to get all except active ones
        params.append('excludeStatuses', BookingStatus.PENDING);
        params.append('excludeStatuses', BookingStatus.CONFIRMED);
        params.append('excludeStatuses', BookingStatus.CHECKED_IN);
      } else if (Array.isArray(filters.status)) {
        filters.status.forEach(status => params.append('status', status));
      } else {
        params.append('status', filters.status);
      }

      // Add other filters
      if (filters.search) params.append('search', filters.search);
      if (filters.hostelId) params.append('hostelId', filters.hostelId);
      if (filters.dateRange.from) params.append('checkInFrom', filters.dateRange.from);
      if (filters.dateRange.to) params.append('checkInTo', filters.dateRange.to);

      const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistoryBookings(data.bookings || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 });
      } else {
        console.error('Failed to fetch bookings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch history bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);


  // Fetch bookings when filters change
  useEffect(() => {
    fetchHistoryBookings();
  }, [fetchHistoryBookings]);

  const handleFilterChange = useCallback((newFilters: Partial<HistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const params = new URLSearchParams({
        page: '1',
        limit: '1000',
        status: BookingStatus.CHECKED_OUT,
      });
      params.append('status', BookingStatus.CANCELLED);
      
      if (filters.search) params.append('search', filters.search);
      if (filters.hostelId) params.append('hostelId', filters.hostelId);
      if (filters.dateRange.from) params.append('checkInFrom', filters.dateRange.from);
      if (filters.dateRange.to) params.append('checkInTo', filters.dateRange.to);

      const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const historyBookings = data.bookings.filter((booking: Booking) => 
          booking.status === BookingStatus.CHECKED_OUT || 
          booking.status === BookingStatus.CANCELLED ||
          booking.status === BookingStatus.NO_SHOW
        );

        exportToExcel(historyBookings, 'booking-history', [
          { key: 'id', label: 'Booking ID' },
          { key: 'studentName', label: 'Student Name' },
          { key: 'studentEmail', label: 'Email' },
          { key: 'hostel.name', label: 'Hostel' },
          { key: 'room.roomNumber', label: 'Room' },
          { key: 'status', label: 'Status' },
          { key: 'paymentStatus', label: 'Payment Status' },
          { key: 'totalAmount', label: 'Total Amount' },
          { key: 'amountPaid', label: 'Amount Paid' },
          { key: 'checkInDate', label: 'Check-in Date' },
          { key: 'checkOutDate', label: 'Check-out Date' },
          { key: 'checkedInAt', label: 'Checked In At' },
          { key: 'checkedOutAt', label: 'Checked Out At' },
          { key: 'cancelledAt', label: 'Cancelled At' },
          { key: 'cancellationReason', label: 'Cancellation Reason' },
          { key: 'createdAt', label: 'Created At' }
        ]);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

    const renderStatusFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status
      </label>
      <select
        value={filters.status === 'all' ? 'all' : 
               Array.isArray(filters.status) ? filters.status[0] || 'all' : filters.status}
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'all') {
            handleFilterChange({ status: 'all' });
          } else {
            handleFilterChange({ status: [value as BookingStatus] });
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All History</option>
        <option value={BookingStatus.CHECKED_OUT}>Checked Out</option>
        <option value={BookingStatus.CANCELLED}>Cancelled</option>
        <option value={BookingStatus.NO_SHOW}>No Show</option>
      </select>
    </div>
  );

  const hasActiveFilters = 
    filters.search || 
    (filters.status !== 'all' && 
     (!Array.isArray(filters.status) || filters.status.length > 0)) ||
    filters.hostelId ||
    filters.dateRange.from ||
    filters.dateRange.to;

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      hostelId: '',
      dateRange: { from: '', to: '' },
      sortBy: 'updatedAt',
      sortOrder: 'DESC'
    });
    setCurrentPage(1);
  };

  const openDetailsModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
            <p className="text-gray-600 mt-1">
              View completed and cancelled bookings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export History
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total History</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historyBookings.filter(b => b.status === BookingStatus.CHECKED_OUT).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historyBookings.filter(b => b.status === BookingStatus.CANCELLED).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No Shows</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historyBookings.filter(b => b.status === BookingStatus.NO_SHOW).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    handleFilterChange({ status: 'all' });
                  } else {
                    handleFilterChange({ status: [value as BookingStatus] });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All History</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Hostel Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostel
              </label>
              <select
                value={filters.hostelId}
                onChange={(e) => handleFilterChange({ hostelId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Hostels</option>
                {hostels.map(hostel => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'ASC' | 'DESC' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range (Check-in)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => handleFilterChange({ 
                      dateRange: { ...filters.dateRange, from: e.target.value }
                    })}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <span className="self-center text-gray-500">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => handleFilterChange({ 
                      dateRange: { ...filters.dateRange, to: e.target.value }
                    })}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Active filters applied
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Search: {filters.search}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange({ search: '' })}
                      />
                    </span>
                  )}
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Status: {Array.isArray(filters.status)
                        ? filters.status.map(s => s.replace('_', ' ')).join(', ')
                        : (filters.status as string).replace('_', ' ')}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange({ status: 'all' })}
                      />
                    </span>
                  )}
                  {filters.hostelId && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Hostel: {hostels.find(h => h.id === filters.hostelId)?.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange({ hostelId: '' })}
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking history...</p>
            </div>
          ) : historyBookings.length === 0 ? (
            <div className="p-8 text-center">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No booking history found</h3>
              <p className="text-gray-500">No completed or cancelled bookings match your current filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accommodation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stay Period
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
                              <div className="text-sm text-gray-500">{booking.studentEmail}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.hostel?.name}</div>
                          <div className="text-sm text-gray-500">Room {booking.room?.roomNumber}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</div>
                              <div className="text-sm text-gray-500">{formatDate(booking.checkOutDate)}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(booking.totalAmount)}</div>
                          <div className="text-sm text-green-600">
                            Paid: {formatCurrency(booking.amountPaid)}
                          </div>
                          {booking.amountDue > 0 && (
                            <div className="text-sm text-red-600">
                              Due: {formatCurrency(booking.amountDue)}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.status === BookingStatus.CHECKED_OUT && booking.checkedOutAt
                              ? formatDate(booking.checkedOutAt)
                              : booking.status === BookingStatus.CANCELLED && booking.cancelledAt
                              ? formatDate(booking.cancelledAt)
                              : formatDate(booking.updatedAt)
                            }
                          </div>
                          {booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
                            <div className="text-sm text-gray-500 truncate max-w-32" title={booking.cancellationReason}>
                              {booking.cancellationReason}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openDetailsModal(booking)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * pagination.limit, pagination.total)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, currentPage - 2) + i;
                          if (pageNum > pagination.totalPages) return null;
                          
                          const isCurrentPage = pageNum === currentPage;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                isCurrentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                          disabled={currentPage === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal
            isOpen={showDetailsModal}
            onClose={closeDetailsModal}
            booking={selectedBooking}
            onPayment={() => {}} // Disabled for history
            onCheckIn={() => {}} // Disabled for history
            onCheckOut={() => {}} // Disabled for history
          />
        )}
      </div>
    </div>
  );
}