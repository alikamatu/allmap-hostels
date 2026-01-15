"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface FilterPanelProps {
  filters: {
    searchTerm: string;
    minPrice: number | '';
    maxPrice: number | '';
    maxDistance: number;
  };
  onSearchChange: (term: string) => void;
  onMinPriceChange: (price: number | '') => void;
  onMaxPriceChange: (price: number | '') => void;
  onMaxDistanceChange: (distance: number) => void;
  onResetFilters: () => void;
  isMobileModal?: boolean;
  onCloseModal?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMaxDistanceChange,
  onResetFilters,
  isMobileModal = false,
  onCloseModal
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0. }}
      className={`${isMobileModal ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'mb-8 p-6'} bg-white font-sans`}
    >
      {isMobileModal && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Filters</h2>
          <button 
            onClick={onCloseModal}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close filters"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <label htmlFor="search" className="block text-lg font-medium text-black mb-1 leading-relaxed">
          Search Hostels
        </label>
        <input
          type="text"
          id="search"
          placeholder="Name or location..."
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition placeholder-gray-666"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <label htmlFor="minPrice" className="block text-lg font-medium text-black mb-1 leading-relaxed">
            Min Price (GH¢)
          </label>
          <input
            type="number"
            id="minPrice"
            placeholder="Min"
            min="0"
            value={filters.minPrice}
            onChange={(e) => onMinPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition placeholder-gray-666"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <label htmlFor="maxPrice" className="block text-lg font-medium text-black mb-1 leading-relaxed">
            Max Price (GH¢)
          </label>
          <input
            type="number"
            id="maxPrice"
            placeholder="Max"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition placeholder-gray-666"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="distance" className="block text-lg font-medium text-black leading-relaxed">
            Max Distance from School
          </label>
          <span className="text-base text-black">
            {filters.maxDistance} km
          </span>
        </div>
        <input
          type="range"
          id="distance"
          min="1"
          max="1000"
          value={filters.maxDistance}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200"
        />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onResetFilters}
        className="w-full py-3 px-6 bg-black text-white font-medium transition hover:bg-gray-800"
      >
        Reset Filters
      </motion.button>

      {isMobileModal && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCloseModal}
          className="w-full py-3 px-6 mt-4 bg-gray-200 text-black font-medium transition hover:bg-gray-300"
        >
          Apply Filters
        </motion.button>
      )}
    </motion.div>
  );
};