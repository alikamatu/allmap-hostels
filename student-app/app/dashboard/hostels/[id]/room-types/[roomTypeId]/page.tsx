'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBed, FaBath, FaRulerCombined, FaUsers, FaArrowLeft, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Room, RoomType } from '@/types/booking';
import { bookingService } from '@/service/bookingService';
import { BookingModal } from '@/_components/bookings/BookingModal';

interface RoomTypeWithAvailability extends RoomType {
  availableRooms: number;
  totalRooms: number;
  sampleRooms?: Room[];
}

export default function RoomDetailPage() {
  const { id, roomTypeId } = useParams();
  const router = useRouter();
  const [roomType, setRoomType] = useState<RoomTypeWithAvailability | null>(null);
  const [hostel, setHostel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  useEffect(() => {
    async function fetchRoomDetails() {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        
        // Fetch hostel details
        const hostelRes = await fetch(`${apiUrl}/hostels/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!hostelRes.ok) throw new Error(`Failed to fetch hostel: ${hostelRes.statusText}`);
        const hostelData = await hostelRes.json();
        setHostel(hostelData);

        // Fetch room type details
        const roomTypeRes = await fetch(`${apiUrl}/hostels/${id}/students/room-types/${roomTypeId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!roomTypeRes.ok) throw new Error(`Failed to fetch room type: ${roomTypeRes.statusText}`);
        const roomTypeData = await roomTypeRes.json();
        
        // Check current availability
        await checkAvailabilityForDates(roomTypeData);
        
      } catch (err: any) {
        console.error('Error:', err);
        setError('Unable to fetch room details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (id && roomTypeId) {
      fetchRoomDetails();
    }
  }, [id, roomTypeId, apiUrl]);

  const checkAvailabilityForDates = async (roomTypeData?: any) => {
    try {
      setCheckingAvailability(true);
      const availability = await bookingService.checkRoomAvailability(
        id as string,
        selectedDates.checkIn,
        selectedDates.checkOut,
        roomTypeId as string
      );

      const roomsOfType = availability.rooms.filter(room => 
        room.roomType.id === roomTypeId
      );

      const updatedRoomType = {
        ...(roomTypeData || roomType),
        availableRooms: roomsOfType.length,
        totalRooms: roomsOfType.length + availability.bookedRooms,
        sampleRooms: roomsOfType.slice(0, 3) // Show first 3 available rooms
      };

      setRoomType(updatedRoomType);
      setAvailabilityData({
        ...availability,
        roomsOfType
      });
    } catch (error) {
      console.error('Failed to check availability:', error);
      // Set roomType without availability data if API call fails
      if (roomTypeData) {
        setRoomType({
          ...roomTypeData,
          availableRooms: 0,
          totalRooms: 0
        });
      }
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    setSelectedDates(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckAvailability = () => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      checkAvailabilityForDates();
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);

  const calculateTotalPrice = () => {
    if (!roomType || !selectedDates.checkIn || !selectedDates.checkOut) return 0;
    
    const checkIn = new Date(selectedDates.checkIn);
    const checkOut = new Date(selectedDates.checkOut);
    
    return bookingService.calculateBookingPrice(
      roomType.pricePerSemester,
      roomType.pricePerMonth,
      roomType.pricePerWeek,
      'monthly' as any, // Default to monthly for calculation
      checkIn,
      checkOut
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] sm:h-[600px] flex items-center justify-center"
      >
        <div className="relative flex w-64 animate-pulse gap-2 p-4">
          <div className="h-12 w-12 rounded-full bg-slate-400"></div>
          <div className="flex-1">
            <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
            <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
          </div>
          <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
        </div>
      </motion.div>
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

  if (!roomType || !hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2">Room not found</h2>
          <button
            onClick={() => router.push(`/dashboard/hostels/${id}`)}
            className="text-black hover:underline"
          >
            Back to Hostel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        roomType={roomType}
        hostel={{
          id: hostel.id,
          name: hostel.name,
          address: hostel.address
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push(`/dashboard/hostels/${id}`)}
          className="flex items-center text-black hover:underline mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to {hostel.name}
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-black">{roomType.name}</h1>
                    <p className="text-gray-600 mt-2">{roomType.description || 'Comfortable living space with essential amenities'}</p>
                    <div className="flex items-center mt-3 gap-4">
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                        roomType.availableRooms > 3 
                          ? 'bg-green-100 text-green-800' 
                          : roomType.availableRooms > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {roomType.availableRooms > 0 ? `${roomType.availableRooms} rooms available` : 'Fully booked'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {roomType.totalRooms} total rooms
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
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
                          <p className="text-gray-600">{roomType.amenities.includes('Private Bathroom') ? 'Private' : 'Shared'}</p>
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
                          <p className="text-gray-600">{roomType.capacity} person(s)</p>
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
                          <span className="font-medium">{formatPrice(roomType.pricePerSemester)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Per Month</span>
                          <span className="font-medium">{formatPrice(roomType.pricePerMonth)}</span>
                        </div>
                        {roomType.pricePerWeek && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Per Week</span>
                            <span className="font-medium">{formatPrice(roomType.pricePerWeek)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-black mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {roomType.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <FaCheck className="text-green-500 mr-2 text-sm" />
                        <span className="text-gray-600 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Rooms Section */}
                {roomType.sampleRooms && roomType.sampleRooms.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-black mb-4">Available Rooms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roomType.sampleRooms.map((room) => (
                        <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-black">Room {room.roomNumber}</h3>
                            <span className="text-sm text-green-600 font-medium">Available</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Floor {room.floor}</p>
                            <p>Occupancy: {room.currentOccupancy}/{room.maxOccupancy}</p>
                          </div>
                        </div>
                      ))}
                      {roomType.availableRooms > 3 && (
                        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                          <div className="text-center">
                            <p className="font-medium text-black">+{roomType.availableRooms - 3}</p>
                            <p className="text-sm text-gray-600">more rooms available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
              >
                <h2 className="text-xl font-bold text-black mb-6">Check Availability & Book</h2>
                
                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <FaCalendarAlt className="inline mr-2" />
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={selectedDates.checkIn}
                      onChange={(e) => handleDateChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <FaCalendarAlt className="inline mr-2" />
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={selectedDates.checkOut}
                      onChange={(e) => handleDateChange('checkOut', e.target.value)}
                      min={selectedDates.checkIn}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={handleCheckAvailability}
                    disabled={checkingAvailability || !selectedDates.checkIn || !selectedDates.checkOut}
                    className="w-full bg-gray-100 text-black py-3 px-4 font-medium rounded-lg transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>

                {/* Availability Status */}
                <div className="mb-6 p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-black">Availability Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      roomType.availableRooms > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {roomType.availableRooms > 0 ? 'Available' : 'Fully Booked'}
                    </span>
                  </div>
                  
                  {selectedDates.checkIn && selectedDates.checkOut && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Selected dates: {new Date(selectedDates.checkIn).toLocaleDateString()} - {new Date(selectedDates.checkOut).toLocaleDateString()}</p>
                      <p>Duration: {bookingService.getDurationInDays(new Date(selectedDates.checkIn), new Date(selectedDates.checkOut))} days</p>
                      <p>Available rooms: {roomType.availableRooms}</p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          roomType.availableRooms > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max((roomType.availableRooms / Math.max(roomType.totalRooms, 1)) * 100, 5)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{roomType.totalRooms} total</span>
                    </div>
                  </div>
                </div>

                {/* Price Calculation */}
                {selectedDates.checkIn && selectedDates.checkOut && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-black mb-3">Price Estimate</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type</span>
                        <span className="font-medium">{roomType.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">
                          {bookingService.getDurationInDays(new Date(selectedDates.checkIn), new Date(selectedDates.checkOut))} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Rate</span>
                        <span className="font-medium">{formatPrice(roomType.pricePerMonth)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between font-bold">
                          <span>Estimated Total</span>
                          <span>{formatPrice(calculateTotalPrice())}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      *Final price may vary based on booking type and duration
                    </p>
                  </div>
                )}

                {/* Book Now Button */}
                <div className="space-y-3">
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    disabled={roomType.availableRooms === 0}
                    className={`w-full py-3 px-4 font-medium rounded-lg transition ${
                      roomType.availableRooms > 0
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {roomType.availableRooms > 0 ? 'Book This Room Type' : 'Currently Unavailable'}
                  </button>
                  
                  {roomType.availableRooms === 0 && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">This room type is fully booked</p>
                      <button
                        onClick={() => router.push(`/dashboard/hostels/${id}`)}
                        className="text-black hover:underline text-sm font-medium"
                      >
                        View other room types →
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-black mb-3">Need Help?</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Free cancellation up to 24 hours before check-in</p>
                    <p>• Instant booking confirmation</p>
                    <p>• 24/7 customer support</p>
                  </div>
                  
                  {hostel.contact?.phone && (
                    <div className="mt-4">
                      <a
                        href={`tel:${hostel.contact.phone}`}
                        className="text-black hover:underline text-sm font-medium"
                      >
                        Call {hostel.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Hostel Policies */}
          {/* <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-black mb-4">Hostel Policies</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Check-in: 2:00 PM - 10:00 PM</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Check-out: Until 11:00 AM</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Quiet hours: 10:00 PM - 7:00 AM</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">No smoking in rooms</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Guests allowed with prior notice</p>
              </div>
            </div>
          </div> */}

          {/* Location Info */}
          {/* <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-black mb-4">Location & Transport</h2>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600 mb-3">{hostel.address}</p>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">5 minutes walk to campus</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Bus stop nearby</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Shopping center within 10 minutes</p>
              </div>
              <div className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-600">Easy access to public transportation</p>
              </div>
            </div>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}