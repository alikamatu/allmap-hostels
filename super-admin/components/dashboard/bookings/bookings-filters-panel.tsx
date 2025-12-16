'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookingFilters, BookingStatus, PaymentStatus, BookingType } from '@/types/booking.types';
import { X, Filter, Calendar, Search } from 'lucide-react';

interface BookingsFiltersPanelProps {
  filters: BookingFilters;
  onFilterChange: (filters: Partial<BookingFilters>) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: BookingStatus | '', label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | '', label: string }[] = [
  { value: '', label: 'All Payment Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

const BOOKING_TYPE_OPTIONS: { value: BookingType | '', label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'semester', label: 'Semester' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

export default function BookingsFiltersPanel({
  filters,
  onFilterChange,
  onClose,
}: BookingsFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<BookingFilters>>({
    status: filters.status,
    paymentStatus: filters.paymentStatus,
    bookingType: filters.bookingType,
    checkInFrom: filters.checkInFrom,
    checkInTo: filters.checkInTo,
    search: filters.search,
    overdueOnly: filters.overdueOnly,
  });

  const handleChange = (key: keyof BookingFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: undefined,
      paymentStatus: undefined,
      bookingType: undefined,
      checkInFrom: undefined,
      checkInTo: undefined,
      search: undefined,
      overdueOnly: undefined,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-14 font-medium text-gray-900">Filter Bookings</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search */}
          <div className="lg:col-span-3">
            <label className="block text-12 font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by student name, email, phone, or hostel..."
                value={localFilters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-12 font-medium text-gray-700 mb-2">
              Booking Status
            </label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleChange('status', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-12 focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-12 font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={localFilters.paymentStatus || ''}
              onChange={(e) => handleChange('paymentStatus', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-12 focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Type Filter */}
          <div>
            <label className="block text-12 font-medium text-gray-700 mb-2">
              Booking Type
            </label>
            <select
              value={localFilters.bookingType || ''}
              onChange={(e) => handleChange('bookingType', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-12 focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
            >
              {BOOKING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="lg:col-span-2">
            <label className="block text-12 font-medium text-gray-700 mb-2">
              Check-in Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={localFilters.checkInFrom || ''}
                    onChange={(e) => handleChange('checkInFrom', e.target.value || undefined)}
                    className="w-full pl-10 pr-3 py-2 text-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
                  />
                </div>
                <div className="text-11 text-gray-500 mt-1">From</div>
              </div>
              <div>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={localFilters.checkInTo || ''}
                    onChange={(e) => handleChange('checkInTo', e.target.value || undefined)}
                    className="w-full pl-10 pr-3 py-2 text-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent"
                  />
                </div>
                <div className="text-11 text-gray-500 mt-1">To</div>
              </div>
            </div>
          </div>

          {/* Overdue Only */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localFilters.overdueOnly || false}
                onChange={(e) => handleChange('overdueOnly', e.target.checked)}
                className="rounded border-gray-300 text-[#ff7a00] focus:ring-[#ff7a00]"
              />
              <span className="text-12 font-medium text-gray-700">Show Overdue Only</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-12 font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-12 font-medium text-white bg-[#ff7a00] hover:bg-orange-600 rounded-lg"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
}