"use client";

import { useHostel } from "@repo/shared/hooks";
import { useImageGallery } from "@repo/shared/hooks";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";
import {
  FaWifi,
  FaParking,
  FaUtensils,
  FaShieldAlt,
  FaTshirt,
  FaBed,
} from "react-icons/fa";

// Hooks

// Types
import { RoomType } from "@repo/types";
import { CustomSelect } from "@repo/ui";
import { MapModal } from "@/_components/hostels/MapModal";
import { BookingModal } from "@/_components/bookings/BookingModal";
import { ContactModal } from "@/_components/hostelid/ContactModal";
import { PaywallModal } from "@/_components/dashboard/paywall-modal";
import { HostelHeader } from "@/_components/hostelid/HostelHeader";
import { ImageGallery } from "@/_components/hostelid/ImageGallery";
import { HostelInformation } from "@/_components/hostelid/HostelInformation";
import { RoomCard } from "@/_components/hostelid/RoomCard";
import { ReviewsComponent } from "@/_components/reviews/ReviewsComponent";
import { NearbyPlaces } from "@/_components/hostels/NearbyPlaces";
import { HostelDetailPageSkeleton } from "@/_components/common/ui/PageSkeletons";
import { formatPrice } from "@/utils/formatters";

export default function HostelDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { hostel, loading, error } = useHostel(id as string);
  const {
    galleryOpen,
    currentImageIndex,
    openGallery,
    closeGallery,
    navigateImage,
  } = useImageGallery(hostel?.images || []);

  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "availability">("price");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [paywallModalOpen, setPaywallModalOpen] = useState(false); // Add paywall modal state
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null,
  );

  const handleViewRoom = useCallback(
    (roomTypeId: string) => {
      router.push(`/dashboard/hostels/${id}/room-types/${roomTypeId}`);
    },
    [id, router],
  );

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

  // Add effect to listen for openPaywallModal event
  React.useEffect(() => {
    const handleOpenPaywallModal = () => {
      setPaywallModalOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("openPaywallModal", handleOpenPaywallModal);

      return () => {
        window.removeEventListener("openPaywallModal", handleOpenPaywallModal);
      };
    }
  }, []);

  // Sort room types
  const sortedRoomTypes = hostel?.roomTypes
    ? [...hostel.roomTypes].sort((a, b) =>
        sortBy === "price"
          ? a.pricePerSemester - b.pricePerSemester
          : b.availableRooms - a.availableRooms,
      )
    : [];

  const validPrices =
    hostel?.roomTypes
      ?.map((rt) => rt.pricePerSemester)
      .filter((p) => typeof p === "number" && p > 0) || [];
  const startingPrice =
    validPrices.length > 0
      ? Math.min(...validPrices)
      : (hostel as unknown as { base_price?: number })?.base_price || 0;
  const availableRoomCount = sortedRoomTypes.filter(
    (rt) => rt.availableRooms > 0,
  ).length;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-white font-sans"
      >
        <div className="text-center max-w-md">
          <FiAlertTriangle className="text-black text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">
            Error Loading Hostel
          </h2>
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
    return <HostelDetailPageSkeleton />;
  }

  return (
    <div className="bg-white font-sans">
      {/* Modals */}
      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        location={typeof hostel.location === "string" ? hostel.location : ""}
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
            address: hostel.address,
          }}
        />
      )}

      {/* Contact Modal */}
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

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={paywallModalOpen}
        onClose={() => setPaywallModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-16">
        <HostelHeader hostel={hostel} />

        <ImageGallery
          images={hostel.images || []}
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
              <h2 className="text-xl font-bold text-gray-950 mb-3">
                About this Hostel
              </h2>
              <hr className="border-t border-gray-100 mb-4" />
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                {hostel.description ||
                  "No detailed description provided for this accommodation."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-xl font-bold text-gray-950 mb-3">
                Hostel Amenities
              </h2>
              <hr className="border-t border-gray-100 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hostel.amenities?.wifi && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-900 flex-shrink-0">
                      <FaWifi className="text-sm" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      Wi-Fi Internet
                    </span>
                  </div>
                )}
                {hostel.amenities?.parking && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-900 flex-shrink-0">
                      <FaParking className="text-sm" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      Secure Parking
                    </span>
                  </div>
                )}
                {hostel.amenities?.cafeteria && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-900 flex-shrink-0">
                      <FaUtensils className="text-sm" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      Cafeteria / Dining
                    </span>
                  </div>
                )}
                {hostel.amenities?.security && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-900 flex-shrink-0">
                      <FaShieldAlt className="text-sm" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      24/7 Security
                    </span>
                  </div>
                )}
                {hostel.amenities?.laundry && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-900 flex-shrink-0">
                      <FaTshirt className="text-sm" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      Laundry Facilities
                    </span>
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
          id="room-types-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="scroll-mt-24 mb-16"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">
                Available Room Types
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {availableRoomCount} of {sortedRoomTypes.length} room types
                currently available
              </p>
            </div>
            <div className="w-full sm:w-60">
              <CustomSelect
                variant="pill"
                value={sortBy}
                onChange={(val) => setSortBy(val as "price" | "availability")}
                options={[
                  { value: "price", label: "Sort by Price (Low to High)" },
                  { value: "availability", label: "Sort by Availability" },
                ]}
              />
            </div>
          </div>

          <hr className="border-t border-gray-100 mb-8" />

          {sortedRoomTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRoomTypes.map((roomType, idx) => (
                <RoomCard
                  key={roomType.id || `roomtype-${roomType.name}-${idx}`}
                  roomType={roomType}
                  onBook={handleBookRoom}
                  onViewRoom={handleViewRoom}
                  onCheckAvailability={handleCheckAvailability}
                  IsVerified={hostel.is_verified}
                  acceptingBookings={hostel.accepting_bookings}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <FaBed className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Room Types Listed Yet
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                This accommodation does not have individual room categories
                listed yet. Please check back later.
              </p>
            </div>
          )}
        </motion.div>

        {/* Reviews Section */}
        <ReviewsComponent hostelId={hostel.id} hostelName={hostel.name} />

        {/* Nearby Places Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-950 mb-3">
            Nearby Places & Campus Landmarks
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Discover transport, dining, and banking around this hostel.
          </p>
          <hr className="border-t border-gray-100 mb-6" />
          <NearbyPlaces hostelId={hostel.id} />
        </motion.div>
      </div>

      {/* Mobile-First Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between">
        <div>
          {startingPrice > 0 ? (
            <>
              <div className="text-base font-extrabold text-gray-950">
                {formatPrice(startingPrice)}
                <span className="text-[11px] font-normal text-gray-500 ml-1">
                  / sem
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {availableRoomCount > 0
                  ? `${availableRoomCount} room types open`
                  : "Direct inquiry"}
              </p>
            </>
          ) : (
            <div className="text-sm font-semibold text-gray-900">
              Price on inquiry
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const firstAvailable = sortedRoomTypes.find(
              (rt) => rt.availableRooms > 0,
            );
            if (
              hostel.is_verified &&
              hostel.accepting_bookings &&
              firstAvailable
            ) {
              handleBookRoom(firstAvailable);
            } else if (!hostel.is_verified && sortedRoomTypes[0]) {
              handleCheckAvailability(sortedRoomTypes[0]);
            } else {
              const el = document.getElementById("room-types-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="bg-black hover:bg-gray-800 active:scale-95 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          {hostel.accepting_bookings && availableRoomCount > 0
            ? "Book a Room"
            : "View Rooms"}
        </button>
      </div>
    </div>
  );
}
