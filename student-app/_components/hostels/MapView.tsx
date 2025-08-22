'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HostelCard } from '@/types/hostels';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useUserSchoolName } from '@/hooks/useDistanceFilter';
import { useRouter } from 'next/navigation';
import { renderToStaticMarkup } from 'react-dom/server';
import { Bed, School } from 'lucide-react';

interface MapViewProps {
  hostels: HostelCard[];
  schoolCoords: [number, number] | null;
}

const MapView: React.FC<MapViewProps> = ({ hostels, schoolCoords }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const directionsService = useRef<any>(null);
  const directionsRenderer = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const { isLoaded, error } = useGoogleMaps();
  const schoolName = useUserSchoolName();
  const [selectedHostel, setSelectedHostel] = useState<HostelCard | null>(null);
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING' | 'TRANSIT'>('DRIVING');
  const router = useRouter();
  const [directions, setDirections] = useState<any>(null);

  // Initialize map and services
  useEffect(() => {
    if (!isLoaded || !mapRef.current || hostels.length === 0) return;

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: schoolCoords 
        ? { lat: schoolCoords[1], lng: schoolCoords[0] } 
        : { lat: 5.6037, lng: -0.1870 },
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

    // Initialize directions services
    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      panel: directionsRef.current,
      suppressMarkers: true
    });

    // Add school marker with graduation cap icon
    if (schoolCoords) {
      const schoolIconSvg = renderToStaticMarkup(
        <School className="text-blue-500" style={{ width: '30px', height: '30px', color: 'blue' }} />
      );

      const schoolMarker = new window.google.maps.Marker({
        position: { lat: schoolCoords[1], lng: schoolCoords[0] },
        map: mapInstance.current,
        title: schoolName || 'Your School',
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(schoolIconSvg)}`,
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 15)
        }
      });
      
      const schoolInfo = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-lg">${schoolName || 'Your School'}</h3>
            <p class="text-sm">Reference point for directions</p>
          </div>
        `
      });
      
      schoolMarker.addListener('click', () => {
        schoolInfo.open(mapInstance.current, schoolMarker);
      });
    }

    // Add hostel markers with bed icon
    markers.current = hostels
      .filter(hostel => hostel.coords)
      .map(hostel => {
        const position = { 
          lat: hostel.coords![1], 
          lng: hostel.coords![0] 
        };
        
        const hostelIconSvg = renderToStaticMarkup(
          <Bed className="text-red-500" style={{ width: '30px', height: '30px', color: 'red' }} />
        );
        
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: hostel.name,
          icon: {
            url: `data:image/svg+xml,${encodeURIComponent(hostelIconSvg)}`,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          }
        });
        
        // Calculate distance to school
        let distanceText = 'Distance not available';
        if (schoolCoords && hostel.distance !== null) {
          distanceText = `${hostel.distance.toFixed(1)} km from your school`;
        }
        
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
              <button 
                class="mt-2 w-full px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                onclick="window.dispatchEvent(new CustomEvent('select-hostel', { detail: '${hostel.id}' }))"
              >
                Get Directions
              </button>
              <button 
                class="mt-2 w-full px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 view-details"
                data-hostel-id="${hostel.id}"
              >
                View Details
              </button>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });
        
        return marker;
      });

    // Listen for custom events from info window
    const handleSelectHostel = (e: CustomEvent) => {
      const hostelId = e.detail;
      const hostel = hostels.find(h => h.id === hostelId);
      if (hostel) setSelectedHostel(hostel);
    };

    const handleViewDetails = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('view-details')) {
        const hostelId = target.getAttribute('data-hostel-id');
        if (hostelId) {
          router.push(`/dashboard/hostels/${hostelId}`);
        }
      }
    };

    window.addEventListener('select-hostel', handleSelectHostel as EventListener);
    window.addEventListener('click', handleViewDetails);
    
    return () => {
      window.removeEventListener('select-hostel', handleSelectHostel as EventListener);
      window.removeEventListener('click', handleViewDetails);
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, [hostels, schoolCoords, isLoaded, router]);

  // Fetch directions when hostel is selected
  useEffect(() => {
    if (!selectedHostel || !schoolCoords || !directionsService.current) return;
    
    const hostelCoords = selectedHostel.coords;
    if (!hostelCoords) return;
    
    const request = {
      origin: { lat: schoolCoords[1], lng: schoolCoords[0] },
      destination: { lat: hostelCoords[1], lng: hostelCoords[0] },
      travelMode: travelMode
    };
    
    directionsService.current.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.current.setDirections(result);
        setDirections(result);
      } else {
        console.error('Directions request failed:', status);
      }
    });
    
    // Center map on both locations
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(new window.google.maps.LatLng(schoolCoords[1], schoolCoords[0]));
    bounds.extend(new window.google.maps.LatLng(hostelCoords[1], hostelCoords[0]));
    mapInstance.current.fitBounds(bounds);
    
  }, [selectedHostel, schoolCoords, travelMode]);

  // Clear directions when no hostel selected
  useEffect(() => {
    if (!selectedHostel && directionsRenderer.current) {
      directionsRenderer.current.setDirections(null);
      setDirections(null);
    }
  }, [selectedHostel]);

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
    <div className="flex flex-col h-[800px]">
      <div className="flex flex-col lg:flex-row flex-1 gap-4">
        <div className="flex-1 h-[500px] lg:h-auto rounded-xl overflow-hidden shadow-lg">
          <div ref={mapRef} className="w-full h-full" />
        </div>
        
        <div className="w-full lg:w-96 flex flex-col">
          {selectedHostel ? (
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Directions to {selectedHostel.name}</h2>
                <button 
                  onClick={() => setSelectedHostel(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTravelMode('DRIVING')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm ${
                      travelMode === 'DRIVING' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1

v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-1-1h-8.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 008.586 3H3z" />
                    </svg>
                    Drive
                  </button>
                  <button
                    onClick={() => setTravelMode('WALKING')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm ${
                      travelMode === 'WALKING' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    Walk
                  </button>
                  <button
                    onClick={() => setTravelMode('TRANSIT')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm ${
                      travelMode === 'TRANSIT' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-.293-.707l-7-7A1 1 0 0012 2H3z" />
                    </svg>
                    Transit
                  </button>
                </div>
              </div>
              
              <div ref={directionsRef} className="directions-panel overflow-auto max-h-[500px]"></div>
              
              {directions && directions.routes[0]?.legs[0] && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Total Distance</p>
                      <p className="text-lg font-bold">{directions.routes[0].legs[0].distance.text}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estimated Time</p>
                      <p className="text-lg font-bold">{directions.routes[0].legs[0].duration.text}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1">
              <h3 className="text-lg font-bold mb-4">Hostel Information</h3>
              <p className="text-gray-600">
                Click on a hostel marker and select "Get Directions" to see the route from your school.
              </p>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Hostel Legend</h4>
                <div className="flex items-center mb-2">
                  <School className="text-blue-500 mr-2" style={{ width: '16px', height: '16px', color: 'blue' }} />
                  <span className="text-sm">{schoolName || 'Your School'}</span>
                </div>
                <div className="flex items-center">
                  <Bed className="text-red-500 mr-2" style={{ width: '16px', height: '16px', color: 'red' }} />
                  <span className="text-sm">Hostel Location</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Nearby Hostels</h4>
                <div className="space-y-3 max-h-60 overflow-auto">
                  {hostels
                    .filter(h => h.distance !== null)
                    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
                    .slice(0, 5)
                    .map(hostel => (
                      <div 
                        key={hostel.id} 
                        className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedHostel(hostel)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{hostel.name}</span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                            {hostel.distance?.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{hostel.address}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;