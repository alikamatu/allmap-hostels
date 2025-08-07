'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { useDistanceFilter } from '@/hooks/useDistanceFilter';
import { useFilteredHostels } from '@/hooks/useFilteredHostels';
import { calculateDistance, parseLocation } from '@/utils/geo';
import dynamic from 'next/dynamic';
import { HostelCard } from '@/types/hostels';
import { FilterPanel } from '@/_components/hostels/FilterPanel';
import { HostelList } from '@/_components/hostels/HostelList';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/_components/hostels/MapView'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default function HomePage() {
  const [hostels, setHostels] = useState<HostelCard[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const schoolCoords = useDistanceFilter();
  const { theme, toggleTheme } = useTheme();

  // Initialize filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '' as number | '',
    maxPrice: '' as number | '',
    maxDistance: 10, // Default to 10km
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    async function fetchHostels() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch('http://localhost:1000/hostels/fetch', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch hostels: ${res.statusText}`);

        const data = await res.json();
        const formatted: HostelCard[] = data.map((hostel: any) => {
          const coords = parseLocation(hostel.location);
          const prices = hostel.roomTypes?.map((rt: any) => rt.pricePerSemester) || [];
          const lowestPrice = prices.length ? Math.min(...prices) : 0;
          const highestPrice = prices.length ? Math.max(...prices) : 0;
          
          // Calculate distance if both school and hostel coordinates are available
          let distance = null;
          if (coords && schoolCoords) {
            distance = calculateDistance(
              schoolCoords[1], // latitude
              schoolCoords[0], // longitude
              coords[1],       // latitude
              coords[0]        // longitude
            );
          }
          
          return {
            id: hostel.id,
            name: hostel.name,
            imageUrl: hostel.images?.[0] || null,
            description: hostel.description,
            address: hostel.address || 'No address provided',
            location: hostel.location,
            coords,
            lowestPrice,
            highestPrice,
            distance
          };
        });

        setHostels(formatted);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    }

    fetchHostels();
  }, [schoolCoords]);

  // Apply filters
  const filteredHostels = useFilteredHostels(hostels, schoolCoords, filters);

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      maxDistance: 10,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {mounted && (
        <div className="flex justify-between items-center mb-8">
          <button
            className="px-4 py-2 rounded light:bg-gray-200"
            onClick={toggleTheme}
          >
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </button>
          
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {showMap ? 'Show List' : 'Show Map'}
          </button>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-8 text-center">Featured Hostels</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onSearchChange={(term) => setFilters(prev => ({ ...prev, searchTerm: term }))}
            onMinPriceChange={(price) => setFilters(prev => ({ ...prev, minPrice: price }))}
            onMaxPriceChange={(price) => setFilters(prev => ({ ...prev, maxPrice: price }))}
            onMaxDistanceChange={(distance) => setFilters(prev => ({ ...prev, maxDistance: distance }))}
            onResetFilters={handleResetFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          {showMap ? (
            <MapView 
              hostels={filteredHostels} 
              schoolCoords={schoolCoords} 
            />
          ) : (
            <HostelList hostels={filteredHostels} />
          )}
        </div>
      </div>
    </div>
  );
}