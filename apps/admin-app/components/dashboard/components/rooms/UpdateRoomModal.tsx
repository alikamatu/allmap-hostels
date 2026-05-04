"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Room, RoomStatus } from '@/types/room';
import { Button, Select, Input } from '@repo/ui';

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
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
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
          <div className="bg-white border-t-4 border-t-[#FF6A00] p-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">UPDATE ROOM</h3>
                <p className="text-xs text-gray-600 mt-1">Edit room details and status</p>
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="p-4 space-y-4 overflow-y-auto"
          >
            {/* Room Number and Floor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ROOM NUMBER
                </label>
                <Input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                  className="bg-gray-50 focus:bg-white"
                  placeholder="A101"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  FLOOR
                </label>
                <Input
                  type="number"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                  className="bg-gray-50 focus:bg-white"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                STATUS
              </label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as RoomStatus
                  })
                }
                className="bg-gray-50 focus:bg-white"
              >
                <option value={RoomStatus.AVAILABLE}>Available</option>
                <option value={RoomStatus.OCCUPIED}>Occupied</option>
                <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
                <option value={RoomStatus.RESERVED}>Reserved</option>
              </Select>
            </div>

            {/* Occupancy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  MAX OCCUPANCY
                </label>
                <Input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxOccupancy: e.target.value
                    })
                  }
                  min={1}
                  className="bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  CURRENT OCCUPANCY
                </label>
                <Input
                  type="number"
                  value={formData.currentOccupancy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentOccupancy: e.target.value
                    })
                  }
                  min={0}
                  max={formData.maxOccupancy}
                  className="bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                NOTES
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150 border border-input rounded-md"
                placeholder="Optional notes..."
              />
            </div>

            {/* Room Information */}
            <div className="bg-gray-50 p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                ROOM INFORMATION
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Hostel: {room.hostel?.name || 'Unknown'}</div>
                <div>Room Type: {room.roomType?.name || 'Unknown'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                loadingText="Updating..."
                disabled={loading}
                className="flex-1 bg-[#FF6A00] hover:bg-[#E55E00] text-white border-none"
              >
                Update Room
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default UpdateRoomModal;