"use client";

import React from "react";
import { FiX, FiSearch, FiRotateCcw, FiSliders } from "react-icons/fi";

interface FilterPanelProps {
  filters: {
    searchTerm: string;
    minPrice: number | "";
    maxPrice: number | "";
    maxDistance: number;
  };
  onSearchChange: (term: string) => void;
  onMinPriceChange: (price: number | "") => void;
  onMaxPriceChange: (price: number | "") => void;
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
  onCloseModal,
}) => {
  return (
    <div
      className={
        isMobileModal
          ? "p-5 bg-white font-sans max-h-[85vh] overflow-y-auto"
          : "p-5 bg-white border border-gray-200/90 rounded-2xl shadow-sm font-sans"
      }
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FiSliders className="w-4 h-4 text-black" />
          <h2 className="text-base font-bold text-black tracking-tight">
            Filter Hostels
          </h2>
        </div>
        {isMobileModal ? (
          <button
            type="button"
            onClick={onCloseModal}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close filters"
          >
            <FiX className="w-5 h-5 text-gray-700" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors"
          >
            <FiRotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-5">
        <label
          htmlFor="search"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
        >
          Search Hostels
        </label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="search"
            placeholder="Hostel name, area, landmark..."
            value={filters.searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm text-black bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-black rounded-xl outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
          Price Range (GH¢ / Sem)
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="block text-[11px] text-gray-500 mb-1">
              Min Price
            </span>
            <input
              type="number"
              id="minPrice"
              placeholder="e.g. 1000"
              min="0"
              value={filters.minPrice}
              onChange={(e) =>
                onMinPriceChange(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full px-3 py-2 text-sm text-black bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-black rounded-xl outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <span className="block text-[11px] text-gray-500 mb-1">
              Max Price
            </span>
            <input
              type="number"
              id="maxPrice"
              placeholder="e.g. 5000"
              min="0"
              value={filters.maxPrice}
              onChange={(e) =>
                onMaxPriceChange(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full px-3 py-2 text-sm text-black bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-black rounded-xl outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Distance Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="distance"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            Radius from School
          </label>
          <span className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-full">
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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>1 km</span>
          <span>25 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        {isMobileModal ? (
          <>
            <button
              type="button"
              onClick={onCloseModal}
              className="w-full py-3 px-4 bg-black text-white font-medium text-sm rounded-xl transition hover:bg-gray-800 shadow-sm"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                onResetFilters();
                onCloseModal?.();
              }}
              className="w-full py-2.5 px-4 bg-gray-100 text-black font-medium text-sm rounded-xl transition hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <FiRotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
