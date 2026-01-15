"use client";

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Hostel } from '@/types/hostel';
import { RoomType } from '@/types/room';
import Swal from 'sweetalert2';

// Define the form data type
interface BulkCreateFormData {
  hostelId: string;
  roomTypeId: string;
  floor: string;
  maxOccupancy: string;
  roomNumbers: string;
  notes: string;
}

interface BulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostels: Hostel[];
  roomTypes: RoomType[];
  formData: BulkCreateFormData;
  setFormData: React.Dispatch<React.SetStateAction<BulkCreateFormData>>;
  onSubmit: (formData: BulkCreateFormData) => Promise<void>;
  loading: boolean;
  onHostelSelect?: (hostelId: string) => void;
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({
  isOpen,
  onClose,
  hostels,
  roomTypes,
  formData,
  setFormData,
  onSubmit,
  loading,
  onHostelSelect,
}) => {
  // Filter room types based on selected hostel
  const filteredRoomTypes = useMemo(() => {
    if (!formData.hostelId) return [];
    return roomTypes.filter((type) => type.hostelId === formData.hostelId);
  }, [roomTypes, formData.hostelId]);

  // Reset room type when hostel changes and it's not valid for the new hostel
  useEffect(() => {
    if (formData.hostelId && formData.roomTypeId) {
      const isRoomTypeValid = filteredRoomTypes.some(
        (type) => type.id === formData.roomTypeId
      );
      if (!isRoomTypeValid) {
        setFormData(prev => ({ ...prev, roomTypeId: '' }));
      }
    }
  }, [formData.hostelId, formData.roomTypeId, filteredRoomTypes, setFormData]);

  const showAlert = (title: string, text: string, icon: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#FF6A00',
      confirmButtonText: 'OK',
      background: '#fff',
      customClass: {
        title: 'text-sm font-medium text-gray-900',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-3 py-1.5 text-xs font-medium',
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.hostelId) {
      showAlert('Hostel Required', 'Please select a hostel', 'warning');
      return;
    }

    if (!formData.roomTypeId) {
      showAlert('Room Type Required', 'Please select a room type', 'warning');
      return;
    }

    if (!formData.roomNumbers.trim()) {
      showAlert('Room Numbers Required', 'Please enter at least one room number', 'warning');
      return;
    }

    if (!formData.maxOccupancy) {
      showAlert('Max Occupancy Required', 'Please specify the maximum occupancy', 'warning');
      return;
    }

    // Validate room numbers
    const roomNumbers = formData.roomNumbers.split(',').map(num => num.trim()).filter(num => num);
    if (roomNumbers.length === 0) {
      showAlert('Invalid Room Numbers', 'Please enter at least one valid room number', 'warning');
      return;
    }

    try {
      await onSubmit(formData);
      showAlert('Success', 'Rooms created successfully!', 'success');
      onClose();
    } catch {
      showAlert('Error', 'Failed to create rooms. Please try again.', 'error');
    }
  };

  const handleHostelChange = (hostelId: string) => {
    setFormData({
      ...formData,
      hostelId,
      roomTypeId: '', // Reset room type when hostel changes
    });

    // Fetch room types for the selected hostel
    if (onHostelSelect && hostelId) {
      onHostelSelect(hostelId);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !formData.hostelId) {
      // Don't reset if hostel is already selected from parent component
    }
  }, [isOpen, formData.hostelId]);

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
            if (e.target === e.currentTarget) onClose();
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
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">BULK CREATE ROOMS</h3>
                  <p className="text-xs text-gray-600 mt-1">Create multiple rooms at once</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Hostel Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">HOSTEL *</label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => handleHostelChange(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                >
                  <option value="">Select a hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Type Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ROOM TYPE *</label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  required
                  disabled={loading || !formData.hostelId || filteredRoomTypes.length === 0}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                >
                  <option value="">
                    {!formData.hostelId
                      ? 'Select hostel first'
                      : filteredRoomTypes.length === 0
                      ? 'No room types available'
                      : 'Select a room type'}
                  </option>
                  {filteredRoomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (Capacity: {type.capacity})
                    </option>
                  ))}
                </select>
                {formData.hostelId && filteredRoomTypes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No room types found for this hostel. Create a room type first.
                  </p>
                )}
              </div>

              {/* Floor and Max Occupancy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">FLOOR</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                    placeholder="e.g., 1"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">MAX OCCUPANCY *</label>
                  <input
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                    required
                    min="1"
                    max="10"
                    disabled={loading}
                    className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                    placeholder="e.g., 2"
                  />
                </div>
              </div>

              {/* Room Numbers */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ROOM NUMBERS *</label>
                <textarea
                  value={formData.roomNumbers}
                  onChange={(e) => setFormData({ ...formData, roomNumbers: e.target.value })}
                  required
                  rows={3}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="e.g., A101, A102, A103"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate room numbers with commas (e.g., A101, A102, A103).
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">NOTES</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Optional notes for all rooms..."
                  maxLength={500}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.hostelId ||
                    !formData.roomTypeId ||
                    !formData.roomNumbers.trim() ||
                    !formData.maxOccupancy
                  }
                  className="flex-1 px-3 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1" />
                      Creating...
                    </>
                  ) : (
                    'Create Rooms'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkCreateModal;