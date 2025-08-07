'use client';

import React, { useEffect, useRef } from 'react';
import { HostelCard } from '@/types/hostels';
import { calculateDistance } from '@/utils/geo';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface MapViewProps {
  hostels: HostelCard[];
  schoolCoords: [number, number] | null;
}

const MapView: React.FC<MapViewProps> = ({ hostels, schoolCoords }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const { isLoaded, error } = useGoogleMaps();

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || hostels.length === 0) return;

    // Find center point between school and hostels
    let center: [number, number] = [0, 0];
    let count = 0;
    
    if (schoolCoords) {
      center = [schoolCoords[1], schoolCoords[0]];
      count++;
    }
    
    hostels.forEach(hostel => {
      if (hostel.coords) {
        center[0] += hostel.coords[1];
        center[1] += hostel.coords[0];
        count++;
      }
    });
    
    if (count > 0) {
      center[0] /= count;
      center[1] /= count;
    } else {
      // Default to Accra, Ghana if no coordinates
      center = [5.6037, -0.1870];
    }

    // Create map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: center[0], lng: center[1] },
      zoom: 13,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add school marker if available
    if (schoolCoords) {
      const schoolMarker = new window.google.maps.Marker({
        position: { lat: schoolCoords[1], lng: schoolCoords[0] },
        map: mapInstance.current,
        title: 'Your School',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });
      
      // Add info window for school
      const schoolInfo = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-lg">Your School</h3>
            <p class="text-sm">Reference point for distance calculation</p>
          </div>
        `
      });
      
      schoolMarker.addListener('click', () => {
        schoolInfo.open(mapInstance.current, schoolMarker);
      });
    }

    // Add hostel markers
    markers.current = hostels
      .filter(hostel => hostel.coords)
      .map(hostel => {
        const position = { 
          lat: hostel.coords![1], 
          lng: hostel.coords![0] 
        };
        
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: hostel.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });
        
        // Calculate distance to school
        let distanceText = 'Distance not available';
        if (schoolCoords && hostel.distance !== null) {
          distanceText = `${hostel.distance.toFixed(1)} km from your school`;
        }
        
        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2 max-w-xs">
              <h3 class="font-bold text-lg">${hostel.name}</h3>
              <p class="text-sm text-gray-600">${hostel.address}</p>
              <p class="text-sm mt-1">${distanceText}</p>
              <p class="text-sm mt-1">
                Price: ₦${hostel.lowestPrice.toLocaleString()}
                ${hostel.lowestPrice !== hostel.highestPrice ? 
                  ` - ₦${hostel.highestPrice.toLocaleString()}` : ''}
              </p>
              <a href="/hostels/${hostel.id}" 
                 class="mt-2 inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
                View Details
              </a>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });
        
        return marker;
      });

    // Clean up markers
    return () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, [hostels, schoolCoords, isLoaded]);

  if (error) {
    return (
      <div className="h-[600px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-lg font-bold text-red-600">Map Error</h3>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm mt-2">
            Please check your internet connection or try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[600px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-xl overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">Your School</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">Hostel Location</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;