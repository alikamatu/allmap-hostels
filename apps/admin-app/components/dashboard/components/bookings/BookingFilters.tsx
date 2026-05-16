"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
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
  searchInput: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<BookingFiltersState>) => void;
}

const STATUS_OPTIONS = [
  { value: 'all',                      label: 'All Status' },
  { value: BookingStatus.PENDING,      label: 'Pending' },
  { value: BookingStatus.CONFIRMED,    label: 'Confirmed' },
  { value: BookingStatus.CHECKED_IN,   label: 'Checked In' },
  { value: BookingStatus.CHECKED_OUT,  label: 'Checked Out' },
  { value: BookingStatus.CANCELLED,    label: 'Cancelled' },
];

const PAYMENT_OPTIONS = [
  { value: 'all',                  label: 'All Payments' },
  { value: PaymentStatus.PENDING,  label: 'Pending' },
  { value: PaymentStatus.PARTIAL,  label: 'Partial' },
  { value: PaymentStatus.PAID,     label: 'Paid' },
  { value: PaymentStatus.OVERDUE,  label: 'Overdue' },
];

const TYPE_OPTIONS = [
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

const SelectField = ({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-9 px-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00]"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters, hostels, searchInput, onSearchChange, onFilterChange,
}) => {
  const [panelOpen, setPanelOpen] = useState(false);

  const activeFilterCount = [
    filters.status !== 'all',
    filters.paymentStatus !== 'all',
    filters.bookingType !== 'all',
    !!filters.dateRange.from,
    !!filters.dateRange.to,
    filters.sortBy !== 'createdAt' || filters.sortOrder !== 'DESC',
  ].filter(Boolean).length;

  const clearAll = () => {
    onFilterChange({
      status: 'all',
      paymentStatus: 'all',
      bookingType: 'all',
      hostelId: hostels[0]?.id || '',
      dateRange: { from: '', to: '' },
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    onSearchChange('');
  };

  const hostelOptions = [
    { value: '', label: 'All Hostels' },
    ...hostels.map(h => ({ value: h.id, label: h.name })),
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Always-visible top row */}
      <div className="flex items-center gap-2 p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student, room…"
            value={searchInput}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00] transition"
          />
          {searchInput && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Hostel select — always visible on desktop, inside panel on mobile */}
        <div className="hidden md:block w-44">
          <select
            value={filters.hostelId}
            onChange={e => onFilterChange({ hostelId: e.target.value })}
            className="w-full h-9 px-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00]"
          >
            {hostelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          className={[
            'flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-lg border transition-colors flex-shrink-0',
            panelOpen || activeFilterCount > 0
              ? 'border-[#FF6A00] text-[#FF6A00] bg-orange-50'
              : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
          ].join(' ')}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 bg-[#FF6A00] text-white text-[10px] font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear all */}
        {(activeFilterCount > 0 || searchInput) && (
          <button
            onClick={clearAll}
            className="hidden sm:flex items-center gap-1 h-9 px-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Expandable filter panel */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 p-3 space-y-3">
              {/* Hostel (mobile only — desktop shows above) */}
              <div className="md:hidden">
                <SelectField
                  label="Hostel"
                  value={filters.hostelId}
                  onChange={v => onFilterChange({ hostelId: v })}
                  options={hostelOptions}
                />
              </div>

              {/* Status + Payment + Type row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <SelectField
                  label="Status"
                  value={filters.status}
                  onChange={v => onFilterChange({ status: v as BookingStatus | 'all' })}
                  options={STATUS_OPTIONS}
                />
                <SelectField
                  label="Payment"
                  value={filters.paymentStatus}
                  onChange={v => onFilterChange({ paymentStatus: v as PaymentStatus | 'all' })}
                  options={PAYMENT_OPTIONS}
                />
                <SelectField
                  label="Type"
                  value={filters.bookingType}
                  onChange={v => onFilterChange({ bookingType: v as BookingType | 'all' })}
                  options={TYPE_OPTIONS}
                />
                <SelectField
                  label="Sort"
                  value={filters.sortBy}
                  onChange={v => onFilterChange({ sortBy: v })}
                  options={SORT_OPTIONS}
                />
              </div>

              {/* Date range + order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />From
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={e => onFilterChange({ dateRange: { ...filters.dateRange, from: e.target.value } })}
                    className="w-full h-9 px-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />To
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={e => onFilterChange({ dateRange: { ...filters.dateRange, to: e.target.value } })}
                    className="w-full h-9 px-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={e => onFilterChange({ sortOrder: e.target.value as 'ASC' | 'DESC' })}
                    className="w-full h-9 px-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/25 focus:border-[#FF6A00]"
                  >
                    <option value="DESC">Newest First</option>
                    <option value="ASC">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Mobile clear all */}
              {(activeFilterCount > 0 || searchInput) && (
                <div className="sm:hidden">
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips (compact) */}
      {activeFilterCount > 0 && !panelOpen && (
        <div className="flex items-center gap-1.5 px-3 pb-2.5 flex-wrap">
          <Filter className="h-3 w-3 text-gray-400 flex-shrink-0" />
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
              {filters.status}
              <button onClick={() => onFilterChange({ status: 'all' })}><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {filters.paymentStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
              {filters.paymentStatus}
              <button onClick={() => onFilterChange({ paymentStatus: 'all' })}><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {filters.bookingType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
              {filters.bookingType}
              <button onClick={() => onFilterChange({ bookingType: 'all' })}><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
              Date range
              <button onClick={() => onFilterChange({ dateRange: { from: '', to: '' } })}><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingFilters;
