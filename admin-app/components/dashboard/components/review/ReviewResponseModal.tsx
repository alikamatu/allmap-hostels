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
      month: 'long',
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
      confirmButtonColor: '#1a73e8',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: review?.hostelResponse ? 'Update Response' : 'Submit Response',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 font-medium',
        cancelButton: 'px-4 py-2 font-medium',
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
        confirmButtonColor: '#1a73e8',
        confirmButtonText: 'OK',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-lg',
          title: 'text-lg font-medium text-gray-900',
          htmlContainer: 'text-sm text-gray-600',
          confirmButton: 'px-4 py-2 font-medium',
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
        confirmButtonColor: '#1a73e8',
        confirmButtonText: 'OK',
        background: '#fff',
        customClass: {
          popup: 'rounded-xl shadow-lg',
          title: 'text-lg font-medium text-gray-900',
          htmlContainer: 'text-sm text-gray-600',
          confirmButton: 'px-4 py-2 font-medium',
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
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {review.hostelResponse ? 'Edit Response' : 'Respond to Review'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="p-1.5 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
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
                            i < (review.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {review.studentName}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      • {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => {
                      setResponse(e.target.value);
                      setError('');
                    }}
                    rows={6}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 transition-all duration-200 resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
                      error ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Write a professional response addressing the review. Be polite, helpful, and concise."
                    disabled={isProcessing}
                    required
                  />
                  <div className="flex justify-between mt-2">
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

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !response.trim() || response.length > 1000}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4" />
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