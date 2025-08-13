'use client';

// Import Google Maps types for TypeScript
/// <reference types="@types/google.maps" />

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Loader } from '@googlemaps/js-api-loader';

interface Location {
  lng: number;
  lat: number;
}

export default function LocationPicker({ 
  location, 
  address, 
  onLocationChange, 
  onAddressChange 
}: { 
  location: Location; 
  address: string; 
  onLocationChange: (loc: Location) => void; 
  onAddressChange: (addr: string) => void; 
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      setLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const initialMap = new google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const initialMarker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: initialMap,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#DB4437',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      const newGeocoder = new google.maps.Geocoder();
      setMap(initialMap);
      setMarker(initialMarker);
      setGeocoder(newGeocoder);
      setLoading(false);

      // Add click event listener
      initialMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        const newLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        
        initialMarker.setPosition(newLocation);
        reverseGeocode(newLocation);
      });
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
      setLoading(false);
    });
  }, []);

  // Update map when location prop changes
  useEffect(() => {
    if (!map || !marker || !location) return;
    
    const newLatLng = new google.maps.LatLng(location.lat, location.lng);
    map.panTo(newLatLng);
    marker.setPosition(newLatLng);
  }, [location, map, marker]);

  const reverseGeocode = (loc: Location) => {
    if (!geocoder) return;
    
    setLoading(true);
    geocoder.geocode({ location: loc }, (results, status) => {
      setLoading(false);
      
      if (status === 'OK' && results?.[0]) {
        onAddressChange(results[0].formatted_address);
        onLocationChange(loc);
      } else {
        console.error('Geocode failed:', status);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
          placeholder="Enter hostel address"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="h-96 rounded-xl overflow-hidden border border-gray-300 relative"
      >
        <div 
          ref={mapRef} 
          className="w-full h-full"
        />
        
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm flex items-center">
          <MapPin className="text-red-500 mr-2" size={20} />
          Click on map to set location
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-600"
      >
        <p>Latitude: {location.lat.toFixed(6)}</p>
        <p>Longitude: {location.lng.toFixed(6)}</p>
      </motion.div>
    </div>
  );
}