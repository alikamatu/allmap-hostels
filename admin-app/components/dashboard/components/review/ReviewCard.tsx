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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ring-1 ring-gray-100">
            <span className="text-base font-medium text-gray-600">
              {review.studentName?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.studentName}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-yellow-700">{review.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {isLongText && !showFullText
            ? `${reviewText.substring(0, 200)}...`
            : reviewText
          }
        </p>
        {isLongText && (
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors duration-200"
          >
            {showFullText ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      
      {review.detailedRatings && Object.keys(review.detailedRatings).length > 0 && (
        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-800 mb-3">Detailed Ratings</h5>
          <div className="space-y-2">
            {Object.entries(review.detailedRatings).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
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
      
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            {review.images.map((image: string, index: number) => (
              <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {review.hostelResponse && (
        <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-sm font-semibold text-blue-900">Hostel Response</span>
            <span className="text-xs text-blue-600 ml-3 bg-blue-100 px-2 py-0.5 rounded-full">
              {formatDate(review.hostelRespondedAt)}
            </span>
          </div>
          <p className="text-blue-800 leading-relaxed">{review.hostelResponse}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">{review.helpfulCount}</span>
          <span className="ml-1">found this helpful</span>
        </div>
        <button
          onClick={() => onRespond(review)}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors duration-200"
        >
          {review.hostelResponse ? 'Edit Response' : 'Respond to Review'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(ReviewCard);