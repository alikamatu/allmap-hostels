"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room, RoomStatus } from '@/types/room';

type UpdateRoomFormData = {
  roomNumber: string;
  floor?: string;
  status: RoomStatus;
  maxOccupancy: string;
  currentOccupancy: string;
  notes?: string;
};

interface UpdateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  formData: UpdateRoomFormData;
  setFormData: (data: UpdateRoomFormData) => void;
  onSubmit: () => void;
  loading: boolean;
}

const UpdateRoomModal: React.FC<UpdateRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  formData,
  setFormData,
  onSubmit,
  loading
}) => (
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
          className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold mb-4">
            Update Room {room.roomNumber}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
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
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as RoomStatus
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value={RoomStatus.AVAILABLE}>Available</option>
                <option value={RoomStatus.OCCUPIED}>Occupied</option>
                <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
                <option value={RoomStatus.RESERVED}>Reserved</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Occupancy
                </label>
                <input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxOccupancy: (e.target.value)
                    })
                  }
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Occupancy
                </label>
                <input
                  type="number"
                  value={formData.currentOccupancy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentOccupancy: (e.target.value)
                    })
                  }
                  min={0}
                  max={formData.maxOccupancy}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
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
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Room Information
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Hostel: {room.hostel?.name || 'Unknown'}</div>
                <div>Room Type: {room.roomType?.name || 'Unknown'}</div>
              </div>
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
                {loading ? 'Updating...' : 'Update Room'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default UpdateRoomModal;
