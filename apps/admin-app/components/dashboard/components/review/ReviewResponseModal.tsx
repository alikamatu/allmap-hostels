"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Review {
  id: string;
  studentName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  hostelResponse?: string;
}

interface ReviewResponseModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
  loading: boolean;
}

const ReviewResponseModal: React.FC<ReviewResponseModalProps> = ({
  review,
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [response, setResponse] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && review) {
      setResponse(review.hostelResponse || '');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, review]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const validateResponse = (): boolean => {
    if (!response.trim()) {
      setError('Response cannot be empty');
      return false;
    }
    if (response.length > 1000) {
      setError('Response cannot exceed 1000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateResponse() || isSubmitting || loading) return;

    const result = await Swal.fire({
      title: review?.hostelResponse ? 'Update Response' : 'Submit Response',
      text: `Are you sure you want to ${review?.hostelResponse ? 'update' : 'submit'} this response for ${review?.studentName}'s review?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF6A00',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: review?.hostelResponse ? 'Update Response' : 'Submit Response',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        title: 'text-sm font-medium text-gray-900',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-3 py-1.5 text-xs font-medium',
        cancelButton: 'px-3 py-1.5 text-xs font-medium',
      },
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(response);
      Swal.fire({
        title: review?.hostelResponse ? 'Response Updated' : 'Response Submitted',
        text: `Your response has been successfully ${review?.hostelResponse ? 'updated' : 'submitted'}.`,
        icon: 'success',
        confirmButtonColor: '#FF6A00',
        confirmButtonText: 'OK',
        background: '#fff',
        customClass: {
          title: 'text-sm font-medium text-gray-900',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-3 py-1.5 text-xs font-medium',
        },
      }).then(() => {
        onClose();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the response.';
      setError(errorMessage);
      Swal.fire({
        title: 'Submission Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#FF6A00',
        confirmButtonText: 'OK',
        background: '#fff',
        customClass: {
          title: 'text-sm font-medium text-gray-900',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-3 py-1.5 text-xs font-medium',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  const isProcessing = loading || isSubmitting;

  if (!isOpen || !review) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {review.hostelResponse ? 'EDIT RESPONSE' : 'RESPOND TO REVIEW'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Original Review */}
              <div className="bg-gray-50 p-3">
                <div className="flex items-center mb-2">
                  <div className="flex items-center bg-yellow-50 px-2 py-0.5 mr-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < (review.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-900">
                      {review.studentName}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      • {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 p-3">
                  <div className="flex items-center gap-1.5 text-red-800">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    <span className="text-xs">{error}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    YOUR RESPONSE
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => {
                      setResponse(e.target.value);
                      setError('');
                    }}
                    rows={4}
                    className={`w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150 resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
                      error ? 'border border-red-300' : ''
                    }`}
                    placeholder="Write a professional response addressing the review. Be polite, helpful, and concise."
                    disabled={isProcessing}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {response.length} / 1000 characters
                    </span>
                    {response.length > 1000 && (
                      <span className="text-xs text-red-600">
                        Response exceeds character limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !response.trim() || response.length > 1000}
                    className="px-3 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star className="h-3 w-3" />
                        {review.hostelResponse ? 'Update Response' : 'Submit Response'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ReviewResponseModal);