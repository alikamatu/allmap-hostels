'use client';

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import useLiveLocation from '@/lib/hooks/useLiveLocation';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export default function LiveLocationMap({ 
  initialLat = 5.6037, 
  initialLng = -0.1866 
}) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const { lat, lng } = useLiveLocation();
  
  useEffect(() => {
    if (!mapContainer.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [initialLng, initialLat],
      zoom: 16
    });
    
    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Create marker
    const newMarker = new mapboxgl.Marker({
      color: "#3b82f6",
      scale: 1.2
    })
      .setLngLat([initialLng, initialLat])
      .addTo(newMap);
    
    setMap(newMap);
    setMarker(newMarker);

    return () => newMap.remove();
  }, []);
  
  // Update marker position when location changes
  useEffect(() => {
    if (marker && map && lat !== 0 && lng !== 0) {
      marker.setLngLat([lng, lat]);
      map.flyTo({
        center: [lng, lat],
        essential: true,
        zoom: 16
      });
    }
  }, [lat, lng, marker, map]);

  return (
    <div className="h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
    </div>
  );
}