import { parseLocation } from '@/utils/geo';
import { useEffect, useState } from 'react';

export function useDistanceFilter() {
  const [schoolCoords, setSchoolCoords] = useState<[number, number] | null>(null);
  
  useEffect(() => {
    // Fetch user profile to get school coordinates
    async function fetchSchoolLocation() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!accessToken) return;
        
        const res = await fetch('http://localhost:1000/auth/user-profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (res.ok) {
          const profile = await res.json();
          if (profile.school?.location) {
            const coords = parseLocation(profile.school.location);
            if (coords) setSchoolCoords(coords);
          }
        }
      } catch (error) {
        console.error('Failed to fetch school location', error);
      }
    }
    
    fetchSchoolLocation();
  }, []);

  return schoolCoords;
}