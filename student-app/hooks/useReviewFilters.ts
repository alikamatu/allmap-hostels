"use client";

import { useState, useCallback } from 'react';

export interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  sortBy: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder: 'ASC' | 'DESC';
  page: number;
  limit: number;
}

export const useReviewFilters = (initialFilters?: Partial<ReviewFilters>) => {
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 10,
    ...initialFilters
  });

  const updateFilters = useCallback((newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: 1,
      limit: 10
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters
  };
};