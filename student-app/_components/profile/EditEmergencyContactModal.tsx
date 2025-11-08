"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiPhone, FiMail, FiSave, FiUserPlus } from 'react-icons/fi';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

interface EditEmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyContact: EmergencyContact;
  onUpdate: (updatedProfile: any) => void;
}

const relationships = ['parent', 'guardian', 'sibling', 'spouse', 'friend', 'other'];

export default function EditEmergencyContactModal({ 
  isOpen, 
  onClose, 
  emergencyContact, 
  onUpdate 
}: EditEmergencyContactModalProps) {
  const [formData, setFormData] = useState({
    emergency_contact_name: emergencyContact.name || '',
    emergency_contact_phone: emergencyContact.phone || '',
    emergency_contact_relationship: emergencyContact.relationship || '',
    emergency_contact_email: emergencyContact.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.emergency_contact_name.trim()) {
      setError('Contact name is required');
      return;
    }
    if (!formData.emergency_contact_phone.trim()) {
      setError('Contact phone is required');
      return;
    }
    if (formData.emergency_contact_phone.replace(/\D/g, '').length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (!formData.emergency_contact_relationship) {
      setError('Relationship is required');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = {
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        emergency_contact_email: formData.emergency_contact_email || undefined,
      };

      console.log('Sending emergency contact update:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update emergency contact');
      }

      const updatedProfile = await response.json();
      onUpdate(updatedProfile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update emergency contact');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // Phone number validation - only digits, max 10
    if (field === 'emergency_contact_phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) return;
      setFormData(prev => ({ ...prev, [field]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (error) setError(null);
  };

  const formatRelationship = (rel: string) => {
    return rel.charAt(0).toUpperCase() + rel.slice(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-md border border-gray-200 shadow-lg"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black flex items-center">
                  <FiUserPlus className="mr-2" />
                  Emergency Contact
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={onClose}
                  className="text-black hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <FiX className="text-xl" />
                </motion.button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Name */}
                <div>
                  <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-black mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    id="emergency_contact_name"
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-black mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    id="emergency_contact_phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                    placeholder="10-digit number"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.emergency_contact_phone.length}/10 digits
                  </p>
                </div>

                {/* Relationship */}
                <div>
                  <label htmlFor="emergency_contact_relationship" className="block text-sm font-medium text-black mb-2">
                    <FiUserPlus className="inline mr-2" />
                    Relationship *
                  </label>
                  <select
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm appearance-none"
                    required
                  >
                    <option value="">Select relationship</option>
                    {relationships.map((rel) => (
                      <option key={rel} value={rel}>
                        {formatRelationship(rel)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Email (Optional) */}
                <div>
                  <label htmlFor="emergency_contact_email" className="block text-sm font-medium text-black mb-2">
                    <FiMail className="inline mr-2" />
                    Email Address (Optional)
                  </label>
                  <input
                    id="emergency_contact_email"
                    type="email"
                    value={formData.emergency_contact_email}
                    onChange={(e) => handleChange('emergency_contact_email', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm"
                    placeholder="contact@example.com"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-black border-b border-gray-200 hover:bg-gray-100 transition duration-200"
                    disabled={loading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 font-medium text-white transition duration-200 ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FiSave className="mr-2" />
                        Save Contact
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}