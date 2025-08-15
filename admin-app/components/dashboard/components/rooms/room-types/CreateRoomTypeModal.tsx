"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Gender options to match backend allowed_genders
export enum AllowedGender {
  MALE = 'male',
  FEMALE = 'female',
  MIXED = 'mixed',
  OTHER = 'other'
}

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
  allowedGenders: string[]; // Changed from gender to allowedGenders array
  total_rooms: number;
  available_rooms: number;
  images: string[];
  amenities: string[];
};

interface CreateRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostels: HostelOption[];
  onSubmit: (data: CreateRoomTypeFormData) => void;
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
    allowedGenders: string[]; // Changed from gender to allowedGenders array
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
    allowedGenders: [AllowedGender.MIXED], // Default to mixed
    total_rooms: '1',
    available_rooms: '1',
    images: [],
    amenities: [],
  });

  const [newAmenity, setNewAmenity] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for allowed genders
  const handleGenderToggle = (gender: AllowedGender) => {
    setFormData((prev) => {
      const currentGenders = prev.allowedGenders;
      const isSelected = currentGenders.includes(gender);

      if (isSelected) {
        // Remove if already selected (but ensure at least one remains)
        const newGenders = currentGenders.filter(g => g !== gender);
        return {
          ...prev,
          allowedGenders: newGenders.length > 0 ? newGenders : [AllowedGender.MIXED]
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          allowedGenders: [...currentGenders, gender]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hostelId) {
      alert('Please select a hostel');
      return;
    }

    if (!formData.name) {
      alert('Room type name is required');
      return;
    }

    if (!formData.pricePerSemester || !formData.pricePerMonth) {
      alert('Pricing information is required');
      return;
    }

    if (formData.allowedGenders.length === 0) {
      alert('Please select at least one allowed gender');
      return;
    }

    // Debug logging
    console.log('Form data allowedGenders before submission:', formData.allowedGenders);

    // Convert string values to numbers and include allowedGenders
    const data: CreateRoomTypeFormData = {
      hostelId: formData.hostelId,
      name: formData.name,
      description: formData.description,
      pricePerSemester: parseFloat(formData.pricePerSemester),
      pricePerMonth: parseFloat(formData.pricePerMonth),
      pricePerWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : undefined,
      capacity: parseInt(formData.capacity),
      allowedGenders: [...formData.allowedGenders], // Ensure it's a proper array copy
      total_rooms: parseInt(formData.total_rooms),
      available_rooms: parseInt(formData.available_rooms),
      amenities: formData.amenities,
      images: formData.images,
    };

    console.log('Submitting Room Type:', data);
    console.log('allowedGenders in final data:', data.allowedGenders);
    onSubmit(data);
  };

  // Helper function to get gender display name
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

  // Helper function to get selected genders display
  const getSelectedGendersDisplay = (): string => {
    if (formData.allowedGenders.length === 0) return 'None selected';
    if (formData.allowedGenders.length === 1) {
      return getGenderDisplayName(formData.allowedGenders[0] as AllowedGender);
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-4">Create New Room Type</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
                <select
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Deluxe Single"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Describe the room type..."
                />
              </div>

              {/* Debug Section - Remove this after fixing */}
              <div className="p-3 bg-gray-100 rounded-lg text-xs">
                <strong>Debug Info:</strong>
                <div>Selected genders: {JSON.stringify(formData.allowedGenders)}</div>
                <div>Array length: {formData.allowedGenders.length}</div>
              </div>

              {/* Allowed Genders Selection Field - Now with checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Genders
                </label>
                <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                  {Object.values(AllowedGender).map((gender) => (
                    <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowedGenders.includes(gender)}
                        onChange={() => handleGenderToggle(gender)}
                        className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">
                        {getGenderDisplayName(gender)}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select who can be assigned to rooms of this type. You can select multiple options.
                </p>
                <div className="mt-1 text-sm text-gray-600">
                  Selected: {getSelectedGendersDisplay()}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Semester</label>
                  <input
                    type="number"
                    name="pricePerSemester"
                    value={formData.pricePerSemester}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Month</label>
                  <input
                    type="number"
                    name="pricePerMonth"
                    value={formData.pricePerMonth}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Week</label>
                  <input
                    type="number"
                    name="pricePerWeek"
                    value={formData.pricePerWeek}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  max="2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Rooms</label>
                <input
                  type="number"
                  name="total_rooms"
                  value={formData.total_rooms}
                  onChange={handleChange}
                  required
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Rooms</label>
                <input
                  type="number"
                  name="available_rooms"
                  value={formData.available_rooms}
                  onChange={handleChange}
                  required
                  min="0"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="Add an amenity..."
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>

                {formData.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  {loading ? 'Creating...' : 'Create Room Type'}
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