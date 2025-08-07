import { useMemo } from 'react';
import { calculateDistance } from '@/utils/geo';
import { HostelCard } from '@/types/hostels';

interface Filters {
  searchTerm: string;
  minPrice: number | '';
  maxPrice: number | '';
  maxDistance: number;
}

export function useFilteredHostels(
  hostels: HostelCard[],
  schoolCoords: [number, number] | null,
  filters: Filters
) {
  return useMemo(() => {
    if (!hostels.length) return [];
    
    return hostels.filter(hostel => {
      // Apply search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (
          !hostel.name.toLowerCase().includes(searchLower) &&
          !hostel.address.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      // Apply price filter
      if (filters.minPrice !== '' && hostel.lowestPrice < filters.minPrice) return false;
      if (filters.maxPrice !== '' && hostel.highestPrice > filters.maxPrice) return false;
      
      // Apply distance filter
      if (schoolCoords && hostel.coords) {
        const distance = calculateDistance(
          schoolCoords[1], // latitude
          schoolCoords[0], // longitude
          hostel.coords[1], // latitude
          hostel.coords[0]  // longitude
        );
        return distance <= filters.maxDistance;
      }
      
      return true;
    });
  }, [hostels, schoolCoords, filters]);
}