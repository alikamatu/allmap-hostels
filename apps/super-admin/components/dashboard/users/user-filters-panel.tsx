'use client';

import { useState } from 'react';
import { UserFilters } from '@/types/user.types';
import { motion } from 'framer-motion';

interface UserFiltersPanelProps {
  filters: UserFilters;
  onFilterChange: (filters: Partial<UserFilters>) => void;
  onClose: () => void;
}

export default function UserFiltersPanel({ filters, onFilterChange, onClose }: UserFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<Partial<UserFilters>>(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      role: undefined,
      status: undefined,
      is_verified: undefined,
      school_id: undefined,
      search: undefined,
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
      className="mt-4 pt-4 border-t border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role Filter */}
        <div>
          <label className="block text-11 font-medium text-gray-700 mb-1">Role</label>
          <select
            value={localFilters.role || ''}
            onChange={(e) => setLocalFilters(prev => ({ 
              ...prev, 
              role: (e.target.value || undefined) as UserFilters['role']
            }))}
            className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="hostel_admin">Hostel Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-11 font-medium text-gray-700 mb-1">Status</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters(prev => ({ 
              ...prev, 
              status: (e.target.value || undefined) as UserFilters['status']
            }))}
            className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* Verification Filter */}
        <div>
          <label className="block text-11 font-medium text-gray-700 mb-1">Verification</label>
          <select
            value={localFilters.is_verified === undefined ? '' : localFilters.is_verified ? 'true' : 'false'}
            onChange={(e) => setLocalFilters(prev => ({ 
              ...prev, 
              is_verified: e.target.value === '' ? undefined : e.target.value === 'true' 
            }))}
            className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-11 font-medium text-gray-700 hover:bg-gray-100"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-11 font-medium bg-[#ff7a00] text-white hover:bg-orange-600"
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
}