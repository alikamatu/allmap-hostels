"use client";

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hostel } from '@/types/hostel';
import { RoomType } from '@/types/room';

type CreateRoomFormData = {
  hostelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor?: string;
  maxOccupancy: string;
  notes?: string;
};

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostels: Hostel[];
  roomTypes: RoomType[];
  formData: CreateRoomFormData;
  setFormData: (data: CreateRoomFormData) => void;
  onSubmit: (data: CreateRoomFormData) => void;
  loading: boolean;
  onHostelSelect?: (hostelId: string) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
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
  const filteredRoomTypes = useMemo(() => {
    if (!formData.hostelId) return [];
    return roomTypes.filter((type) => type.hostelId === formData.hostelId);
  }, [roomTypes, formData.hostelId]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.hostelId ||
      !formData.roomTypeId ||
      !formData.roomNumber ||
      !formData.maxOccupancy
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const submitData: CreateRoomFormData = {
      hostelId: formData.hostelId,
      roomTypeId: formData.roomTypeId,
      roomNumber: formData.roomNumber.trim(),
      floor: formData.floor,
      maxOccupancy: formData.maxOccupancy,
      notes: formData.notes?.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const handleHostelChange = (hostelId: string) => {
    setFormData({
      ...formData,
      hostelId,
      roomTypeId: '',
    });

    if (onHostelSelect && hostelId) {
      onHostelSelect(hostelId);
    }
  };

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
            <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
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
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomTypeId: e.target.value })
                  }
                  required
                  disabled={
                    !formData.hostelId || filteredRoomTypes.length === 0
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.hostelId
                      ? 'Select hostel first'
                      : filteredRoomTypes.length === 0
                      ? 'No room types available'
                      : 'Select Room Type'}
                  </option>
                  {filteredRoomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (Capacity: {type.capacity})
                    </option>
                  ))}
                </select>
                {formData.hostelId && filteredRoomTypes.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No room types found for this hostel. Create a room type
                    first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="A101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="1"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Occupancy <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxOccupancy: e.target.value,
                    })
                  }
                  required
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Optional notes..."
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
                    !formData.roomNumber ||
                    !formData.maxOccupancy
                  }
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateRoomModal;
