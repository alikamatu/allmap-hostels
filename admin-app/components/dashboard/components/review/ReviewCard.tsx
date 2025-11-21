"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import React from "react";

function ReviewCard({ review, onRespond }: { review: any; onRespond: (review: any) => void; }) {
  const [showFullText, setShowFullText] = useState(false);
  const reviewText = review.reviewText || '';
  const isLongText = reviewText.length > 200;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {review.studentName?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{review.studentName}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-yellow-700">{review.rating.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Review Text */}
      <div className="mb-3">
        <p className="text-xs text-gray-700 leading-relaxed">
          {isLongText && !showFullText
            ? `${reviewText.substring(0, 200)}...`
            : reviewText
          }
        </p>
        {isLongText && (
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-[#FF6A00] hover:text-[#E55E00] text-xs font-medium mt-1 transition-colors duration-150"
          >
            {showFullText ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      
      {/* Detailed Ratings */}
      {review.detailedRatings && Object.keys(review.detailedRatings).length > 0 && (
        <div className="mb-3 bg-gray-50 p-3">
          <h5 className="text-xs font-semibold text-gray-800 mb-2">Detailed Ratings</h5>
          <div className="space-y-1">
            {Object.entries(review.detailedRatings).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="flex items-center">
                  <div className="flex mr-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-2 w-2 ${
                          i < Number(value)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 font-medium">{String(value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-3">
          <div className="grid grid-cols-3 gap-2">
            {review.images.map((image: string, index: number) => (
              <div key={index} className="relative h-16 overflow-hidden">
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Hostel Response */}
      {review.hostelResponse && (
        <div className="mt-3 bg-blue-50 p-3">
          <div className="flex items-center mb-1">
            <span className="text-xs font-semibold text-blue-900">Hostel Response</span>
            <span className="text-xs text-blue-600 ml-2 bg-blue-100 px-1 py-0.5">
              {formatDate(review.hostelRespondedAt)}
            </span>
          </div>
          <p className="text-blue-800 text-xs leading-relaxed">{review.hostelResponse}</p>
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <span className="font-medium">{review.helpfulCount}</span>
          <span className="ml-1">found this helpful</span>
        </div>
        <button
          onClick={() => onRespond(review)}
          className="text-[#FF6A00] hover:text-[#E55E00] text-xs font-semibold transition-colors duration-150"
        >
          {review.hostelResponse ? 'Edit Response' : 'Respond to Review'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(ReviewCard);