'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HostelCard } from '@repo/types';
import { useUserSchoolName } from '@repo/shared/hooks';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  hostels: HostelCard[];
  schoolCoords: [number, number] | null;
}

interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
}

// Fix Leaflet's broken default icon paths when bundled with webpack/Next.js
function fixLeafletIcons(L: typeof import('leaflet')) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

async function fetchOSRMRoute(
  fromLng: number, fromLat: number,
  toLng: number, toLat: number,
): Promise<{ distance: number; duration: number; geometry: [number, number][] } | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.[0]) return null;
    const route = data.routes[0];
    return {
      distance: route.distance / 1000, // meters → km
      duration: route.duration / 60,    // seconds → minutes
      geometry: route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]), // [lng,lat] → [lat,lng]
    };
  } catch {
    return null;
  }
}

const MapView: React.FC<MapViewProps> = ({ hostels, schoolCoords }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const routeLayerRef = useRef<import('leaflet').Polyline | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const schoolName = useUserSchoolName();
  const [selectedHostel, setSelectedHostel] = useState<HostelCard | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const router = useRouter();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    let aborted = false;

    // Clean up any existing map on this container
    mapInstance.current?.remove();
    mapInstance.current = null;

    import('leaflet').then((L) => {
      if (aborted || !mapRef.current) return;

      fixLeafletIcons(L);
      leafletRef.current = L;

      const center: [number, number] = schoolCoords
        ? [schoolCoords[1], schoolCoords[0]]
        : [5.6037, -0.187];

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(center, 13);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // School marker (blue)
      if (schoolCoords) {
        const schoolIcon = L.divIcon({
          className: '',
          html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([schoolCoords[1], schoolCoords[0]], { icon: schoolIcon })
          .addTo(map)
          .bindPopup(`<strong>${schoolName || 'Your School'}</strong>`);
      }

      // Hostel markers (red)
      hostels
        .filter((h) => h.coords)
        .forEach((hostel) => {
          const hostelIcon = L.divIcon({
            className: '',
            html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const distanceText =
            schoolCoords && hostel.distance != null
              ? `${hostel.distance.toFixed(1)} km from your school`
              : 'Distance not available';

          const marker = L.marker([hostel.coords![1], hostel.coords![0]], { icon: hostelIcon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:180px">
                <strong style="font-size:14px">${hostel.name}</strong>
                <p style="margin:4px 0;font-size:12px;color:#555">${hostel.address}</p>
                <p style="margin:4px 0;font-size:12px">${distanceText}</p>
                <button
                  onclick="window.__leafletSelectHostel('${hostel.id}')"
                  style="margin-top:6px;width:100%;padding:4px 8px;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px"
                >Get Directions</button>
                <button
                  onclick="window.__leafletViewHostel('${hostel.id}')"
                  style="margin-top:4px;width:100%;padding:4px 8px;background:#111;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px"
                >View Hostel</button>
              </div>`,
              { maxWidth: 220 },
            );

          marker.on('click', () => marker.openPopup());
        });

      // Fit bounds to show all markers
      const allCoords = hostels
        .filter((h) => h.coords)
        .map((h) => [h.coords![1], h.coords![0]] as [number, number]);
      if (schoolCoords) allCoords.push([schoolCoords[1], schoolCoords[0]]);
      if (allCoords.length > 1) {
        map.fitBounds(allCoords, { padding: [40, 40] });
      }

      // Global callbacks from popup buttons
      (window as any).__leafletSelectHostel = (id: string) => {
        const h = hostels.find((x) => x.id === id);
        if (h) setSelectedHostel(h);
      };
      (window as any).__leafletViewHostel = (id: string) => {
        router.push(`/dashboard/hostels/${id}`);
      };
    });

    return () => {
      aborted = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      leafletRef.current = null;
      routeLayerRef.current = null;
      delete (window as any).__leafletSelectHostel;
      delete (window as any).__leafletViewHostel;
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw route when a hostel is selected
  useEffect(() => {
    if (!selectedHostel?.coords || !schoolCoords || !mapInstance.current) {
      // Clear existing route
      if (routeLayerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      setRouteInfo(null);
      return;
    }

    let cancelled = false;
    setLoadingRoute(true);

    fetchOSRMRoute(
      schoolCoords[0], schoolCoords[1],         // from: school [lng, lat]
      selectedHostel.coords[0], selectedHostel.coords[1], // to: hostel [lng, lat]
    ).then((result) => {
      if (cancelled || !mapInstance.current) return;

      // Remove previous route
      if (routeLayerRef.current) {
        mapInstance.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (result && leafletRef.current) {
        const L = leafletRef.current;
        // Draw route polyline
        const polyline = L.polyline(result.geometry as any, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 6',
        }).addTo(mapInstance.current!);
        routeLayerRef.current = polyline;

        // Fit map to route
        mapInstance.current!.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        setRouteInfo({
          distance: result.distance,
          duration: result.duration,
        });
      } else {
        setRouteInfo(null);
      }
      setLoadingRoute(false);
    });

    return () => { cancelled = true; };
  }, [selectedHostel, schoolCoords]);

  return (
    <div className="flex flex-col h-[800px]">
      <div className="flex flex-col lg:flex-row flex-1 gap-4">
        {/* Map */}
        <div className="flex-1 h-[500px] lg:h-auto rounded-xl overflow-hidden shadow-lg">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-96 flex flex-col">
          {selectedHostel ? (
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Directions to {selectedHostel.name}</h2>
                <button onClick={() => setSelectedHostel(null)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Route info card */}
              {loadingRoute && (
                <div className="p-3 bg-gray-50 rounded-lg mb-4 animate-pulse">
                  <p className="text-sm text-gray-500 text-center">Calculating route...</p>
                </div>
              )}

              {routeInfo && !loadingRoute && (
                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Road Distance</p>
                      <p className="text-lg font-bold text-blue-700">{routeInfo.distance.toFixed(1)} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-medium">Est. Drive Time</p>
                      <p className="text-lg font-bold text-blue-700">
                        {routeInfo.duration < 60
                          ? `${Math.round(routeInfo.duration)} min`
                          : `${Math.floor(routeInfo.duration / 60)}h ${Math.round(routeInfo.duration % 60)}m`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!routeInfo && !loadingRoute && (
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="font-medium text-sm">{selectedHostel.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedHostel.address}</p>
                  {selectedHostel.distance != null && (
                    <p className="text-xs text-blue-700 mt-1 font-medium">
                      {selectedHostel.distance.toFixed(1)} km from your school (straight line)
                    </p>
                  )}
                </div>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHostel.coords?.[1]},${selectedHostel.coords?.[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Open in Google Maps
              </a>

              <a
                href={`https://www.openstreetmap.org/directions?from=${schoolCoords ? `${schoolCoords[1]},${schoolCoords[0]}` : ''}&to=${selectedHostel.coords?.[1]},${selectedHostel.coords?.[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center mt-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Open in OpenStreetMap
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1">
              <h3 className="text-lg font-bold mb-4">Hostel Information</h3>
              <p className="text-gray-600 text-sm">
                Click on a hostel marker and select &quot;Get Directions&quot; to see the route, road distance, and estimated drive time.
              </p>

              <div className="mt-6">
                <h4 className="font-medium mb-2 text-sm">Legend</h4>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 border border-white shadow" />
                  <span className="text-sm">{schoolName || 'Your School'}</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2 border border-white shadow" />
                  <span className="text-sm">Hostel Location</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-0 mr-2 border-t-2 border-dashed border-blue-500" />
                  <span className="text-sm">Driving Route</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2 text-sm">Nearby Hostels</h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {hostels
                    .filter((h) => h.distance != null)
                    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
                    .slice(0, 5)
                    .map((hostel) => (
                      <div
                        key={hostel.id}
                        className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedHostel(hostel)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">{hostel.name}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
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
