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
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Room Type</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Hostel *</label>
                <select
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  placeholder="e.g., Deluxe Single"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  placeholder="Describe the room type..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Genders *
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {Object.values(AllowedGender).map((gender) => (
                    <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowedGenders.includes(gender)}
                        onChange={() => handleGenderToggle(gender)}
                        disabled={loading}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">
                        {getGenderDisplayName(gender)}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Select who can be assigned to this room type. Multiple selections allowed.
                </p>
                <div className="mt-1.5 text-sm text-blue-600 font-medium">
                  Selected: {getSelectedGendersDisplay()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price/Semester *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="pricePerSemester"
                      value={formData.pricePerSemester}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      disabled={loading}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price/Month *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="pricePerMonth"
                      value={formData.pricePerMonth}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      disabled={loading}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price/Week</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="pricePerWeek"
                      value={formData.pricePerWeek}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      disabled={loading}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    max="2000"
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms *</label>
                  <input
                    type="number"
                    name="total_rooms"
                    value={formData.total_rooms}
                    onChange={handleChange}
                    required
                    min="1"
                    max="1000"
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms *</label>
                <input
                  type="number"
                  name="available_rooms"
                  value={formData.available_rooms}
                  onChange={handleChange}
                  required
                  min="0"
                  max="1000"
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    placeholder="Add an amenity (e.g., Wi-Fi, AC)..."
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    disabled={loading || !newAmenity.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          disabled={loading}
                          className="text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
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