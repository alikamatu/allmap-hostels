'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import { FaWifi, FaParking, FaUtensils, FaShieldAlt, FaTshirt, FaBed, FaStar, FaChevronLeft, FaChevronRight, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { MapModal } from '@/_components/hostels/MapModal';
import { RoomType } from '@/types/booking';
import { bookingService } from '@/service/bookingService';
import { BookingModal } from '@/_components/bookings/BookingModal';

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  images: string[];
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
  };
  roomTypes: RoomType[];
  accepting_bookings: boolean;
  location: string;
  rating: number;
  reviews: number;
  contact?: { admin?: string; phone?: string; email?: string };
}

const MemoizedRoomCard = memo(({ roomType, onBook, onViewRoom, acceptingBookings }: { 
  roomType: RoomType; 
  onBook: (roomType: RoomType) => void;
  onViewRoom: (roomTypeId: string) => void;
  acceptingBookings: boolean;
}) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-black">{roomType.name}</h3>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              roomType.availableRooms > 3 
                ? 'bg-green-100 text-green-800' 
                : roomType.availableRooms > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {roomType.availableRooms > 0 ? `${roomType.availableRooms} available` : 'Fully booked'}
          </span>
        </div>
        
        <p className="text-gray-800 text-sm mb-6 line-clamp-2 leading-relaxed">
          {roomType.description || 'Comfortable living space with essential amenities'}
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg font-bold text-black">{formatPrice(roomType.pricePerSemester)}</p>
            <p className="text-xs text-gray-800">per semester</p>
            <p className='text-xs py-1 rounded-full font-medium w-contain text-red-800'>{roomType.allowedGenders}</p>
          </div>
          <div>
            <p className="text-gray-800 font-medium">{formatPrice(roomType.pricePerMonth)}</p>
            <p className="text-xs text-gray-800">per month</p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-800 mb-3">
            <span>Capacity</span>
            <span className="font-medium">{roomType.capacity} person(s)</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black rounded-full" 
              style={{ width: `${Math.min((roomType.capacity / 6) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 mb-6">
          <h4 className="font-medium text-black mb-3">Room Features</h4>
          <div className="flex flex-wrap gap-2">
            {roomType.amenities.slice(0, 4).map((amenity, idx) => (
              <span 
                key={idx} 
                className="text-gray-800 text-xs px-3 py-1.5 bg-gray-100 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {roomType.amenities.length > 4 && (
              <span className="text-gray-800 text-xs px-3 py-1.5 bg-gray-100 rounded-full">
                +{roomType.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gray-100 text-black py-3 px-4 font-medium rounded-lg transition hover:bg-gray-200"
            onClick={() => onViewRoom(roomType.id)}
            disabled={!acceptingBookings}
          >
            View Details
          </motion.button>

          {!acceptingBookings ? (
            <motion.button
              className="flex-1 bg-red-100 text-red-800 py-3 px-4 font-medium rounded-lg transition cursor-not-allowed"
              disabled={true}
            >
              Unavailable
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-4 font-medium rounded-lg transition ${
                roomType.availableRooms > 0
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => roomType.availableRooms > 0 && onBook(roomType)}
              disabled={roomType.availableRooms === 0}
            >
              {roomType.availableRooms > 0 ? 'Book Now' : 'Fully Booked'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MemoizedRoomCard.displayName = "MemoizedRoomCard";

export default function HostelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'availability'>('price');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  useEffect(() => {
    async function fetchHostel() {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch(`${apiUrl}/hostels/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch hostel: ${res.statusText}`);

        const hostelData = await res.json();
        const roomRes = await fetch(`${apiUrl}/hostels/${id}/room-types`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!roomRes.ok) throw new Error(`Failed to fetch room types: ${roomRes.statusText}`);

        const roomTypes = await roomRes.json();
        
        // Add availability check for each room type
        const roomTypesWithAvailability = await Promise.all(
          roomTypes.map(async (roomType: RoomType) => {
            try {
              const today = new Date();
              const nextMonth = new Date();
              nextMonth.setMonth(today.getMonth() + 1);
              
              const availability = await bookingService.checkRoomAvailability(
                id as string,
                today.toISOString().split('T')[0],
                nextMonth.toISOString().split('T')[0],
                roomType.id
              );
              
              const availableRoomsOfType = availability.rooms.filter(
                room => room.roomType.id === roomType.id
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

        setHostel({ ...hostelData, roomTypes: roomTypesWithAvailability, rating, reviews });
      } catch (err: any) {
        console.error('Error:', err);
        setError('Unable to fetch hostel details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchHostel();
  }, [id, apiUrl]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);
  }, []);

  const openGallery = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleViewRoom = useCallback((roomTypeId: string) => {
    router.push(`/dashboard/hostels/${id}/room-types/${roomTypeId}`);
  }, [id, router]);

  const handleBookRoom = useCallback((roomType: RoomType) => {
    if (roomType.availableRooms > 0) {
      setSelectedRoomType(roomType);
      setBookingModalOpen(true);
    }
  }, []);

  const closeGallery = useCallback(() => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const navigateImage = useCallback((direction: 'next' | 'prev') => {
    if (!hostel) return;
    setCurrentImageIndex((prev) =>
      direction === 'next'
        ? (prev + 1) % hostel.images.length
        : (prev - 1 + hostel.images.length) % hostel.images.length
    );
  }, [hostel]);

  // Keyboard navigation for gallery
  useEffect(() => {
    if (!galleryOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === 'Escape') closeGallery();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen, navigateImage, closeGallery]);

  // Sort room types
  const sortedRoomTypes = hostel?.roomTypes
    ? [...hostel.roomTypes].sort((a, b) =>
        sortBy === 'price'
          ? a.pricePerSemester - b.pricePerSemester
          : b.availableRooms - a.availableRooms
      )
    : [];

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-white font-sans"
      >
        <div className="text-center max-w-md">
          <FiAlertTriangle className="text-black text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Error Loading Hostel</h2>
          <p className="text-gray-800 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/hostels" className="text-black hover:underline font-medium">
              Back to Hostels
            </Link>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
              className="text-black hover:underline font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading || !hostel) {
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

  return (
    <div className="bg-white font-sans">
      {/* Modals */}
      {hostel && (
        <>
          <MapModal
            isOpen={showMap}
            onClose={() => setShowMap(false)}
            location={hostel.location}
            hostelName={hostel.name}
          />
          
          {selectedRoomType && (
            <BookingModal
              isOpen={bookingModalOpen}
              onClose={() => {
                setBookingModalOpen(false);
                setSelectedRoomType(null);
              }}
              roomType={selectedRoomType}
              hostel={{
                id: hostel.id,
                name: hostel.name,
                address: hostel.address
              }}
            />
          )}
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Gallery Modal */}
        <AnimatePresence>
          {galleryOpen && hostel.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-2xl" />
              </motion.button>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-full max-h-[90vh]"
              >
                <img
                  src={hostel.images[currentImageIndex]}
                  alt={`${hostel.name} gallery image ${currentImageIndex + 1}`}
                  className="object-contain max-h-[90vh]"
                  loading="lazy"
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
                aria-label="Next image"
              >
                <FaChevronRight className="text-2xl" />
              </motion.button>
              <div className="absolute bottom-4 text-black text-base">
                {currentImageIndex + 1} / {hostel.images.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hostel Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link href="/dashboard/hostels" className="inline-flex items-center text-black hover:underline font-medium mb-4">
            Back to Hostels
          </Link>
          <h1 className="text-4xl sm:text-3xl font-bold text-black">{hostel.name}</h1>
          <span>
            {
              (hostel.accepting_bookings) ? <span className="text-green-500">Accepting Bookings</span> : <span className="text-red-500">Not Accepting Bookings</span>
            }
          </span>
          <div className="flex items-center mt-2 gap-2">
            <div className="flex text-black">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.floor(hostel.rating) ? '' : 'opacity-30'} />
              ))}
            </div>
            <span className="text-gray-800">{hostel.rating} ({hostel.reviews} reviews)</span>
          </div>
          <div className="mt-2 text-gray-800">{hostel.address}</div>
          {hostel.roomTypes[0] && (
            <div className="mt-4">
              <div className="text-lg font-bold text-black">{formatPrice(hostel.roomTypes[0].pricePerMonth)}</div>
              <div className="text-sm text-gray-800">Starting price per month</div>
            </div>
          )}
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12"
        >
          {hostel.images.length > 0 ? (
            hostel.images.map((image, index) => (
              <motion.div
                key={index}
                className={`relative cursor-pointer overflow-hidden rounded-lg ${index === 0 ? 'md:col-span-4 h-80' : 'md:col-span-1 h-40'}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => openGallery(index)}
              >
                <img
                  src={image}
                  alt={`${hostel.name} image ${index + 1}`}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                />
              </motion.div>
            ))
          ) : (
            <div className="md:col-span-4 h-64 flex items-center justify-center rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Placeholder hostel image"
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column - Description & Amenities */}
          <div className="md:col-span-1 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-black mb-4">Description</h2>
              <hr className="border-t border-gray-200 mb-4" />
              <p className="text-gray-800 whitespace-pre-line leading-relaxed">{hostel.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-black mb-4">Amenities</h2>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hostel.amenities.wifi && (
                  <div className="flex items-center">
                    <FaWifi className="text-black text-lg mr-3" />
                    <span className="text-gray-800">Wi-Fi</span>
                  </div>
                )}
                {hostel.amenities.parking && (
                  <div className="flex items-center">
                    <FaParking className="text-black text-lg mr-3" />
                    <span className="text-gray-800">Parking</span>
                  </div>
                )}
                {hostel.amenities.cafeteria && (
                  <div className="flex items-center">
                    <FaUtensils className="text-black text-lg mr-3" />
                    <span className="text-gray-800">Cafeteria</span>
                  </div>
                )}
                {hostel.amenities.security && (
                  <div className="flex items-center">
                    <FaShieldAlt className="text-black text-lg mr-3" />
                    <span className="text-gray-800">24/7 Security</span>
                  </div>
                )}
                {hostel.amenities.laundry && (
                  <div className="flex items-center">
                    <FaTshirt className="text-black text-lg mr-3" />
                    <span className="text-gray-800">Laundry</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Hostel Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="md:col-span-1 lg:sticky lg:top-4"
          >
            <h2 className="text-xl font-bold text-black mb-4">Hostel Information</h2>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="space-y-6">
              {hostel.contact && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
                  {hostel.contact.admin && <p className="text-gray-800 mb-1">Admin: {hostel.contact.admin}</p>}
                  {hostel.contact.phone && <p className="text-gray-800 mb-1">Phone: {hostel.contact.phone}</p>}
                  {hostel.contact.email && <p className="text-gray-800">Email: {hostel.contact.email}</p>}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                <p className="text-gray-800 mb-2">{hostel.address}</p>
                <button 
                  onClick={() => setShowMap(true)}
                  className="text-black hover:underline text-sm font-medium"
                >
                  View on map →
                </button>
              </div>
              
              {/* Quick Stats */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Room Types</span>
                    <span className="font-medium">{hostel.roomTypes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Rooms</span>
                    <span className="font-medium text-green-600">
                      {hostel.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting From</span>
                    <span className="font-medium">
                      {formatPrice(Math.min(...hostel.roomTypes.map(rt => rt.pricePerMonth)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white py-3 px-6 font-medium rounded-lg transition hover:bg-gray-800"
                onClick={() => {
                  if (hostel.roomTypes.length > 0 && hostel.roomTypes[0].availableRooms > 0) {
                    handleBookRoom(hostel.roomTypes[0]);
                  }
                }}
              >
                Quick Book Now
              </motion.button> */}
            </div>
          </motion.div>
        </div>

        {/* Room Types Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-black">Available Room Types</h2>
              <p className="text-gray-800 text-sm mt-1">
                {sortedRoomTypes.filter(rt => rt.availableRooms > 0).length} of {sortedRoomTypes.length} room types available
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'availability')}
                className="text-black bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="price">Sort by Price</option>
                <option value="availability">Sort by Availability</option>
              </select>
            </div>
          </div>
          
          <hr className="border-t border-gray-200 mb-8" />

          {sortedRoomTypes.length > 0 ?  (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRoomTypes.map((roomType) => (
                <MemoizedRoomCard 
                  key={roomType.id}
                  roomType={roomType} 
                  onBook={handleBookRoom}
                  onViewRoom={handleViewRoom} 
                  acceptingBookings={hostel.accepting_bookings}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FaBed className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-black mb-2">No Room Types Available</h3>
              <p className="text-gray-800">
                This hostel doesn&apos;t have any room types configured yet. Please check back later.
              </p>
            </div>
          )}
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-20 text-center bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
            Ready to make {hostel.name} your home?
          </h2>
          <p className="text-gray-800 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join the community of students who have made {hostel.name} their home away from home. 
            Experience comfortable living with modern amenities and excellent service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white py-3 px-8 font-medium rounded-lg transition hover:bg-gray-800"
              onClick={() => {
                const availableRoomType = hostel.roomTypes.find(rt => rt.availableRooms > 0);
                if (availableRoomType) {
                  handleBookRoom(availableRoomType);
                }
              }}
              disabled={!hostel.roomTypes.some(rt => rt.availableRooms > 0)}
            >
              Book Your Room Now
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-black text-black py-3 px-8 font-medium rounded-lg transition hover:bg-black hover:text-white"
              onClick={() => setShowMap(true)}
            >
              View Location
            </motion.button>
          </div>

          {!hostel.roomTypes.some(rt => rt.availableRooms > 0) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                This hostel is currently fully booked. Contact us to join the waiting list or check for cancellations.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}