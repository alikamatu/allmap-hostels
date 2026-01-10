'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, User, School } from 'lucide-react';
import { User as UserType, UpdateUserData } from '@/types/user.types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdate: (data: UpdateUserData) => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUpdate }: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender,
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        emergency_contact_relationship: user.emergency_contact_relationship || '',
        emergency_contact_email: user.emergency_contact_email || '',
        school_id: user.school_id,
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateUserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-16 font-semibold text-gray-900">Edit User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 text-12 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-[#ff7a00]`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-10 text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value || undefined)}
                className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-12 font-medium text-gray-900 mb-3">Emergency Contact</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-11 font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name || ''}
                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                    className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                  />
                </div>
                <div>
                  <label className="block text-11 font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone || ''}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                  />
                </div>
                <div>
                  <label className="block text-11 font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_relationship || ''}
                    onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                    className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                    placeholder="e.g., Parent, Guardian, Sibling"
                  />
                </div>
                <div>
                  <label className="block text-11 font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.emergency_contact_email || ''}
                    onChange={(e) => handleChange('emergency_contact_email', e.target.value)}
                    className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-11 font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-11 font-medium bg-[#ff7a00] text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}