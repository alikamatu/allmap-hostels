"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface ImageGalleryProps {
  images: string[];
  hostelName: string;
  galleryOpen: boolean;
  currentImageIndex: number;
  onOpenGallery: (index: number) => void;
  onCloseGallery: () => void;
  onNavigateImage: (direction: 'next' | 'prev') => void;
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
  if (images.length === 0) {
    return (
      <div className="md:col-span-4 h-64 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100">
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Placeholder hostel image"
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12"
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className={`relative cursor-pointer overflow-hidden rounded-lg ${
              index === 0 ? 'md:col-span-4 h-80' : 'md:col-span-1 h-40'
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => onOpenGallery(index)}
          >
            <img
              src={image}
              alt={`${hostelName} image ${index + 1}`}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => onNavigateImage('prev')}
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
                src={images[currentImageIndex]}
                alt={`${hostelName} gallery image ${currentImageIndex + 1}`}
                className="object-contain max-h-[90vh]"
                loading="lazy"
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={onCloseGallery}
              className="absolute top-4 right-4 text-black"
              aria-label="Close gallery"
            >
              <FaTimes className="text-2xl" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => onNavigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
              aria-label="Next image"
            >
              <FaChevronRight className="text-2xl" />
            </motion.button>
            <div className="absolute bottom-4 text-black text-base">
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};