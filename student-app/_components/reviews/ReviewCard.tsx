"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaThumbsUp, FaReply, FaFlag } from 'react-icons/fa';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { Review } from '@/service/reviewService';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string | null;
  onToggleHelpful: (reviewId: string) => void;
  onToggleExpand: (reviewId: string) => void;
  isExpanded: boolean;
}

export const ReviewCard = ({ 
  review, 
  currentUserId, 
  onToggleHelpful, 
  onToggleExpand, 
  isExpanded 
}: ReviewCardProps) => {
  const [imageError, setImageError] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, showNumber: boolean = false) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`text-sm ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      {showNumber && <span className="ml-2 text-sm text-gray-600">{rating}/5</span>}
    </div>
  );

  const renderDetailedRatings = (detailedRatings?: Record<string, number>) => {
    if (!detailedRatings || Object.keys(detailedRatings).length === 0) return null;

    const ratingLabels: Record<string, string> = {
      cleanliness: 'Cleanliness',
      security: 'Security',
      location: 'Location',
      staff: 'Staff',
      facilities: 'Facilities',
      valueForMoney: 'Value for Money'
    };

    return (
      <div className="grid grid-cols-2 gap-3 mt-3">
        {Object.entries(detailedRatings).map(([key, rating]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{ratingLabels[key] || key}</span>
            {renderStars(rating)}
          </div>
        ))}
      </div>
    );
  };

  const hasVoted = currentUserId && review.helpfulVotes.includes(currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      {/* Review Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <FiUser className="text-gray-600 text-lg" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-black">{review.studentName}</h4>
            <span className="text-sm text-gray-500">•</span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FiCalendar className="text-xs" />
              {formatDate(review.createdAt)}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            {renderStars(review.rating, true)}
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="ml-16">
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-800 leading-relaxed">
            {isExpanded || review.reviewText.length <= 300
              ? review.reviewText
              : `${review.reviewText.substring(0, 300)}...`
            }
            {review.reviewText.length > 300 && (
              <button
                onClick={() => onToggleExpand(review.id)}
                className="ml-2 text-black hover:underline font-medium"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
          </p>
        </div>

        {/* Detailed Ratings */}
        {renderDetailedRatings(review.detailedRatings)}

        {/* Hostel Response */}
        {review.hostelResponse && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaReply className="text-gray-600 text-sm" />
              <span className="font-medium text-gray-800">Response from Hostel</span>
              {review.hostelRespondedAt && (
                <span className="text-sm text-gray-500">
                  • {formatDate(review.hostelRespondedAt)}
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.hostelResponse}
            </p>
          </div>
        )}

        {/* Review Actions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onToggleHelpful(review.id)}
            className={`flex items-center gap-2 text-sm transition-colors ${
              hasVoted
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FaThumbsUp className="text-xs" />
            Helpful ({review.helpfulCount})
          </button>
          
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
            <FaFlag className="text-xs" />
            Report
          </button>
        </div>
      </div>
    </motion.div>
  );
};