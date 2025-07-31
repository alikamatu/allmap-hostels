'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function LocationPicker({ location, address, onLocationChange, onAddressChange }: { location: { lat: number, lng: number }, address: string, onLocationChange: (location: { lng: number, lat: number }) => void, onAddressChange: (address: string) => void }) {
  const [viewport, setViewport] = useState({
    latitude: location.lat,
    longitude: location.lng,
    zoom: 14
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setViewport({
      latitude: location.lat,
      longitude: location.lng,
      zoom: 14
    });
  }, [location]);

  const handleMapClick = (e: { lngLat: [number, number] }) => {
    const newLocation = {
      lng: e.lngLat[0],
      lat: e.lngLat[1]
    };
    onLocationChange(newLocation);
    reverseGeocode(newLocation);
  };

  const reverseGeocode = async (loc: { lng: number, lat: number }) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.lng},${loc.lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        onAddressChange(data.features[0].place_name);
      }
    } catch (error: unknown) {
      console.error('Reverse geocode error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading map...</div>;
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddressChange(e.target.value)}
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
        <Map
          {...viewport}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          width="100%"
          height="100%"
          onViewportChange={setViewport}
          onClick={handleMapClick}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <Marker
            latitude={location.lat}
            longitude={location.lng}
            offsetLeft={-20}
            offsetTop={-40}
          >
            <div className="text-red-500">
              <MapPin size={40} fill="currentColor" />
            </div>
          </Marker>
          <div className="absolute top-4 right-4">
            <NavigationControl showCompass={false} />
          </div>
        </Map>
        
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm">
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