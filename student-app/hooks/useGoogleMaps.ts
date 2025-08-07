"use client";

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    if (existingScript) {
      // If script is already in DOM, wait for it to load
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
      setError(null);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  return { isLoaded, error };
}