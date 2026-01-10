"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { AllowedGender } from '@/types/room';
import Swal from 'sweetalert2';

type HostelOption = {
  id: string;
  name: string;
};

type CreateRoomTypeFormData = {
  hostelId: string;
  name: string;
  description: string;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
  capacity: number;
  allowedGenders: AllowedGender[];
  total_rooms: number;
  available_rooms: number;
  images: string[];
  amenities: string[];
};

interface CreateRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostels: HostelOption[];
  onSubmit: (data: CreateRoomTypeFormData) => Promise<void>;
  loading: boolean;
}

const CreateRoomTypeModal: React.FC<CreateRoomTypeModalProps> = ({
  isOpen,
  onClose,
  hostels,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<{
    hostelId: string;
    name: string;
    description: string;
    pricePerSemester: string;
    pricePerMonth: string;
    pricePerWeek: string;
    capacity: string;
    allowedGenders: AllowedGender[];
    total_rooms: string;
    available_rooms: string;
    images: string[];
    amenities: string[];
  }>({
    hostelId: '',
    name: '',
    description: '',
    pricePerSemester: '',
    pricePerMonth: '',
    pricePerWeek: '',
    capacity: '1',
    allowedGenders: [AllowedGender.MIXED],
    total_rooms: '1',
    available_rooms: '1',
    images: [],
    amenities: [],
  });

  const [newAmenity, setNewAmenity] = useState('');

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderToggle = (gender: AllowedGender) => {
    setFormData((prev) => {
      const currentGenders = prev.allowedGenders;
      const isSelected = currentGenders.includes(gender);

      if (isSelected) {
        const newGenders = currentGenders.filter((g) => g !== gender);
        return {
          ...prev,
          allowedGenders: newGenders.length > 0 ? newGenders : [AllowedGender.MIXED],
        };
      } else {
        return {
          ...prev,
          allowedGenders: [...currentGenders, gender],
        };
      }
    });
  };

  const addAmenity = () => {
    const trimmed = newAmenity.trim();
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hostelId) {
      showAlert('Hostel Required', 'Please select a hostel', 'warning');
      return;
    }

    if (!formData.name) {
      showAlert('Name Required', 'Room type name is required', 'warning');
      return;
    }

    if (!formData.pricePerSemester || !formData.pricePerMonth) {
      showAlert('Pricing Required', 'Pricing information is required', 'warning');
      return;
    }

    if (formData.allowedGenders.length === 0) {
      showAlert('Gender Selection Required', 'Please select at least one allowed gender', 'warning');
      return;
    }

    const data: CreateRoomTypeFormData = {
      hostelId: formData.hostelId,
      name: formData.name,
      description: formData.description,
      pricePerSemester: parseFloat(formData.pricePerSemester),
      pricePerMonth: parseFloat(formData.pricePerMonth),
      pricePerWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : undefined,
      capacity: parseInt(formData.capacity),
      allowedGenders: [...formData.allowedGenders],
      total_rooms: parseInt(formData.total_rooms),
      available_rooms: parseInt(formData.available_rooms),
      amenities: formData.amenities,
      images: formData.images,
    };

    try {
      await onSubmit(data);
      showAlert('Success', 'Room type created successfully!', 'success');
      onClose();
    } catch (error) {
      showAlert('Error', 'Failed to create room type. Please try again.', 'error');
    }
  };

  const getGenderDisplayName = (gender: AllowedGender): string => {
    switch (gender) {
      case AllowedGender.MALE:
        return 'Male';
      case AllowedGender.FEMALE:
        return 'Female';
      case AllowedGender.MIXED:
        return 'Mixed Gender';
      case AllowedGender.OTHER:
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const getSelectedGendersDisplay = (): string => {
    if (formData.allowedGenders.length === 0) return 'None selected';
    if (formData.allowedGenders.length === 1) {
      return getGenderDisplayName(formData.allowedGenders[0]);
    }
    return `${formData.allowedGenders.length} genders selected`;
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-t-4 border-t-[#FF6A00] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">CREATE ROOM TYPE</h3>
                  <p className="text-xs text-gray-600 mt-1">Add a new room type to your hostel</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Hostel Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">HOSTEL *</label>
                    <select
                      name="hostelId"
                      value={formData.hostelId}
                      onChange={handleChange}
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

                  {/* Room Type Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ROOM TYPE NAME *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                      placeholder="e.g., Deluxe Single"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">DESCRIPTION</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                      placeholder="Describe the room type..."
                    />
                  </div>

                  {/* Allowed Genders */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      ALLOWED GENDERS *
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50">
                      {Object.values(AllowedGender).map((gender) => (
                        <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.allowedGenders.includes(gender)}
                            onChange={() => handleGenderToggle(gender)}
                            disabled={loading}
                            className="w-3 h-3 text-[#FF6A00] border-gray-300 focus:ring-[#FF6A00] focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-xs text-gray-700">
                            {getGenderDisplayName(gender)}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {getSelectedGendersDisplay()}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Pricing */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">PRICING (GHS) *</label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 min-w-[100px]">Per Semester:</label>
                        <div className="flex-1 relative">
                          <span className="absolute left-2 top-1.5 text-xs text-gray-500">GHS</span>
                          <input
                            type="number"
                            name="pricePerSemester"
                            value={formData.pricePerSemester}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-1.5 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 min-w-[100px]">Per Month:</label>
                        <div className="flex-1 relative">
                          <span className="absolute left-2 top-1.5 text-xs text-gray-500">GHS</span>
                          <input
                            type="number"
                            name="pricePerMonth"
                            value={formData.pricePerMonth}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-1.5 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 min-w-[100px]">Per Week:</label>
                        <div className="flex-1 relative">
                          <span className="absolute left-2 top-1.5 text-xs text-gray-500">GHS</span>
                          <input
                            type="number"
                            name="pricePerWeek"
                            value={formData.pricePerWeek}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-1.5 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity and Rooms */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">CAPACITY *</label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                        min="1"
                        max="2000"
                        disabled={loading}
                        className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">TOTAL ROOMS *</label>
                      <input
                        type="number"
                        name="total_rooms"
                        value={formData.total_rooms}
                        onChange={handleChange}
                        required
                        min="1"
                        max="1000"
                        disabled={loading}
                        className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                      />
                    </div>
                  </div>

                  {/* Available Rooms */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">AVAILABLE ROOMS *</label>
                    <input
                      type="number"
                      name="available_rooms"
                      value={formData.available_rooms}
                      onChange={handleChange}
                      required
                      min="0"
                      max="1000"
                      disabled={loading}
                      className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">AMENITIES</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                        placeholder="Add an amenity..."
                      />
                      <button
                        type="button"
                        onClick={addAmenity}
                        disabled={loading || !newAmenity.trim()}
                        className="px-3 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {formData.amenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {formData.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => removeAmenity(amenity)}
                              disabled={loading}
                              className="text-gray-500 hover:text-red-500 text-xs"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1" />
                      Creating...
                    </>
                  ) : (
                    'Create Room Type'
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

export default CreateRoomTypeModal;