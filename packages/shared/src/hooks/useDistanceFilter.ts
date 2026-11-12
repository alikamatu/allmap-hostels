"use client";

import { useEffect, useState } from 'react';
import { parseLocation } from '../utils/geo';

export function useDistanceFilter() {
  const [schoolCoords, setSchoolCoords] = useState<[number, number] | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.school?.location) {
          return parseLocation(user.school.location);
        }
      }
    } catch {}
    return null;
  });
  
  useEffect(() => {
    // If we already resolved coordinates from cached user object, avoid refetching unless needed
    let isMounted = true;
    async function fetchSchoolLocation() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!accessToken) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/user-profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (res.ok && isMounted) {
          const profile = await res.json();
          if (profile.school?.location) {
            const coords = parseLocation(profile.school.location);
            if (coords) {
              setSchoolCoords(coords);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch school location', error);
      }
    }

    fetchSchoolLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  return schoolCoords;
}

export function useUserSchoolName() {
  const [schoolName, setSchoolName] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.school?.name) return user.school.name;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchSchoolName() {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!accessToken) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/user-profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok && isMounted) {
          const profile = await res.json();
          if (profile.school?.name) {
            setSchoolName(profile.school.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch school name', error);
      }
    }

    fetchSchoolName();
    return () => {
      isMounted = false;
    };
  }, []);

  return schoolName;
}