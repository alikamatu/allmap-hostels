'use client';

import { AccessFilters } from '@/types/access.types';
import { X, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessFiltersPanelProps {
  filters: AccessFilters;
  onFilterChange: (filters: Partial<AccessFilters>) => void;
  onClose: () => void;
}

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'paystack', label: 'Paystack' },
  { value: 'manual_grant', label: 'Manual Grant' },
  { value: 'free_trial', label: 'Free Trial' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'upcoming', label: 'Upcoming (30 days)' },
];

export default function AccessFiltersPanel({
  filters,
  onFilterChange,
  onClose,
}: AccessFiltersPanelProps) {
  const handleSourceChange = (value: string) => {
    onFilterChange({ source: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ status: value as AccessFilters['status'] });
  };


  const handleReset = () => {
    onFilterChange({
      source: undefined,
      status: undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={14} />
            <span className="text-12 font-medium text-gray-900">Filters</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-11 font-medium text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={14} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Source Filter */}
          <div>
            <label className="block text-11 font-medium text-gray-700 mb-1">
              Access Source
            </label>
            <select
              value={filters.source || ''}
              onChange={(e) => handleSourceChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-12 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-11 font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-12 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}