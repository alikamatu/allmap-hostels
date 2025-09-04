"use client";

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Hostel } from '@/types/hostel';
import { RoomType } from '@/types/room';
import Swal from 'sweetalert2';

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
  onSubmit: (data: CreateRoomFormData) => Promise<void>;
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

  const showAlert = (title: string, text: string, icon: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#1a73e8', // Google blue
      confirmButtonText: 'OK',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 font-medium',
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hostelId) {
      showAlert('Hostel Required', 'Please select a hostel', 'warning');
      return;
    }

    if (!formData.roomTypeId) {
      showAlert('Room Type Required', 'Please select a room type', 'warning');
      return;
    }

    if (!formData.roomNumber.trim()) {
      showAlert('Room Number Required', 'Please enter a room number', 'warning');
      return;
    }

    if (!formData.maxOccupancy) {
      showAlert('Max Occupancy Required', 'Please specify the maximum occupancy', 'warning');
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

    try {
      await onSubmit(submitData);
      showAlert('Success', 'Room created successfully!', 'success');
      onClose();
    } catch (error) {
      showAlert('Error', 'Failed to create room. Please try again.', 'error');
    }
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
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Room</h3>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => handleHostelChange(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  <option value="">Select a hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  required
                  disabled={loading || !formData.hostelId || filteredRoomTypes.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
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
                  <p className="text-sm text-amber-600 mt-1.5">
                    No room types found for this hostel. Create a room type first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    placeholder="e.g., A101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    placeholder="e.g., 1"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Occupancy <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                  required
                  min="1"
                  max="10"
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  placeholder="e.g., 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  placeholder="Optional notes..."
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.hostelId ||
                    !formData.roomTypeId ||
                    !formData.roomNumber.trim() ||
                    !formData.maxOccupancy
                  }
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Room'
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

export default CreateRoomModal;