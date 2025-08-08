'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBed, FaBath, FaRulerCombined, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function RoomDetailPage() {
  const { id, roomTypeId } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  useEffect(() => {
    async function fetchRoom() {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch(`${apiUrl}/hostels/${id}/room-types/${roomTypeId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch room: ${res.statusText}`);
        
        const roomData = await res.json();
        setRoom(roomData);
      } catch (err: any) {
        console.error('Error:', err);
        setError('Unable to fetch room details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [id, roomTypeId, apiUrl]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <span className="mt-4 text-gray-600">Loading room details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="text-center max-w-md">
          <FiAlertTriangle className="text-black text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Error Loading Room</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/dashboard/hostels/${id}`)}
            className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Hostel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push(`/hostels/${id}`)}
          className="flex items-center text-black hover:underline mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Hostel
        </button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">{room.name}</h1>
                <p className="text-gray-600 mt-2">{room.description || 'Comfortable living space with essential amenities'}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-2xl font-bold text-black">{formatPrice(room.pricePerSemester)}</p>
                <p className="text-gray-600">per semester</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Room Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaBed className="text-black mr-3 text-xl" />
                    <div>
                      <p className="text-black font-medium">Bed Type</p>
                      <p className="text-gray-600">Single beds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaBath className="text-black mr-3 text-xl" />
                    <div>
                      <p className="text-black font-medium">Bathroom</p>
                      <p className="text-gray-600">{room.amenities.includes('Private Bathroom') ? 'Private' : 'Shared'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaRulerCombined className="text-black mr-3 text-xl" />
                    <div>
                      <p className="text-black font-medium">Room Size</p>
                      <p className="text-gray-600">Approx. 20 m²</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaUsers className="text-black mr-3 text-xl" />
                    <div>
                      <p className="text-black font-medium">Capacity</p>
                      <p className="text-gray-600">{room.capacity} person(s)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Pricing</h2>
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per Semester</span>
                      <span className="font-medium">{formatPrice(room.pricePerSemester)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per Month</span>
                      <span className="font-medium">{formatPrice(room.pricePerMonth)}</span>
                    </div>
                    {room.pricePerWeek && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per Week</span>
                        <span className="font-medium">{formatPrice(room.pricePerWeek)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatPrice(room.pricePerSemester)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-6 w-full bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors">
                    Book This Room
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-xl font-bold text-black mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {room.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-xl font-bold text-black mb-4">Availability</h2>
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rooms Available</span>
                  <span className="font-medium text-black">{room.availableRooms}</span>
                </div>
                <div className="mt-4">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black rounded-full" 
                      style={{ width: `${(room.availableRooms / room.totalRooms) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0</span>
                    <span>{room.totalRooms} total rooms</span>
                  </div>
                </div>
                <button className="mt-6 w-full bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors">
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}