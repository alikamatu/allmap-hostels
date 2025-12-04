'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { useDistanceFilter, useUserSchoolName } from '@/hooks/useDistanceFilter';
import { useFilteredHostels } from '@/hooks/useFilteredHostels';
import { HostelCard } from '@/types/hostels';
import { calculateDistance, parseLocation } from '@/utils/geo';
import dynamic from 'next/dynamic';
import { FilterPanel } from '@/_components/hostels/FilterPanel';
import { HostelList } from '@/_components/hostels/HostelList';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMap, FiList, FiAlertTriangle, FiFilter } from 'react-icons/fi';

// Dynamically import MapView
const MapView = dynamic(() => import('@/_components/hostels/MapView'), {
  ssr: false,
  loading: () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[400px] sm:h-[600px] flex items-center justify-center"
    >
      <div className="relative flex w-64 animate-pulse gap-2 p-4">
        <div className="h-12 w-12 rounded-full bg-slate-400"></div>
        <div className="flex-1">
          <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
          <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
        </div>
        <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
      </div>
    </motion.div>
  ),
});

const MemoizedHostelList = memo(HostelList);
const MemoizedMapView = memo(MapView);

export default function HostelsPage() {
  const [hostels, setHostels] = useState<HostelCard[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const schoolCoords = useDistanceFilter();
  const schoolName = useUserSchoolName();

  // Initialize filters from localStorage
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '' as number | '',
    maxPrice: '' as number | '',
    maxDistance: 10,
  });

  useEffect(() => {
    setMounted(true);
    // Restore filters and view preference from localStorage
    const savedFilters = localStorage.getItem('hostelFilters');
    const savedView = localStorage.getItem('hostelView');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
    if (savedView) {
      setShowMap(savedView === 'map');
    }
  }, []);

  // Save filters to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hostelFilters', JSON.stringify(filters));
    }
  }, [filters, mounted]);

  // Save view preference to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hostelView', showMap ? 'map' : 'list');
    }
  }, [showMap, mounted]);

  useEffect(() => {
    async function fetchHostels() {
      setIsLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/all`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch hostels: ${res.statusText}`);

        const data = await res.json();
        
        const formatted: HostelCard[] = data.map((hostel: any) => {
          const coords = parseLocation(hostel.location);
          const prices = hostel.roomTypes?.map((rt: any) => rt.pricePerSemester) || [];
          const lowestPrice = prices.length ? Math.min(...prices) : 0;
          const highestPrice = prices.length ? Math.max(...prices) : 0;
          
          let distance = null;
          if (coords && schoolCoords) {
            distance = calculateDistance(
              schoolCoords[1], // school latitude
              schoolCoords[0], // school longitude
              coords[1],       // hostel latitude
              coords[0]        // hostel longitude
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
            base_price: hostel.base_price,
            distance,
            accepting_bookings: hostel.accepting_bookings,
            is_verified: hostel.is_verified,
          };
        });

        setHostels(formatted);
      } catch (error: any) {
        console.error('Error fetching hostels:', error);
        setError(error.message || 'Failed to load hostels. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHostels();
  }, [schoolCoords]);

  // Memoized filter handlers
  const handleSearchChange = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const handleMinPriceChange = useCallback((price: number | '') => {
    setFilters(prev => ({ ...prev, minPrice: price }));
  }, []);

  const handleMaxPriceChange = useCallback((price: number | '') => {
    setFilters(prev => ({ ...prev, maxPrice: price }));
  }, []);

  const handleMaxDistanceChange = useCallback((distance: number) => {
    setFilters(prev => ({ ...prev, maxDistance: distance }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      maxDistance: 10,
    });
  }, []);

  const filteredHostels = useFilteredHostels(hostels, schoolCoords, filters);

  // Generate filter summary
  const filterSummary = () => {
    const parts: string[] = [];
    if (filteredHostels.length > 0) {
      parts.push(`Showing ${filteredHostels.length} hostel${filteredHostels.length !== 1 ? 's' : ''}`);
    } else {
      parts.push('No hostels found');
    }
    if (filters.maxDistance) parts.push(`within ${filters.maxDistance} km`);
    if (filters.minPrice || filters.maxPrice) {
      parts.push(`¢${filters.minPrice || '0'}–${filters.maxPrice || '∞'}`);
    }
    if (filters.searchTerm) parts.push(`matching "${filters.searchTerm}"`);
    return parts.join(', ');
  };

  return (
    <div className="bg-white font-sans min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        {mounted && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end mb-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMap(!showMap)}
                className="fixed bottom-4 right-4 sm:static bg-black text-white px-6 py-3 font-medium transition hover:bg-gray-800 flex items-center gap-2 z-10"
                aria-label={showMap ? 'Show list view' : 'Show map view'}
              >
                {showMap ? <FiList /> : <FiMap />}
                {showMap ? 'List View' : 'Map View'}
              </motion.button>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xs md:text-2xl font-bold text-black mb-3 md:mb-8 text-left"
            >
              Hostels near {schoolName || 'your school'}
            </motion.h1>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-4 mb-6 flex items-center justify-center text-black"
              >
                <FiAlertTriangle className="h-4 w-4 mr-2 text-black" />
                {error}
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    setHostels([]);
                    // Trigger re-fetch by resetting useEffect dependency
                    setTimeout(() => setIsLoading(false), 0);
                  }}
                  className="ml-2 text-black hover:underline"
                >
                  Retry
                </button>
              </motion.div>
            )}

            {isLoading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[400px] sm:h-[600px] flex items-center justify-center"
              >
                <div className="relative flex w-64 animate-pulse gap-2 p-4">
                  <div className="h-12 w-12 rounded-full bg-slate-400"></div>
                  <div className="flex-1">
                    <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
                    <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
                  </div>
                  <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
                </div>
              </motion.div>
            )}

            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Desktop Filter Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="hidden md:block md:col-span-1 lg:sticky lg:top-4"
                >
                  <FilterPanel
                    filters={filters}
                    onSearchChange={handleSearchChange}
                    onMinPriceChange={handleMinPriceChange}
                    onMaxPriceChange={handleMaxPriceChange}
                    onMaxDistanceChange={handleMaxDistanceChange}
                    onResetFilters={handleResetFilters}
                  />
                </motion.div>

                {/* Mobile Filter Button */}
                {!isFilterModalOpen && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFilterModalOpen(true)}
                    className="md:hidden fixed bottom-4 left-4 bg-black text-white p-3 rounded-full shadow-lg z-10"
                    aria-label="Open filters"
                  >
                    <FiFilter className="w-5 h-5" />
                  </motion.button>
                )}

                <div className="md:col-span-2 lg:col-span-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="mb-4 text-base text-gray-800"
                  >
                    {filterSummary()}
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {filteredHostels.length === 0 && !isLoading && (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12"
                      >
                        <p className="text-black text-lg mb-2">No hostels match your filters.</p>
                        <p className="text-gray-800">Try adjusting or resetting the filters to see more options.</p>
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 text-black hover:underline"
                        >
                          Reset Filters
                        </button>
                      </motion.div>
                    )}

                    {filteredHostels.length > 0 && (
                      <motion.div
                        key={showMap ? 'map' : 'list'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {showMap ? (
                          <MemoizedMapView hostels={filteredHostels} schoolCoords={schoolCoords} />
                        ) : (
                          <MemoizedHostelList hostels={filteredHostels} />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile Filter Modal */}
            <AnimatePresence>
              {isFilterModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 md:hidden"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  <motion.div
                    initial={{ translateY: '100%' }}
                    animate={{ translateY: 0 }}
                    exit={{ translateY: '100%' }}
                    transition={{ type: 'spring', damping: 25 }}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FilterPanel
                      filters={filters}
                      onSearchChange={handleSearchChange}
                      onMinPriceChange={handleMinPriceChange}
                      onMaxPriceChange={handleMaxPriceChange}
                      onMaxDistanceChange={handleMaxDistanceChange}
                      onResetFilters={handleResetFilters}
                      isMobileModal={true}
                      onCloseModal={() => setIsFilterModalOpen(false)}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}