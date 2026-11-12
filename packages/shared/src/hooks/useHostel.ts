"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Hostel } from '@repo/types';
import { bookingService } from '../service/bookingService';

// Module-level in-memory cache for ultra-fast instant page transitions
interface CacheEntry {
  data: Hostel;
  timestamp: number;
}
const hostelCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const useHostel = (hostelId: string) => {
  const cached = hostelCache.get(hostelId);
  const isCacheValid = cached && (Date.now() - cached.timestamp < CACHE_TTL_MS);

  const [hostel, setHostel] = useState<Hostel | null>(cached ? cached.data : null);
  const [loading, setLoading] = useState<boolean>(!isCacheValid);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  const fetchHostel = useCallback(async (isBackgroundRevalidation = false) => {
    try {
      if (!isBackgroundRevalidation) {
        setLoading(true);
      }
      setError(null);
      
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('User not authenticated');
      }
      
      // Fetch hostel details, contact info, and room types concurrently
      const [hostelRes, contactRes, roomTypesRes] = await Promise.all([
        fetch(`${apiUrl}/hostels/${hostelId}`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'default'
        }),
        fetch(`${apiUrl}/hostels/${hostelId}/contact`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'default'
        }),
        fetch(`${apiUrl}/hostels/students/${hostelId}/room-types`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'default'
        })
      ]);

      // Check hostel response
      if (!hostelRes.ok) {
        const errorText = await hostelRes.text();
        console.error('Hostel fetch error:', {
          status: hostelRes.status,
          statusText: hostelRes.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch hostel: ${hostelRes.statusText}`);
      }

      // Check contact response (optional - don't fail if contact endpoint doesn't exist)
      let contactInfo = null;
      if (contactRes.ok) {
        try {
          contactInfo = await contactRes.json();
        } catch (contactError) {
          console.warn('Failed to parse contact info:', contactError);
        }
      }

      // Check room types response
      if (!roomTypesRes.ok) {
        const errorText = await roomTypesRes.text();
        console.error('Room types fetch error:', {
          status: roomTypesRes.status,
          statusText: roomTypesRes.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch room types: ${roomTypesRes.statusText}`);
      }

      const hostelData = await hostelRes.json();
      const rawRoomTypes = await roomTypesRes.json();

      // Immediate baseline room types so page renders without waiting for room availability check
      const baseRoomTypes = (rawRoomTypes || []).map((rt: any) => ({
        ...rt,
        availableRooms: typeof rt.availableRooms === 'number' ? rt.availableRooms : (rt.available_rooms ?? 0),
        totalRooms: typeof rt.totalRooms === 'number' ? rt.totalRooms : (rt.total_rooms ?? 0),
      }));

      // Build the initial hostel object
      const initialHostel: Hostel = { 
        ...hostelData, 
        contact: contactInfo || hostelData.contact || {
          admin: 'Hostel Administrator',
          phone: hostelData.phone || 'Not available',
          email: hostelData.email || 'Not available'
        },
        roomTypes: baseRoomTypes, 
        rating: typeof hostelData.rating === 'number' ? hostelData.rating : 0, 
        reviews: typeof hostelData.total_reviews === 'number' ? hostelData.total_reviews : (hostelData.reviews?.length || 0)
      };

      if (!isMountedRef.current) return;

      // Update state and cache immediately so the user sees all hostel data instantly
      setHostel(initialHostel);
      setLoading(false);
      hostelCache.set(hostelId, { data: initialHostel, timestamp: Date.now() });

      // In the background, asynchronously verify exact room availability if needed
      if (rawRoomTypes.length > 0 && hostelData.accepting_bookings) {
        Promise.all(
          rawRoomTypes.map(async (roomType: any) => {
            try {
              const today = new Date();
              const nextMonth = new Date();
              nextMonth.setMonth(today.getMonth() + 1);
              
              const availability = await bookingService.checkRoomAvailability(
                hostelId,
                today.toISOString().split('T')[0],
                nextMonth.toISOString().split('T')[0],
                roomType.id
              );
              
              const availableRoomsOfType = availability?.rooms ? availability.rooms.filter(
                (room: any) => room.roomType.id === roomType.id
              ).length : (roomType.availableRooms ?? 0);
              
              return {
                ...roomType,
                availableRooms: availableRoomsOfType,
                totalRooms: roomType.totalRooms || availableRoomsOfType
              };
            } catch (err) {
              return {
                ...roomType,
                availableRooms: roomType.availableRooms || 0,
                totalRooms: roomType.totalRooms || 0
              };
            }
          })
        ).then((updatedRoomTypes) => {
          if (!isMountedRef.current) return;
          setHostel(prev => {
            if (!prev) return null;
            const updated = { ...prev, roomTypes: updatedRoomTypes };
            hostelCache.set(hostelId, { data: updated, timestamp: Date.now() });
            return updated;
          });
        }).catch(() => {
          // Silent fallback to baseline room types
        });
      }

    } catch (err: any) {
      console.error('Error in fetchHostel:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Unable to fetch hostel details. Please try again.');
        setLoading(false);
      }
    }
  }, [hostelId, apiUrl]);

  useEffect(() => {
    if (hostelId) {
      const entry = hostelCache.get(hostelId);
      const valid = entry && (Date.now() - entry.timestamp < CACHE_TTL_MS);
      if (valid) {
        setHostel(entry.data);
        setLoading(false);
        // Stale-while-revalidate in background
        fetchHostel(true);
      } else {
        fetchHostel(false);
      }
    } else {
      setError('Hostel ID is required');
      setLoading(false);
    }
  }, [hostelId, fetchHostel]);

  const refetch = useCallback(() => {
    fetchHostel(false);
  }, [fetchHostel]);

  return {
    hostel,
    loading,
    error,
    refetch
  };
};
