'use client';

import { useState, useEffect } from 'react';

export default function useLiveLocation() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    error: string | null;
    loading: boolean;
  }>({
    lat: 0,
    lng: 0,
    accuracy: 0,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      error => {
        setLocation(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}