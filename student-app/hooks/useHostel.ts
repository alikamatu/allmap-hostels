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
      const [hostelRes, roomTypesRes] = await Promise.all([
        fetch(`${apiUrl}/hostels/${hostelId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${apiUrl}/hostels/students/${hostelId}/room-types`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      ]);

      if (!hostelRes.ok) throw new Error(`Failed to fetch hostel: ${hostelRes.statusText}`);
      if (!roomTypesRes.ok) throw new Error(`Failed to fetch room types: ${roomTypesRes.statusText}`);

      const hostelData = await hostelRes.json();
      const roomTypes = await roomTypesRes.json();

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

      const rating = Math.round((Math.random() * 3 + 2) * 10) / 10;
      const reviews = Math.floor(Math.random() * 100) + 10;

      setHostel({ 
        ...hostelData, 
        roomTypes: roomTypesWithAvailability, 
        rating, 
        reviews 
      });
    } catch (err: any) {
      console.error('Error fetching hostel:', err);
      setError(err.message || 'Unable to fetch hostel details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [hostelId, apiUrl]);

  useEffect(() => {
    if (hostelId) {
      fetchHostel();
    }
  }, [hostelId, fetchHostel]);

  const refetch = useCallback(() => {
    fetchHostel();
  }, [fetchHostel]);

  return {
    hostel,
    loading,
    error,
    refetch
  };
};