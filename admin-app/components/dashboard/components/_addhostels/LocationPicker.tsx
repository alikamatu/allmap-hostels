'use client';

import { useState, useEffect, useRef } from 'react';
import Map, { MapRef, Marker, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Viewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

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
  const mapRef = useRef<MapRef>(null);
const [viewport, setViewport] = useState<Viewport>({
  longitude: location?.lng ?? -0.1870,
  latitude: location?.lat ?? 5.6037,
  zoom: 14,
});

  const [loading, setLoading] = useState(false);
  

useEffect(() => {
  setViewport((prev) => ({
    ...prev,
    longitude: location?.lng ?? -0.1870,
    latitude: location?.lat ?? 5.6037,
  }));
}, [location]);

  const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
    const newLocation: Location = {
      lng: e.lngLat.lng,
      lat: e.lngLat.lat
    };
    onLocationChange(newLocation);
    reverseGeocode(newLocation);
  };


  const reverseGeocode = async (loc: Location) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.lng},${loc.lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        onAddressChange(data.features[0].place_name);
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loader">loading...</div>
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
        <Map
          ref={mapRef}
          {...viewport}
          mapStyle={`https://api.maptiler.com/maps/bright-v2/style.json?key=B4ViRJWe5eOxKBZcGNNv#7.6/5.47229/-0.05929`}
          style={{ width: '100%', height: '100%' }}
          onMove={(evt) => setViewport(evt.viewState)}
          onClick={handleMapClick}
          attributionControl={false}
        >
          <Marker
            longitude={location.lng || 0}
            latitude={location.lat}
            anchor="bottom"
          >
            <div className="text-red-500">
              <MapPin size={40} fill="currentColor" />
            </div>
          </Marker>
          <NavigationControl 
            position="top-right" 
            showCompass={false}
            showZoom={true}
          />
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