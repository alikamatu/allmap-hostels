import { useEffect, useState } from 'react';
import { parseLocation } from '@/utils/geo';

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

            console.log('User profile:', profile);
          
          // Check if school location exists
          if (profile.school?.location) {
            // Parse the location string or object
            const coords = parseLocation(profile.school.location);
            
            if (coords) {
              console.log('School coordinates:', coords);
              setSchoolCoords(coords);
            } else {
              console.warn('Failed to parse school location:', profile.school.location);
            }
          } else {
            console.warn('School location not found in profile:', profile);
          }
        } else {
          console.error('Failed to fetch user profile:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch school location', error);
      }
    }

    
    fetchSchoolLocation();
  }, []);

  return schoolCoords;
}

export function useUserSchoolName() {
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchoolName() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!accessToken) return;

        const res = await fetch('http://localhost:1000/auth/user-profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const profile = await res.json();
          if (profile.school?.name) {
            setSchoolName(profile.school.name);
          }
        } else {
          console.error('Failed to fetch user profile:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch school name', error);
      }
    }

    fetchSchoolName();
  }, []);

  return schoolName;
}