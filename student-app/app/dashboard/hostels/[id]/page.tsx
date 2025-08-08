'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, memo } from 'react';
import { FaWifi, FaParking, FaUtensils, FaShieldAlt, FaTshirt, FaBed, FaStar, FaChevronLeft, FaChevronRight, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { MapModal } from '@/_components/hostels/MapModal';

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
  location: string;
  rating: number;
  reviews: number;
  contact?: { admin?: string; phone?: string; email?: string };
}

interface RoomType {
  id: string;
  name: string;
  description: string | null;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
  capacity: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
}

const MemoizedRoomCard = memo(({ roomType, onViewRoom }: { roomType: RoomType, onViewRoom: (roomTypeId: string) => void }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(price);

  return (
    <motion.div
      className="bg-white"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-black">{roomType.name}</h3>
          <span
            className={`text-xs px-3 py-1 ${
              roomType.availableRooms > 3 ? 'text-black' : roomType.availableRooms > 0 ? 'text-gray-666' : 'text-gray-999'
            }`}
          >
            {roomType.availableRooms > 0 ? `${roomType.availableRooms} available` : 'Fully booked'}
          </span>
        </div>
        <p className="text-gray-666 text-sm mb-6 line-clamp-2 leading-relaxed">
          {roomType.description || 'Comfortable living space with essential amenities'}
        </p>
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg font-bold text-black">{formatPrice(roomType.pricePerSemester)}</p>
            <p className="text-xs text-gray-666">per semester</p>
          </div>
          <div>
            <p className="text-gray-666 font-medium">{formatPrice(roomType.pricePerMonth)}</p>
            <p className="text-xs text-gray-666">per month</p>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-666 mb-3">
            <span>Capacity</span>
            <span className="font-medium">{roomType.capacity} person(s)</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black rounded-full" style={{ width: `${(roomType.capacity / 6) * 100}%` }}></div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-black mb-3">Room Features</h4>
          <div className="flex flex-wrap gap-2">
            {roomType.amenities.slice(0, 5).map((amenity, idx) => (
              <span key={idx} className="text-gray-666 text-xs px-3 py-1.5">
                {amenity}
              </span>
            ))}
            {roomType.amenities.length > 5 && (
              <span className="text-gray-666 text-xs px-3 py-1.5">+{roomType.amenities.length - 5} more</span>
            )}
          </div>
        </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 w-full bg-black text-white py-3 px-6 font-medium transition hover:bg-gray-800"
        aria-label={`View details for ${roomType.name}`}
        onClick={() => onViewRoom(roomType.id)}
      >
        View Room Details
      </motion.button>
      </div>
    </motion.div>
  );
});

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
        const rating = Math.round((Math.random() * 3 + 2) * 10) / 10;
        const reviews = Math.floor(Math.random() * 100) + 10;

        setHostel({ ...hostelData, roomTypes, rating, reviews });
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
          <p className="text-gray-666 mb-6">{error}</p>
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
        className="min-h-screen flex items-center justify-center bg-white font-sans"
      >
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-black h-6 w-6 mb-4" />
          <span className="text-gray-666">Loading hostel details...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white font-sans">
          {hostel && (
      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        location={hostel.location}
        hostelName={hostel.name}
      />
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
                onClick={closeGallery}
                className="absolute top-4 right-4 text-black"
                aria-label="Close gallery"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
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
          <div className="flex items-center mt-2 gap-2">
            <div className="flex text-black">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.floor(hostel.rating) ? '' : 'opacity-30'} />
              ))}
            </div>
            <span className="text-gray-666">{hostel.rating} ({hostel.reviews} reviews)</span>
          </div>
          <div className="mt-2 text-gray-666">{hostel.address}</div>
          {hostel.roomTypes[0] && (
            <div className="mt-4">
              <div className="text-lg font-bold text-black">{formatPrice(hostel.roomTypes[0].pricePerMonth)}</div>
              <div className="text-sm text-gray-666">Starting price per month</div>
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
                className={`relative cursor-pointer overflow-hidden ${index === 0 ? 'md:col-span-4 h-80' : 'md:col-span-1 h-40'}`}
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
            <div className="md:col-span-4 h-64 flex items-center justify-center">
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
              <p className="text-gray-666 whitespace-pre-line leading-relaxed">{hostel.description}</p>
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
                    <FaWifi className="text-black text-lg mr-2" />
                    <span className="text-gray-666">Wi-Fi</span>
                  </div>
                )}
                {hostel.amenities.parking && (
                  <div className="flex items-center">
                    <FaParking className="text-black text-lg mr-2" />
                    <span className="text-gray-666">Parking</span>
                  </div>
                )}
                {hostel.amenities.cafeteria && (
                  <div className="flex items-center">
                    <FaUtensils className="text-black text-lg mr-2" />
                    <span className="text-gray-666">Cafeteria</span>
                  </div>
                )}
                {hostel.amenities.security && (
                  <div className="flex items-center">
                    <FaShieldAlt className="text-black text-lg mr-2" />
                    <span className="text-gray-666">24/7 Security</span>
                  </div>
                )}
                {hostel.amenities.laundry && (
                  <div className="flex items-center">
                    <FaTshirt className="text-black text-lg mr-2" />
                    <span className="text-gray-666">Laundry</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

               {/* Hostel Information Section */}
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
              <h3 className="font-semibold text-gray-666 mb-1">Contact</h3>
              {hostel.contact.admin && <p className="text-gray-666">Admin: {hostel.contact.admin}</p>}
              {hostel.contact.phone && <p className="text-gray-666">Phone: {hostel.contact.phone}</p>}
              {hostel.contact.email && <p className="text-gray-666">Email: {hostel.contact.email}</p>}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-666 mb-1">Location</h3>
            <p className="text-gray-666">{hostel.address}</p>
            <button 
              onClick={() => setShowMap(true)}
              className="mt-2 text-black hover:underline text-sm font-medium"
            >
              View on map
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-black text-white py-3 px-6 font-medium transition hover:bg-gray-800"
            aria-label={`Contact ${hostel.name}`}
          >
            Contact Hostel
          </motion.button>
        </div>
      </motion.div>
        </div>

        {/* Room Types Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Available Room Types</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'availability')}
              className="text-black bg-white border-b border-gray-200 focus:border-black outline-none"
            >
              <option value="price">Sort by Price</option>
              <option value="availability">Sort by Availability</option>
            </select>
          </div>
          <hr className="border-t border-gray-200 mb-6" />
{sortedRoomTypes.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {sortedRoomTypes.map((roomType) => (
      <MemoizedRoomCard 
        key={roomType.id} // Add key prop here
        roomType={roomType} 
        onViewRoom={handleViewRoom} 
      />
    ))}
  </div>
) : (
          <div className="text-center py-12">
            <FaBed className="mx-auto text-4xl text-gray-666 mb-4" />
            <p className="text-black text-lg">No room types available for this hostel</p>
            <p className="text-gray-666 mt-2">Check back later for availability updates</p>
          </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-16 mb-8 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">Ready to book your stay?</h2>
          <p className="text-gray-666 max-w-2xl mx-auto mb-6 leading-relaxed">
            Secure your spot in {hostel.name} today and experience comfortable student living
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:static bg-black text-white py-3 px-8 font-medium transition hover:bg-gray-800"
            aria-label={`Book a room at ${hostel.name}`}
          >
            Book Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}