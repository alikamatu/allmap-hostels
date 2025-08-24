"use client";

import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import React from "react";

function ReviewResponseModal({ review, isOpen, onClose, onSubmit, loading }: { review: any; isOpen: boolean; onClose: () => void; onSubmit: (response: string) => void; loading: boolean; }) {
  const [response, setResponse] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setResponse(review?.hostelResponse || '');
    }
  }, [isOpen, review]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {review?.hostelResponse ? 'Edit Response' : 'Respond to Review'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Original Review */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
            <div className="flex items-center mb-3">
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full mr-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (review?.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {review?.studentName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  • {formatDate(review?.createdAt)}
                </span>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review?.reviewText}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200 resize-y"
                placeholder="Write a professional response addressing the review. Be polite, helpful, and concise."
                required
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-500">
                  {response.length} / 1000 characters
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !response.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ReviewResponseModal);