"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaImages,
} from "react-icons/fa";

interface ImageGalleryProps {
  images: string[];
  hostelName: string;
  galleryOpen: boolean;
  currentImageIndex: number;
  onOpenGallery: (index: number) => void;
  onCloseGallery: () => void;
  onNavigateImage: (direction: "next" | "prev") => void;
}

export const ImageGallery = ({
  images,
  hostelName,
  galleryOpen,
  currentImageIndex,
  onOpenGallery,
  onCloseGallery,
  onNavigateImage,
}: ImageGalleryProps) => {
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!galleryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseGallery();
      if (e.key === "ArrowRight") onNavigateImage("next");
      if (e.key === "ArrowLeft") onNavigateImage("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryOpen, onCloseGallery, onNavigateImage]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center mb-8 border border-gray-200">
        <div className="text-center text-gray-400">
          <FaImages className="text-4xl mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">
            No photos available for this hostel
          </p>
        </div>
      </div>
    );
  }

  const primaryImage = images[0];
  const sideImages = images.slice(1, 5);

  return (
    <>
      {/* Mobile-first Carousel view for screens < md */}
      <div className="block md:hidden mb-8 relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm aspect-[4/3] w-full">
        <Image
          src={images[mobileActiveIndex] || primaryImage}
          alt={`${hostelName} photo ${mobileActiveIndex + 1}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onClick={() => onOpenGallery(mobileActiveIndex)}
        />

        {/* Navigation Arrows on mobile */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileActiveIndex((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1,
                );
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-sm transition z-10"
              aria-label="Previous image"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileActiveIndex((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0,
                );
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-sm transition z-10"
              aria-label="Next image"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div
          onClick={() => onOpenGallery(mobileActiveIndex)}
          className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer font-medium"
        >
          <FaImages className="text-xs" />
          <span>
            {mobileActiveIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Desktop / Tablet Grid Gallery (>= md) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="hidden md:grid grid-cols-4 gap-3 mb-10 h-[420px] relative rounded-2xl overflow-hidden"
      >
        {/* Main Hero Image */}
        <div
          className={`relative cursor-pointer overflow-hidden ${
            images.length === 1
              ? "col-span-4 h-full"
              : sideImages.length <= 2
                ? "col-span-2 h-full"
                : "col-span-2 h-full"
          }`}
          onClick={() => onOpenGallery(0)}
        >
          <Image
            src={primaryImage}
            alt={`${hostelName} main photo`}
            fill
            priority
            sizes="(max-width: 1024px) 60vw, 50vw"
            className="object-cover hover:scale-103 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Side Grid Images */}
        {sideImages.length > 0 && (
          <div className="col-span-2 grid grid-cols-2 gap-3 h-full">
            {sideImages.map((image, idx) => {
              const fullIndex = idx + 1;
              return (
                <div
                  key={fullIndex}
                  className="relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                  onClick={() => onOpenGallery(fullIndex)}
                >
                  <Image
                    src={image}
                    alt={`${hostelName} photo ${fullIndex + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* View All Photos floating button */}
        <button
          onClick={() => onOpenGallery(0)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-md backdrop-blur-sm flex items-center gap-2 transition hover:scale-102"
        >
          <FaImages className="text-sm" />
          <span>Show all {images.length} photos</span>
        </button>
      </motion.div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            {/* Close button */}
            <button
              onClick={onCloseGallery}
              className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition z-50"
              aria-label="Close gallery"
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Left Nav */}
            {images.length > 1 && (
              <button
                onClick={() => onNavigateImage("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition z-50"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-xl" />
              </button>
            )}

            {/* Current Image */}
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[82vh] w-full h-full flex items-center justify-center"
            >
              <div className="relative w-full h-[78vh]">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${hostelName} gallery image ${currentImageIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Right Nav */}
            {images.length > 1 && (
              <button
                onClick={() => onNavigateImage("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition z-50"
                aria-label="Next image"
              >
                <FaChevronRight className="text-xl" />
              </button>
            )}

            {/* Bottom Footer Info */}
            <div className="absolute bottom-5 inset-x-0 flex items-center justify-center text-white/80 text-sm font-medium">
              <span>
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
