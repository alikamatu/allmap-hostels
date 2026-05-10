'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  hostelName: string;
}

function parseLocation(loc: any): [number, number] | null {
  if (!loc) return null;

  if (typeof loc === 'object' && loc.coordinates) {
    return [loc.coordinates[0], loc.coordinates[1]];
  }

  if (typeof loc === 'string') {
    const pointMatch = loc.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/);
    if (pointMatch) return [parseFloat(pointMatch[1]), parseFloat(pointMatch[2])];

    if (loc.startsWith('0101000020E6100000')) {
      try {
        const hex = loc.substring(18);
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        const view = new DataView(bytes.buffer);
        return [view.getFloat64(0, true), view.getFloat64(8, true)];
      } catch {
        return null;
      }
    }

    const coordMatch = loc.match(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/);
    if (coordMatch) return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
  }

  return null;
}

function haversineKm(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number],
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const MapModal = ({ isOpen, onClose, location, hostelName }: MapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const [hostelCoords, setHostelCoords] = useState<[number, number] | null>(null);
  const [schoolCoords, setSchoolCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse hostel coords
  useEffect(() => {
    const coords = parseLocation(location);
    if (coords) {
      setHostelCoords(coords);
      setParseError(null);
    } else {
      setParseError('Unable to parse hostel location.');
    }
  }, [location]);

  // Fetch school coords
  useEffect(() => {
    const accessToken =
      localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token');
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user-profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((profile) => {
        if (profile.school?.location) {
          const coords = parseLocation(profile.school.location);
          if (coords) setSchoolCoords(coords);
        }
      })
      .catch(() => {});
  }, []);

  // Compute distance
  useEffect(() => {
    if (hostelCoords && schoolCoords) {
      setDistance(haversineKm(schoolCoords, hostelCoords));
    }
  }, [hostelCoords, schoolCoords]);

  // Build / destroy map
  useEffect(() => {
    if (!isOpen || !hostelCoords || !mapRef.current) return;

    // Destroy existing instance before re-creating
    mapInstance.current?.remove();
    mapInstance.current = null;

    import('leaflet').then((L) => {
      // Fix broken default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView(
        [hostelCoords[1], hostelCoords[0]],
        15,
      );
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Hostel marker
      const redIcon = L.divIcon({
        className: '',
        html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([hostelCoords[1], hostelCoords[0]], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<strong>${hostelName}</strong>`)
        .openPopup();

      // School marker
      if (schoolCoords) {
        const blueIcon = L.divIcon({
          className: '',
          html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([schoolCoords[1], schoolCoords[0]], { icon: blueIcon })
          .addTo(map)
          .bindPopup('<strong>Your School</strong>');

        const bounds = L.latLngBounds(
          [hostelCoords[1], hostelCoords[0]],
          [schoolCoords[1], schoolCoords[0]],
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [isOpen, hostelCoords, schoolCoords, hostelName]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  if (parseError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4"
      >
        <div className="text-center max-w-md">
          <FiAlertTriangle className="text-black text-5xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-black mb-2">Unable to Load Map</h2>
          <p className="text-gray-600 mb-6">{parseError}</p>
          <button
            onClick={onClose}
            className="bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-black">{hostelName} Location</h2>
          <button onClick={onClose} className="text-black hover:text-gray-600">
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} className="w-full h-[400px] sm:h-[460px]" />

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2 border border-white shadow" />
              <span className="text-sm text-gray-700">{hostelName}</span>
            </div>
            {schoolCoords && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 border border-white shadow" />
                <span className="text-sm text-gray-700">Your School</span>
              </div>
            )}
          </div>

          {distance !== null && (
            <div className="p-3 bg-blue-50 rounded-lg mb-3">
              <p className="text-center font-medium text-sm">
                Distance from your school: {distance.toFixed(1)} km
              </p>
            </div>
          )}

          {hostelCoords && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${hostelCoords[1]},${hostelCoords[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Get Directions in Google Maps
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
