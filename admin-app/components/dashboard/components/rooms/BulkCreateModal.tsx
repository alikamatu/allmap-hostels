"use client";

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hostel } from '@/types/hostel';
import { RoomType } from '@/types/room';

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
  setFormData: (data: BulkCreateFormData) => void;
  onSubmit: (formData: BulkCreateFormData) => Promise<void>;
  loading: boolean;
  onHostelSelect?: (hostelId: string) => void; // Add this prop
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
  onHostelSelect // Add this prop
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
        setFormData({ ...formData, roomTypeId: '' });
      }
    }
  }, [formData.hostelId, formData.roomTypeId, filteredRoomTypes, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.hostelId || !formData.roomTypeId || !formData.roomNumbers.trim() || !formData.maxOccupancy) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate room numbers
    const roomNumbers = formData.roomNumbers.split(',').map(num => num.trim()).filter(num => num);
    if (roomNumbers.length === 0) {
      alert('Please enter at least one room number');
      return;
    }

    await onSubmit(formData);
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
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Bulk Create Rooms</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hostel <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => handleHostelChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">Select Hostel</option>
                  {hostels.map(hostel => (
                    <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  required
                  disabled={!formData.hostelId || filteredRoomTypes.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.hostelId
                      ? 'Select hostel first'
                      : filteredRoomTypes.length === 0
                      ? 'No room types available'
                      : 'Select Room Type'}
                  </option>
                  {filteredRoomTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} (Capacity: {type.capacity})
                    </option>
                  ))}
                </select>
                {formData.hostelId && filteredRoomTypes.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No room types found for this hostel. Create a room type first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="1"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Occupancy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                    required
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Numbers <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.roomNumbers}
                  onChange={(e) => setFormData({ ...formData, roomNumbers: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="A101, A102, A103, A104..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate room numbers with commas. Example: A101, A102, A103
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Optional notes for all rooms..."
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Rooms'}
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