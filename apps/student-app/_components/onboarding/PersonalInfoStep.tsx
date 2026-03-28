"use client"

import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import React from 'react';

interface PersonalInfoStepProps {
  data: {
    name: string;
    phone: string;
    gender: string;
  };
  onChange: (data: { name: string; phone: string; gender: string }) => void;
  onNext: () => void;
  isLoading: boolean;
  error?: string;
}

const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onChange,
  onNext,
  isLoading,
  error,
}) => {
  const handleFieldChange = (field: string, value: string) => {
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 15) return; // Allow international format but limit length
      onChange({ ...data, [field]: digitsOnly });
      return;
    }
    onChange({ ...data, [field]: value });
  };

  const validateForm = () => {
    if (!data.name.trim()) return 'Name is required';
    if (!data.phone.trim()) return 'Phone number is required';
    if (data.phone.length < 10) return 'Please enter a valid phone number';
    if (!data.gender) return 'Please select your gender';
    return null;
  };

  const handleNext = () => {
    const validationError = validateForm();
    if (validationError) {
      return; // Error will be shown via the parent's error state if passed
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white border-2 border-black p-8 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center mb-6">
          <UserIcon className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold text-black uppercase tracking-tight">Personal Information</h2>
        </div>

        <p className="text-gray-600 mb-8 font-medium">
          Let's start with some basic information about you.
        </p>

        <div className="space-y-6">
          <InputGroup
            label="Full Name *"
            icon={UserIcon}
            type="text"
            value={data.name}
            onChange={(value) => handleFieldChange('name', value)}
            placeholder="Enter your full name"
          />

          <InputGroup
            label="Phone Number *"
            icon={PhoneIcon}
            type="tel"
            value={data.phone}
            onChange={(value) => handleFieldChange('phone', value)}
            placeholder="e.g. 0541234567"
          />

          <div>
            <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
              Gender *
            </label>
            <div className="relative">
              <select
                value={data.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black focus:bg-gray-50 outline-none transition appearance-none bg-white font-medium"
              >
                <option value="">Select gender</option>
                {genders.map((g) => (
                  <option key={g} value={g.toLowerCase()}>
                    {g}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRightIcon className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={isLoading}
            className={`px-10 py-4 font-bold uppercase tracking-widest flex items-center transition border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
              isLoading
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-black text-white'
            }`}
          >
            {isLoading ? 'Saving...' : 'Next Step'}
            {!isLoading && <ChevronRightIcon className="w-5 h-5 ml-2" />}
          </motion.button>
        </div>

        {error && (
          <p className="text-red-600 mt-6 font-bold text-sm bg-red-50 p-3 border-2 border-red-200">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const InputGroup: React.FC<{
  label: string;
  icon: React.ComponentType<any>;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ label, icon: Icon, type, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r-2 border-black pr-3">
        <Icon className="w-5 h-5 text-black" />
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-16 pr-4 py-4 border-2 border-black focus:bg-gray-50 outline-none transition font-medium placeholder:text-gray-400"
      />
    </div>
  </div>
);
