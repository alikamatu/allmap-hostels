'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, Lock, User, School } from 'lucide-react';
import { CreateUserData } from '@/types/user.types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserData) => void;
}

export default function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    is_verified: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onCreate(formData);
      onClose();
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student',
        is_verified: true,
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserData, value: any) => {
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
          <h2 className="text-16 font-semibold text-gray-900">Create New User</h2>
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
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 text-12 border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-[#ff7a00]`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-10 text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 text-12 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-[#ff7a00]`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-10 text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 text-12 border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-[#ff7a00]`}
                  placeholder="Enter password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-10 text-red-600">{errors.password}</p>
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
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-11 font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
              >
                <option value="student">Student</option>
                <option value="hostel_admin">Hostel Admin</option>
              </select>
            </div>

            {/* Verification */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_verified"
                checked={formData.is_verified}
                onChange={(e) => handleChange('is_verified', e.target.checked)}
                className="h-4 w-4 text-[#ff7a00] focus:ring-[#ff7a00] border-gray-300 rounded"
              />
              <label htmlFor="is_verified" className="ml-2 text-11 text-gray-700">
                Mark as verified
              </label>
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
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}