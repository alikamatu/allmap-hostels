'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaCamera, FaTrash, FaSpinner, FaBroom, FaLock, FaMapMarkerAlt, FaUsers, FaBuilding, FaDollarSign } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

interface DetailedRatings {
  cleanliness?: number;
  security?: number;
  location?: number;
  staff?: number;
  facilities?: number;
  valueForMoney?: number;
}

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    hostel?: {
      name: string;
    };
    room?: {
      roomNumber: string;
      roomType?: {
        name: string;
      };
    };
  };
  onSubmit: (reviewData: {
    bookingId: string;
    rating: number;
    reviewText: string;
    detailedRatings: DetailedRatings;
    images: string[];
  }) => Promise<void>;
  loading?: boolean;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading = false
}) => {
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredOverallRating, setHoveredOverallRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [detailedRatings, setDetailedRatings] = useState<DetailedRatings>({});
  const [hoveredDetailedRating, setHoveredDetailedRating] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const detailedRatingCategories = [
    { key: 'cleanliness', label: 'Cleanliness', icon:<FaBroom /> },
    { key: 'security', label: 'Security', icon:<FaLock /> },
    { key: 'location', label: 'Location', icon: <FaMapMarkerAlt /> },
    { key: 'staff', label: 'Staff', icon: <FaUsers /> },
    { key: 'facilities', label: 'Facilities', icon: <FaBuilding /> },
    { key: 'valueForMoney', label: 'Value for Money', icon: <FaDollarSign /> },
  ];

  const resetForm = useCallback(() => {
    setOverallRating(0);
    setHoveredOverallRating(0);
    setReviewText('');
    setImages([]);
    setDetailedRatings({});
    setHoveredDetailedRating({});
    setErrors({});
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      resetForm();
      onClose();
    }
  }, [loading, resetForm, onClose]);

  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};

    if (overallRating === 0) {
      newErrors.overallRating = 'Please provide an overall rating';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Please write a review';
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters long';
    } else if (reviewText.trim().length > 1000) {
      newErrors.reviewText = 'Review must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [overallRating, reviewText]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        bookingId: booking.id,
        rating: overallRating,
        reviewText: reviewText.trim(),
        detailedRatings,
        images
      });
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    }
  }, [validateForm, onSubmit, booking.id, overallRating, reviewText, detailedRatings, images, resetForm, onClose]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && images.length < 5) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.onerror = () => {
          console.error('Failed to read file:', file.name);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const renderStarRating = useCallback((
    rating: number,
    hovered: number,
    onRate: (rating: number) => void,
    onHover: (rating: number) => void,
    onLeave: () => void,
    size: string = 'text-2xl'
  ) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          className={`${size} transition-colors ${
            star <= (hovered || rating) ? 'text-black' : 'text-gray-200'
          }`}
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          whileHover={{ scale: 1.1 }}
          aria-label={`Rate ${star} stars`}
        >
          <FaStar />
        </motion.button>
      ))}
    </div>
  ), []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
        onClick={(e) => e.target === e.currentTarget && !loading && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-black">Write a Review</h2>
                <p className="text-gray-800 mt-1">
                  {booking.hostel?.name} - Room {booking.room?.roomNumber}
                </p>
                <p className="text-sm text-gray-800">
                  {booking.room?.roomType?.name}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleClose}
                disabled={loading}
                className="text-black disabled:opacity-50"
                aria-label="Close review modal"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>
            <hr className="border-t border-gray-200 mt-4" />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Overall Rating *</label>
              {renderStarRating(
                overallRating,
                hoveredOverallRating,
                setOverallRating,
                setHoveredOverallRating,
                () => setHoveredOverallRating(0)
              )}
              {errors.overallRating && <p className="text-black text-sm mt-1">{errors.overallRating}</p>}
            </div>

            {/* Detailed Ratings */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">Rate Specific Aspects (Optional)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detailedRatingCategories.map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2 text-black">{icon}</span>
                      <span className="text-sm text-gray-800">{label}</span>
                    </div>
                    {renderStarRating(
                      detailedRatings[key as keyof DetailedRatings] || 0,
                      hoveredDetailedRating[key] || 0,
                      (rating) => setDetailedRatings(prev => ({ ...prev, [key]: rating })),
                      (rating) => setHoveredDetailedRating(prev => ({ ...prev, [key]: rating })),
                      () => setHoveredDetailedRating(prev => ({ ...prev, [key]: 0 })),
                      'text-lg'
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Your Review *</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience about this hostel..."
                className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-900 resize-none h-32"
                maxLength={1000}
                aria-label="Write your review"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.reviewText && <p className="text-black text-sm">{errors.reviewText}</p>}
                <p className="text-sm text-gray-800 ml-auto">{reviewText.length}/1000 characters</p>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center">
                <FiAlertTriangle className="text-black mr-2" />
                <p className="text-black text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6">
            <hr className="border-t border-gray-200 mb-4" />
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-800 border-b border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Cancel review"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleSubmit}
                disabled={loading || !overallRating || !reviewText.trim()}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center"
                aria-label="Submit review"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WriteReviewModal;