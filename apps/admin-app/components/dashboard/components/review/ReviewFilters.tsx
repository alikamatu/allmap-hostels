import { Search, X } from "lucide-react";
import { ReviewFiltersProps, ReviewFilterDto } from "@/types/review";
import React from "react";

function ReviewFilters({ filters, onFiltersChange, hostels }: ReviewFiltersProps) {
  const resetFilters = () => {
    onFiltersChange({
      hostelId: "",
      rating: undefined,
      sortBy: "createdAt",
      sortOrder: "DESC",
      search: ""
    });
  };

  return (
    <div className="bg-white space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">REVIEW FILTERS</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-[#FF6A00] hover:text-[#E55E00] flex items-center transition-colors duration-150"
        >
          Reset All
          <X className="h-3 w-3 ml-1" />
        </button>
      </div>
      
      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Hostel Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            HOSTEL
          </label>
          <select
            value={filters.hostelId}
            onChange={(e) => onFiltersChange({ ...filters, hostelId: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
          >
            <option value="">All Hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Rating Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            RATING
          </label>
          <select
            value={filters.rating}
            onChange={(e) => onFiltersChange({ ...filters, rating: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        {/* Sort By Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            SORT BY
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as ReviewFilterDto["sortBy"] })}
            className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
          >
            <option value="createdAt">Date</option>
            <option value="rating">Rating</option>
            <option value="helpfulCount">Helpful Votes</option>
          </select>
        </div>
        
        {/* Order Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            ORDER
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFiltersChange({ ...filters, sortOrder: e.target.value as ReviewFilterDto["sortOrder"] })}
            className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
      </div>
      
      {/* Search Input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          SEARCH REVIEWS
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2 text-gray-400 h-3 w-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Search by review text, student name, or hostel..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(ReviewFilters);