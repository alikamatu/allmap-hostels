'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaWifi, FaParking, FaUtensils, FaShieldAlt, FaTshirt, FaBed } from 'react-icons/fa';

// Hooks
import { useHostel } from '@/hooks/useHostel';
import { useImageGallery } from '@/hooks/useImageGallery';

// Types
import { RoomType } from '@/types/hostels';
import { MapModal } from '@/_components/hostels/MapModal';
import { BookingModal } from '@/_components/bookings/BookingModal';
import { ContactModal } from '@/_components/hostelid/ContactModal'; // Add this import
import { HostelHeader } from '@/_components/hostelid/HostelHeader';
import { ImageGallery } from '@/_components/hostelid/ImageGallery';
import { HostelInformation } from '@/_components/hostelid/HostelInformation';
import { RoomCard } from '@/_components/hostelid/RoomCard';
import { ReviewsComponent } from '@/_components/reviews/ReviewsComponent';

export default function HostelDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { hostel, loading, error } = useHostel(id as string);
  const {
    galleryOpen,
    currentImageIndex,
    openGallery,
    closeGallery,
    navigateImage
  } = useImageGallery(hostel?.images || []);

  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'availability'>('price');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false); // Add this state
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  const handleViewRoom = useCallback((roomTypeId: string) => {
    router.push(`/dashboard/hostels/${id}/room-types/${roomTypeId}`);
  }, [id, router]);

  const handleBookRoom = useCallback((roomType: RoomType) => {
    if (roomType.availableRooms > 0) {
      setSelectedRoomType(roomType);
      setBookingModalOpen(true);
    }
  }, []);

  // Add this function for verified hostels
  const handleCheckAvailability = useCallback((roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setContactModalOpen(true);
  }, []);

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
            <button
              onClick={() => window.location.reload()}
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

      {/* Add Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedRoomType(null);
        }}
        hostelName={hostel.name}
        roomTypeName={selectedRoomType?.name}
        contactInfo={hostel.contact}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <HostelHeader hostel={hostel} />

        <ImageGallery
          images={hostel.images}
          hostelName={hostel.name}
          galleryOpen={galleryOpen}
          currentImageIndex={currentImageIndex}
          onOpenGallery={openGallery}
          onCloseGallery={closeGallery}
          onNavigateImage={navigateImage}
        />

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
          <HostelInformation 
            hostel={hostel} 
            onShowMap={() => setShowMap(true)} 
          />
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

          {sortedRoomTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRoomTypes.map((roomType) => (
                <RoomCard 
                  key={roomType.id}
                  roomType={roomType} 
                  onBook={handleBookRoom}
                  onViewRoom={handleViewRoom}
                  onCheckAvailability={handleCheckAvailability} // Add this prop
                  IsVerified={hostel.is_verified}
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
          {!hostel.roomTypes.some(rt => rt.availableRooms > 0) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                This hostel is currently fully booked. Contact us to join the waiting list or check for cancellations.
              </p>
            </div>
          )}
        </motion.div>

        <ReviewsComponent hostelId={hostel.id} hostelName={hostel.name} />
      </div>
    </div>
  );
}