"use client";

import React from 'react';
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
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({ 
  isOpen, 
  onClose, 
  hostels, 
  roomTypes, 
  formData, 
  setFormData, 
  onSubmit, 
  loading 
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Bulk Create Rooms</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy</label>
                  <input
                    type="number"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Numbers</label>
                <textarea
                  value={formData.roomNumbers}
                  onChange={(e) => setFormData({ ...formData, roomNumbers: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="A101, A102, A103, A104..."
                />
                <p className="text-xs text-gray-500 mt-1">Separate room numbers with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Optional notes for all rooms..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
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