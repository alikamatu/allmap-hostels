"use client"

import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { School, EmergencyContact } from '@/types/onboarding';

const formatLocation = (location: unknown): string => {
  if (!location) return 'Unknown location';
  if (typeof location === 'string') return location;
  if (typeof location === 'object' && location !== null) {
    const loc = location as { type?: string; coordinates?: number[] };
    if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
      return `Lat: ${loc.coordinates[1].toFixed(3)}, Lng: ${loc.coordinates[0].toFixed(3)}`;
    }
    return loc.type || 'Invalid location';
  }
  return String(location);
};

const relationships = ['Parent', 'Guardian', 'Sibling', 'Spouse', 'Friend', 'Other'];

interface EmergencyContactStepProps {
  selectedSchool: School | null;
  contactData: EmergencyContact;
  onContactChange: (data: EmergencyContact) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string;
}

export const EmergencyContactStep: React.FC<EmergencyContactStepProps> = ({
  selectedSchool,
  contactData,
  onContactChange,
  onBack,
  onSubmit,
  isLoading,
  error,
}) => {
  const handleFieldChange = (field: keyof EmergencyContact, value: string) => {
    // Restrict phone number input length and digits only
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) return; // enforce max length 10
      onContactChange({ ...contactData, [field]: digitsOnly });
      return;
    }
    onContactChange({ ...contactData, [field]: value });
  };

  const validateForm = () => {
    if (!contactData.name.trim()) return 'Emergency contact name is required';
    if (!contactData.phone.trim()) return 'Emergency contact phone is required';
    if (contactData.phone.length !== 10)
      return 'Phone number must be exactly 10 digits';
    if (!contactData.relationship)
      return 'Please select your relationship with emergency contact';
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white -2 -black p-8 text-black">
        <div className="flex items-center mb-6">
          <UserGroupIcon className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold text-black">Emergency Contact</h2>
        </div>

        <p className="text-gray-600 mb-8">
          Provide emergency contact information for safety and security purposes.
        </p>

        {selectedSchool && (
          <div className="mb-6 p-4 bg-gray-50  -gray-200">
            <p className="text-sm text-gray-600 mb-1">Selected School:</p>
            <p className="font-semibold text-black">{selectedSchool.name}</p>
            <p className="text-sm text-gray-600">
              {formatLocation(selectedSchool.location)}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <ContactField
            label="Full Name *"
            icon={UserGroupIcon}
            type="text"
            value={contactData.name}
            onChange={(value) => handleFieldChange('name', value)}
            placeholder="John Doe"
          />

          <ContactField
            label="Phone Number *"
            icon={PhoneIcon}
            type="tel"
            value={contactData.phone}
            onChange={(value) => handleFieldChange('phone', value)}
            placeholder="10-digit number"
          />

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Relationship *
            </label>
            <select
              value={contactData.relationship}
              onChange={(e) => handleFieldChange('relationship', e.target.value)}
              className="w-full px-4 py-3 -b-2 -gray-200 focus:-black outline-none transition appearance-none bg-white"
            >
              <option value="">Select relationship</option>
              {relationships.map((rel) => (
                <option key={rel} value={rel.toLowerCase()}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          <ContactField
            label="Email Address (Optional)"
            icon={EnvelopeIcon}
            type="email"
            value={contactData.email || ''}
            onChange={(value) => handleFieldChange('email', value)}
            placeholder="contact@example.com"
          />
        </div>

        <div className="mt-8 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-8 py-3 -2 -black font-semibold hover:bg-gray-100 transition flex items-center"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-8 py-3 font-semibold flex items-center transition ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 -2 -white -t-transparent rounded-full mr-2"
                />
                Completing...
              </>
            ) : (
              <>
                Complete Setup
                <CheckCircleIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
        )}
      </div>
    </motion.div>
  );
};

const ContactField: React.FC<{
  label: string;
  icon: React.ComponentType<any>;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ label, icon: Icon, type, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-black mb-2">{label}</label>
    <div className="relative">
      <Icon className="w-5 h-5 text-black absolute left-3 top-3" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 -b-2 -gray-200 focus:-black outline-none transition"
      />
    </div>
  </div>
);
