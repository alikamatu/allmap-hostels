"use client";

import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { Button, Input, Select } from '@repo/ui';
import { BookingStatus, PaymentStatus, BookingType } from '@/types/booking';
import { Hostel } from '@/types/hostel';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Filter Options ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all',                      label: 'All Status' },
  { value: BookingStatus.PENDING,      label: 'Pending' },
  { value: BookingStatus.CONFIRMED,    label: 'Confirmed' },
  { value: BookingStatus.CHECKED_IN,   label: 'Checked In' },
  { value: BookingStatus.CHECKED_OUT,  label: 'Checked Out' },
  { value: BookingStatus.CANCELLED,    label: 'Cancelled' },
];

const PAYMENT_OPTIONS = [
  { value: 'all',                    label: 'All Payments' },
  { value: PaymentStatus.PENDING,    label: 'Pending' },
  { value: PaymentStatus.PARTIAL,    label: 'Partial' },
  { value: PaymentStatus.PAID,       label: 'Paid' },
  { value: PaymentStatus.OVERDUE,    label: 'Overdue' },
];

const BOOKING_TYPE_OPTIONS = [
  { value: 'all',                  label: 'All Types' },
  { value: BookingType.SEMESTER,   label: 'Semester' },
  { value: BookingType.MONTHLY,    label: 'Monthly' },
  { value: BookingType.WEEKLY,     label: 'Weekly' },
];

const SORT_OPTIONS = [
  { value: 'createdAt',    label: 'Created Date' },
  { value: 'checkInDate',  label: 'Check-in Date' },
  { value: 'checkOutDate', label: 'Check-out Date' },
  { value: 'totalAmount',  label: 'Total Amount' },
  { value: 'studentName',  label: 'Student Name' },
];

const ORDER_OPTIONS = [
  { value: 'DESC', label: 'Newest First' },
  { value: 'ASC',  label: 'Oldest First' },
];

// ─── Filter Chip ─────────────────────────────────────────────────────────────

const FilterChip: React.FC<{ label: string; value: string; onClear: () => void }> = ({
  label, value, onClear,
}) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs">
    {label}: {value}
    <X className="h-3 w-3 cursor-pointer hover:text-orange-950" onClick={onClear} />
  </span>
);

// ─── Main Component ──────────────────────────────────────────────────────────

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
    <div className="bg-white border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            label="Search"
            icon={Search}
            type="text"
            placeholder="Search bookings..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="h-9 text-sm"
          />
        </div>

        {/* Hostel Filter */}
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Hostel</label>
          <Select
            value={filters.hostelId}
            onChange={(e) => onFilterChange({ hostelId: e.target.value })}
            className="h-9 text-sm"
          >
            <option value="">Select hostel</option>
            {hostels.map(hostel => (
              <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Status</label>
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as BookingStatus | 'all' })}
            className="h-9 text-sm"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Payment</label>
          <Select
            value={filters.paymentStatus}
            onChange={(e) => onFilterChange({ paymentStatus: e.target.value as PaymentStatus | 'all' })}
            className="h-9 text-sm"
          >
            {PAYMENT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        {/* Booking Type Filter */}
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Type</label>
          <Select
            value={filters.bookingType}
            onChange={(e) => onFilterChange({ bookingType: e.target.value as BookingType | 'all' })}
            className="h-9 text-sm"
          >
            {BOOKING_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Date Range and Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        {/* Date Range */}
        <div className="lg:col-span-2">
          <label className="text-sm font-medium leading-none mb-2 block">Check-in Date Range</label>
          <div className="flex gap-2 items-center">
            <Input
              icon={Calendar}
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => onFilterChange({ 
                dateRange: { ...filters.dateRange, from: e.target.value }
              })}
              className="h-9 text-sm"
            />
            <span className="text-gray-500 text-xs flex-shrink-0">to</span>
            <Input
              icon={Calendar}
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => onFilterChange({ 
                dateRange: { ...filters.dateRange, to: e.target.value }
              })}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Sort By</label>
          <Select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="h-9 text-sm"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Order</label>
          <Select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'ASC' | 'DESC' })}
            className="h-9 text-sm"
          >
            {ORDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-800 font-medium">Active filters applied</span>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {filters.search && (
                <FilterChip
                  label="Search"
                  value={filters.search}
                  onClear={() => onFilterChange({ search: '' })}
                />
              )}
              {filters.status !== 'all' && (
                <FilterChip
                  label="Status"
                  value={filters.status}
                  onClear={() => onFilterChange({ status: 'all' })}
                />
              )}
              {filters.paymentStatus !== 'all' && (
                <FilterChip
                  label="Payment"
                  value={filters.paymentStatus}
                  onClear={() => onFilterChange({ paymentStatus: 'all' })}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFilters;