'use client';

import { useState } from 'react';
import {
  Calendar,
  Download,
  Filter,
  Search,
  Home,
  RefreshCw,
  AlertCircle,
  Bell,
  CalendarDays,
} from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { BookingFilters, BookingStatus } from '@/types/booking.types';
import BookingStats from '@/components/dashboard/bookings/booking-stats';
import BookingTable from '@/components/dashboard/bookings/booking-table';
import BookingsFiltersPanel from '@/components/dashboard/bookings/bookings-filters-panel';
import BookingDetailsModal from '@/components/dashboard/bookings/booking-details-modal';

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'overdue'>('all');

  const {
    bookings,
    pagination,
    loading,
    error,
    stats,
    upcomingCheckIns,
    upcomingCheckOuts,
    overdueBookings,
    refetch,
    refetchStats,
    refetchUpcoming,
    refetchOverdue,
    updateStatus,
    exportBookings,
  } = useBookings(filters);

  const handleFilterChange = (newFilters: Partial<BookingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm || undefined });
  };

  const handleExport = async () => {
    const csv = await exportBookings(filters);
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetch(filters),
      refetchStats(),
      refetchUpcoming(),
      refetchOverdue(),
    ]);
  };

  const handleStatusUpdate = async (id: string, status: BookingStatus) => {
    await updateStatus(id, status);
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const getDisplayBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingCheckIns;
      case 'overdue':
        return overdueBookings;
      default:
        return bookings;
    }
  };

  const getDisplayTitle = () => {
    switch (activeTab) {
      case 'upcoming':
        return 'Upcoming Check-ins';
      case 'overdue':
        return 'Overdue Bookings';
      default:
        return 'All Bookings';
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-20 font-semibold text-gray-900">Bookings Management</h1>
          <p className="text-12 text-gray-500">Manage hostel bookings, check-ins, and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Refresh Data"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium text-white bg-[#ff7a00] rounded-lg hover:bg-orange-600"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-600" />
            <p className="text-11 font-medium text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && <BookingStats stats={stats} />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg verified_atborder border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-11 font-medium text-gray-500">Upcoming Check-ins</div>
            <Calendar size={16} className="text-blue-600" />
          </div>
          <div className="text-20 font-semibold text-gray-900">{upcomingCheckIns.length}</div>
          <div className="text-11 text-gray-500 mt-2">Next 7 days</div>
        </div>

        <div className="bg-white p-4 rounded-lg verified_atborder border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-11 font-medium text-gray-500">Upcoming Check-outs</div>
            <CalendarDays size={16} className="text-purple-600" />
          </div>
          <div className="text-20 font-semibold text-gray-900">{upcomingCheckOuts.length}</div>
          <div className="text-11 text-gray-500 mt-2">Next 7 days</div>
        </div>

        <div className="bg-white p-4 rounded-lg verified_atborder border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-11 font-medium text-gray-500">Overdue Payments</div>
            <Bell size={16} className="text-red-600" />
          </div>
          <div className="text-20 font-semibold text-gray-900">{overdueBookings.length}</div>
          <div className="text-11 text-gray-500 mt-2">Requires attention</div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg verified_atborder border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 px-1 text-12 font-medium border-b-2 ${
                activeTab === 'all'
                  ? 'border-[#ff7a00] text-[#ff7a00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home size={14} />
                All Bookings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-3 px-1 text-12 font-medium border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-[#ff7a00] text-[#ff7a00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                Upcoming
                {upcomingCheckIns.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-10 font-medium px-2 py-0.5 rounded-full">
                    {upcomingCheckIns.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`py-3 px-1 text-12 font-medium border-b-2 ${
                activeTab === 'overdue'
                  ? 'border-[#ff7a00] text-[#ff7a00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                Overdue
                {overdueBookings.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-10 font-medium px-2 py-0.5 rounded-full">
                    {overdueBookings.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by student name, email, phone, or hostel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 text-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-11 font-medium text-[#ff7a00] hover:text-orange-700"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 text-11 font-medium rounded-lg ${
                  showFilters
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Filter size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <BookingsFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-14 font-semibold text-gray-900">{getDisplayTitle()}</h3>
            <div className="text-11 text-gray-500">
              Showing {getDisplayBookings().length} bookings
            </div>
          </div>

          {activeTab === 'all' ? (
            <BookingTable
              bookings={bookings}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => handleFilterChange({ page })}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          ) : activeTab === 'upcoming' ? (
            <BookingTable
              bookings={upcomingCheckIns}
              loading={loading}
              pagination={{ page: 1, limit: 20, total: upcomingCheckIns.length, totalPages: 1 }}
              onPageChange={() => {}}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <BookingTable
              bookings={overdueBookings}
              loading={loading}
              pagination={{ page: 1, limit: 20, total: overdueBookings.length, totalPages: 1 }}
              onPageChange={() => {}}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showBookingDetails}
        onClose={() => {
          setShowBookingDetails(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}