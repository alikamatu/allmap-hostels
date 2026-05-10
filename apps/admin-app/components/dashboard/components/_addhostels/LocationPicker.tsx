'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

interface Location {
  lng: number;
  lat: number;
}

interface LocationPickerProps {
  location: Location;
  address: string;
  onLocationChange: (loc: Location) => void;
  onAddressChange: (addr: string) => void;
}

// Nominatim reverse geocoding (free, no API key needed)
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

// Nominatim forward geocoding (free, no API key needed)
async function forwardGeocode(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gh`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data[0]) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch {
    return null;
  }
}

export default function LocationPicker({ 
  location, 
  address, 
  onLocationChange, 
  onAddressChange 
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update marker + reverse geocode
  const updatePosition = useCallback(async (lat: number, lng: number) => {
    onLocationChange({ lat, lng });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    const addr = await reverseGeocode(lat, lng);
    if (addr) {
      onAddressChange(addr);
    }
  }, [onLocationChange, onAddressChange]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    let aborted = false;

    // Clean up any existing map
    mapInstance.current?.remove();
    mapInstance.current = null;

    import('leaflet').then((L) => {
      if (aborted || !mapRef.current) return;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      leafletRef.current = L;

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(
        [location.lat, location.lng],
        15,
      );
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Draggable marker
      const marker = L.marker([location.lat, location.lng], {
        draggable: true,
        title: 'Hostel Location',
      }).addTo(map);
      markerRef.current = marker;

      // Marker drag end → update position
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updatePosition(pos.lat, pos.lng);
      });

      // Click on map → move marker
      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        updatePosition(e.latlng.lat, e.latlng.lng);
      });

      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load Leaflet:', err);
      setError('Failed to load map. Please refresh the page.');
      setLoading(false);
    });

    return () => {
      aborted = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
    // Only initialize once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync map when location changes externally
  useEffect(() => {
    if (!mapInstance.current || !markerRef.current) return;
    mapInstance.current.panTo([location.lat, location.lng]);
    markerRef.current.setLatLng([location.lat, location.lng]);
  }, [location.lat, location.lng]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 15);
        }

        updatePosition(lat, lng);
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Unable to get your current location. Please select manually on the map.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Search for location using Nominatim
  const searchLocation = async () => {
    if (!searchInputRef.current) return;
    const query = searchInputRef.current.value.trim();
    if (!query) return;

    setSearching(true);
    const result = await forwardGeocode(query);
    setSearching(false);

    if (result) {
      if (mapInstance.current) {
        mapInstance.current.setView([result.lat, result.lng], 15);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([result.lat, result.lng]);
      }
      onLocationChange({ lat: result.lat, lng: result.lng });
      onAddressChange(result.display_name);
    } else {
      alert('Location not found. Please try a different search term.');
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border-t-4 border-t-red-500">
        <div className="text-center p-4">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <div className="text-sm font-medium text-gray-700 mb-1">Map Loading Error</div>
          <div className="text-xs text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <label className="block text-xs font-medium text-gray-700 mb-1">
          SEARCH LOCATION
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2 text-gray-400" size={14} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
              onKeyDown={handleSearchKeyPress}
              disabled={searching}
            />
          </div>
          <motion.button
            whileHover={{ backgroundColor: '#e55e00' }}
            whileTap={{ scale: 0.95 }}
            onClick={searchLocation}
            disabled={searching}
            className="px-3 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:opacity-70"
            type="button"
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: '#2563eb' }}
            whileTap={{ scale: 0.95 }}
            onClick={getCurrentLocation}
            className="px-3 py-2 bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors duration-150"
            title="Use current location"
            type="button"
          >
            <Navigation size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Address Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <label className="block text-xs font-medium text-gray-700 mb-1">
          ADDRESS *
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
          placeholder="Enter hostel address"
          required
        />
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="h-64 bg-gray-100 border-t-4 border-t-[#FF6A00] relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6A00] mx-auto mb-2"></div>
              <div className="text-xs text-gray-600">Loading map...</div>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '256px' }}
        />
        
        {!loading && (
          <div className="absolute bottom-2 left-2 bg-white px-3 py-1 text-xs flex items-center max-w-xs z-[1000]">
            <MapPin className="text-red-500 mr-1 flex-shrink-0" size={12} />
            <span>Click or drag marker to set location</span>
          </div>
        )}
      </motion.div>

      {/* Coordinates Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.3 }}
        className="bg-gray-50 p-3"
      >
        <div className="text-xs text-gray-600 grid grid-cols-2 gap-3">
          <div>
            <span className="font-medium">LATITUDE:</span>
            <div className="font-mono text-xs">{location.lat.toFixed(6)}</div>
          </div>
          <div>
            <span className="font-medium">LONGITUDE:</span>
            <div className="font-mono text-xs">{location.lng.toFixed(6)}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}