import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { BookingStatus, PaymentStatus, BookingType } from '@/types/booking';
import { Hostel } from '@/types/hostel';

type BookingFiltersState = {
  search: string;
  status: BookingStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  bookingType: BookingType | 'all';
  hostelId: string;
  dateRange: { from: string; to: string };
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
};

interface BookingFiltersProps {
  filters: BookingFiltersState;
  hostels: Hostel[];
  onFilterChange: (filters: Partial<BookingFiltersState>) => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters,
  hostels,
  onFilterChange,
}) => {
  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'all' || 
    filters.paymentStatus !== 'all' ||
    filters.bookingType !== 'all' ||
    filters.hostelId ||
    filters.dateRange.from ||
    filters.dateRange.to;

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      paymentStatus: 'all',
      bookingType: 'all',
      hostelId: '',
      dateRange: { from: '', to: '' },
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  };

  return (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Hostel Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostel
          </label>
          <select
            value={filters.hostelId}
            onChange={(e) => onFilterChange({ hostelId: e.target.value })}
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

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as BookingStatus | 'all' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.CHECKED_IN}>Checked In</option>
            <option value={BookingStatus.CHECKED_OUT}>Checked Out</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
            <option value={BookingStatus.NO_SHOW}>No Show</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => onFilterChange({ paymentStatus: e.target.value as PaymentStatus | 'all' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Payments</option>
            <option value={PaymentStatus.PENDING}>Pending</option>
            <option value={PaymentStatus.PARTIAL}>Partial</option>
            <option value={PaymentStatus.PAID}>Paid</option>
            <option value={PaymentStatus.OVERDUE}>Overdue</option>
            <option value={PaymentStatus.REFUNDED}>Refunded</option>
          </select>
        </div>

        {/* Booking Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={filters.bookingType}
            onChange={(e) => onFilterChange({ bookingType: e.target.value as BookingType | 'all' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value={BookingType.SEMESTER}>Semester</option>
            <option value={BookingType.MONTHLY}>Monthly</option>
            <option value={BookingType.WEEKLY}>Weekly</option>
          </select>
        </div>
      </div>

      {/* Date Range and Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Date Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date Range
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => onFilterChange({ 
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
                onChange={(e) => onFilterChange({ 
                  dateRange: { ...filters.dateRange, to: e.target.value }
                })}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="checkInDate">Check-in Date</option>
            <option value="checkOutDate">Check-out Date</option>
            <option value="totalAmount">Total Amount</option>
            <option value="studentName">Student Name</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'ASC' | 'DESC' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Active filters applied
            </span>
            <div className="flex items-center gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Search: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFilterChange({ search: '' })}
                  />
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Status: {filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFilterChange({ status: 'all' })}
                  />
                </span>
              )}
              {filters.paymentStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Payment: {filters.paymentStatus}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFilterChange({ paymentStatus: 'all' })}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFilters;