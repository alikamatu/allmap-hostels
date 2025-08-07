import React from 'react';

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
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMaxDistanceChange,
  onResetFilters
}) => {
  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Hostels
        </label>
        <input
          type="text"
          id="search"
          placeholder="Name or location..."
          value={filters.searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (₦)
          </label>
          <input
            type="number"
            id="minPrice"
            placeholder="Min"
            min="0"
            value={filters.minPrice}
            onChange={(e) => onMinPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (₦)
          </label>
          <input
            type="number"
            id="maxPrice"
            placeholder="Max"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
            Max Distance from School
          </label>
          <span className="text-sm font-medium text-blue-600">
            {filters.maxDistance} km
          </span>
        </div>
        <input
          type="range"
          id="distance"
          min="1"
          max="50"
          value={filters.maxDistance}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <button
        onClick={onResetFilters}
        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};