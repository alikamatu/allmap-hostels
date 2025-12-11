"use client";

import { useState, useEffect, useCallback } from 'react';
import { Hostel } from '@/types/hostels';
import { bookingService } from '@/service/bookingService';

export const useHostel = (hostelId: string) => {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  const fetchHostel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('User not authenticated');
      }
      
      console.log(`Fetching hostel ${hostelId} with token present:`, !!accessToken);
      
      // Fetch hostel details, contact info, and room types in parallel
      const [hostelRes, contactRes, roomTypesRes] = await Promise.all([
        fetch(`${apiUrl}/hostels/${hostelId}`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }),
        fetch(`${apiUrl}/hostels/${hostelId}/contact`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }),
        fetch(`${apiUrl}/hostels/students/${hostelId}/room-types`, {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
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
          console.log('Contact info fetched:', contactInfo);
        } catch (contactError) {
          console.warn('Failed to parse contact info:', contactError);
        }
      } else {
        console.warn('Contact endpoint returned:', contactRes.status, contactRes.statusText);
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
      const roomTypes = await roomTypesRes.json();

      console.log('Hostel data received:', {
        id: hostelData.id,
        name: hostelData.name,
        isVerified: hostelData.is_verified,
        acceptingBookings: hostelData.accepting_bookings
      });

      console.log('Room types received:', roomTypes.length);

      // Enhance room types with availability data
      const roomTypesWithAvailability = await Promise.all(
        roomTypes.map(async (roomType: any) => {
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
            
            const availableRoomsOfType = availability.rooms.filter(
              (room: any) => room.roomType.id === roomType.id
            ).length;
            
            return {
              ...roomType,
              availableRooms: availableRoomsOfType,
              totalRooms: roomType.totalRooms || availableRoomsOfType
            };
          } catch (error) {
            console.error(`Failed to check availability for room type ${roomType.id}:`, error);
            return {
              ...roomType,
              availableRooms: roomType.availableRooms || 0,
              totalRooms: roomType.totalRooms || 0
            };
          }
        })
      );

      // Generate random rating and reviews (you can replace with actual data if available)
      const rating = Math.round((Math.random() * 3 + 2) * 10) / 10;
      const reviews = Math.floor(Math.random() * 100) + 10;

      // Build the complete hostel object
      const completeHostel = { 
        ...hostelData, 
        contact: contactInfo || hostelData.contact || {
          admin: 'Hostel Administrator',
          phone: hostelData.phone || 'Not available',
          email: hostelData.email || 'Not available'
        },
        roomTypes: roomTypesWithAvailability, 
        rating, 
        reviews 
      };

      console.log('Setting hostel state:', {
        id: completeHostel.id,
        name: completeHostel.name,
        roomTypes: completeHostel.roomTypes.length,
        contactAvailable: !!completeHostel.contact
      });

      setHostel(completeHostel);
    } catch (err: any) {
      console.error('Error in fetchHostel:', err);
      setError(err.message || 'Unable to fetch hostel details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [hostelId, apiUrl]);

  useEffect(() => {
    if (hostelId) {
      console.log('useHostel useEffect triggered for ID:', hostelId);
      fetchHostel();
    } else {
      console.error('No hostel ID provided to useHostel hook');
      setError('Hostel ID is required');
      setLoading(false);
    }
  }, [hostelId, fetchHostel]);

  const refetch = useCallback(() => {
    console.log('Refetching hostel data...');
    fetchHostel();
  }, [fetchHostel]);

  return {
    hostel,
    loading,
    error,
    refetch
  };
};