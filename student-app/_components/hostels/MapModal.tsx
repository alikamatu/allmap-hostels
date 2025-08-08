'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  hostelName: string;
}

export const MapModal = ({ isOpen, onClose, location, hostelName }: MapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, error: mapsError } = useGoogleMaps();
  const [hostelCoords, setHostelCoords] = useState<[number, number] | null>(null);
  const [schoolCoords, setSchoolCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse location from various formats
  const parseLocation = useCallback((loc: any): [number, number] | null => {
    if (!loc) return null;
    
    // Handle GeoJSON format
    if (typeof loc === 'object' && loc.coordinates) {
      return [loc.coordinates[0], loc.coordinates[1]];
    }
    
    // Handle string formats
    if (typeof loc === 'string') {
      // Handle POINT(lng lat) format
      const pointMatch = loc.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
      if (pointMatch) return [parseFloat(pointMatch[1]), parseFloat(pointMatch[2])];
      
      // Handle WKB hex format
      if (loc.startsWith('0101000020E6100000')) {
        try {
          const hex = loc.substring(18);
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
          }
          const view = new DataView(bytes.buffer);
          const lng = view.getFloat64(0, true);
          const lat = view.getFloat64(8, true);
          return [lng, lat];
        } catch (error) {
          console.error('Failed to parse WKB location:', error);
          return null;
        }
      }
      
      // Handle raw coordinate strings
      const coordMatch = loc.match(/(-?\d+\.\d+)\s+(-?\d+\.\d+)/);
      if (coordMatch) return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
    }
    
    return null;
  }, []);

  // Parse hostel location when component mounts or location changes
  useEffect(() => {
    setLoading(true);
    try {
      const coords = parseLocation(location);
      if (coords) {
        setHostelCoords(coords);
        setParseError(null);
      } else {
        setParseError('Unable to parse hostel location.');
      }
    } catch (error) {
      setParseError('Error parsing location data.');
      console.error('Location parsing error:', error);
    } finally {
      setLoading(false);
    }
  }, [location, parseLocation]);

  // Fetch school coordinates from user profile
  useEffect(() => {
    const fetchSchoolLocation = async () => {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!accessToken) return;

        const res = await fetch('http://localhost:1000/auth/user-profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch user profile: ${res.statusText}`);

        const profile = await res.json();
        if (profile.school?.location) {
          const coords = parseLocation(profile.school.location);
          if (coords) {
            setSchoolCoords(coords);
          } else {
            console.warn('Invalid school location format:', profile.school.location);
          }
        }
      } catch (error) {
        console.error('Failed to fetch school location:', error);
      }
    };

    fetchSchoolLocation();
  }, [parseLocation]);

  // Initialize map when all data is ready
  useEffect(() => {
    if (!isLoaded || !isOpen || !mapRef.current || !hostelCoords) return;

    // Create map instance
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: hostelCoords[1], lng: hostelCoords[0] },
      zoom: 15,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Add hostel marker
    new window.google.maps.Marker({
      position: { lat: hostelCoords[1], lng: hostelCoords[0] },
      map,
      title: hostelName,
      icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    });

    // Add school marker if available
    if (schoolCoords) {
      new window.google.maps.Marker({
        position: { lat: schoolCoords[1], lng: schoolCoords[0] },
        map,
        title: 'Your School',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      // Calculate distance between school and hostel
      const R = 6371; // Earth radius in km
      const dLat = (hostelCoords[1] - schoolCoords[1]) * (Math.PI / 180);
      const dLon = (hostelCoords[0] - schoolCoords[0]) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(schoolCoords[1] * (Math.PI / 180)) * 
        Math.cos(hostelCoords[1] * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistance(R * c);
    }
  }, [isLoaded, isOpen, hostelCoords, schoolCoords, hostelName]);

  // Handle body overflow when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render error state if any
  if (mapsError || parseError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4 font-sans"
      >
        <div className="text-center max-w-md">
          <FiAlertTriangle className="text-black text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Unable to Load Map</h2>
          <p className="text-gray-666 mb-6">{mapsError || parseError}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-black text-white py-3 px-6 font-medium transition hover:bg-gray-800"
            aria-label="Close map modal"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Render loading state
  if (loading || !hostelCoords) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4 font-sans"
      >
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-black h-6 w-6 mb-4" />
          <span className="text-gray-666">Loading map...</span>
        </div>
      </motion.div>
    );
  }

  // Render map
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4 font-sans"
    >
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-black">{hostelName} Location</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onClose}
            className="text-black"
            aria-label="Close map modal"
          >
            <FiX className="text-2xl" />
          </motion.button>
        </div>
        
        <div ref={mapRef} className="w-full h-[400px] sm:h-[500px] flex-1" />
        
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-666">{hostelName}</span>
            </div>
            
            {schoolCoords && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-666">Your School</span>
              </div>
            )}
          </div>
          
          {distance !== null && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-center font-medium">
                Distance from your school: {distance.toFixed(1)} km
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};