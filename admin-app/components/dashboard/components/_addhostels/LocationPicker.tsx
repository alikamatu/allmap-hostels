'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function LocationPicker({ 
  location, 
  address, 
  onLocationChange, 
  onAddressChange 
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Check if Google Maps is already loaded
  const isGoogleMapsLoaded = () => {
    return typeof window !== 'undefined' && window.google && window.google.maps;
  };

  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !isGoogleMapsLoaded()) {
      console.log('Map container or Google Maps not ready');
      return;
    }

    try {
      console.log('Initializing map...');
      
      const mapOptions: google.maps.MapOptions = {
        center: { lat: location.lat, lng: location.lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      
      const newMarker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: newMap,
        draggable: true,
        title: 'Hostel Location'
      });

      // Add click listener to map
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          newMarker.setPosition(newLocation);
          onLocationChange(newLocation);
          reverseGeocode(newLocation);
        }
      });

      // Add drag listener to marker
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          onLocationChange(newLocation);
          reverseGeocode(newLocation);
        }
      });

      setMap(newMap);
      setMarker(newMarker);
      setLoading(false);
      
      console.log('Map initialized successfully');

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  // Reverse geocoding function
  const reverseGeocode = (loc: Location) => {
    if (!isGoogleMapsLoaded()) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: loc }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onAddressChange(results[0].formatted_address);
      }
    });
  };

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      initializeMap();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...');
      existingScript.addEventListener('load', () => {
        setScriptLoaded(true);
        setTimeout(initializeMap, 100); // Small delay to ensure everything is ready
      });
      return;
    }

    console.log('Loading Google Maps script...');
    
    // Create and load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setScriptLoaded(true);
      // Small delay to ensure Google Maps is fully initialized
      setTimeout(initializeMap, 100);
    };
    
    script.onerror = (err) => {
      console.error('Failed to load Google Maps script:', err);
      setError('Failed to load Google Maps. Please check your API key and internet connection.');
      setLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[src*="maps.googleapis.com"]');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, [apiKey]);

  // Update map when location changes externally
  useEffect(() => {
    if (map && marker && scriptLoaded) {
      const newLatLng = new google.maps.LatLng(location.lat, location.lng);
      map.panTo(newLatLng);
      marker.setPosition(newLatLng);
    }
  }, [location, map, marker, scriptLoaded]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        if (map && marker) {
          map.panTo(newLocation);
          map.setZoom(15);
          marker.setPosition(newLocation);
        }
        
        onLocationChange(newLocation);
        reverseGeocode(newLocation);
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your current location. Please select manually on the map.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Search for location
  const searchLocation = () => {
    if (!searchInputRef.current || !isGoogleMapsLoaded()) return;

    const searchValue = searchInputRef.current.value.trim();
    if (!searchValue) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === 'OK' && results && results[0] && results[0].geometry) {
        const location = results[0].geometry.location;
        const newLocation = {
          lat: location.lat(),
          lng: location.lng()
        };

        if (map && marker) {
          map.panTo(newLocation);
          map.setZoom(15);
          marker.setPosition(newLocation);
        }

        onLocationChange(newLocation);
        onAddressChange(results[0].formatted_address);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center p-6">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <div className="text-gray-700 font-medium mb-2">Map Loading Error</div>
          <div className="text-gray-600 text-sm">{error}</div>
          {!apiKey && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
              <strong>Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 text-left">
                <li>Get a Google Maps API key from Google Cloud Console</li>
                <li>Enable Maps JavaScript API and Places API</li>
                <li>Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Location
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location (e.g., Accra, Ghana)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
              onKeyPress={handleSearchKeyPress}
            />
          </div>
          <button
            onClick={searchLocation}
            className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            type="button"
          >
            <Search size={20} />
          </button>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            title="Use current location"
            type="button"
          >
            <Navigation size={20} />
          </button>
        </div>
      </motion.div>

      {/* Address Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
          placeholder="Enter hostel address"
          required
        />
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="h-96 rounded-xl overflow-hidden border border-gray-300 relative bg-gray-100"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <div className="text-gray-600">Loading map...</div>
              <div className="text-sm text-gray-500 mt-1">
                {!apiKey ? 'API key missing' : 'Initializing Google Maps...'}
              </div>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '384px' }}
        />
        
        {!loading && (
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm flex items-center max-w-xs">
            <MapPin className="text-red-500 mr-2 flex-shrink-0" size={16} />
            <span>Click or drag marker to set location</span>
          </div>
        )}
      </motion.div>

      {/* Coordinates Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 p-4 rounded-lg"
      >
        <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Latitude:</span>
            <div className="font-mono">{location.lat.toFixed(6)}</div>
          </div>
          <div>
            <span className="font-medium">Longitude:</span>
            <div className="font-mono">{location.lng.toFixed(6)}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}