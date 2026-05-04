"use client"

import { motion } from 'framer-motion';
import {
  User,
  Phone,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import React from 'react';
import { Button, Input } from '@repo/ui';

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

const genders = ['Male', 'Female'];

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
      if (digitsOnly.length > 15) return;
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
    if (validationError) return;
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-lg">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Personal Details</h2>
        </div>
        <p className="text-gray-500 font-medium">
          Let's start with some basic information about you.
        </p>
      </div>

      <div className="grid gap-6">
        <Input
          label="Full Name"
          icon={User}
          value={data.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Osama Alikamatu"
          className="bg-transparent border-b-2 border-gray-100 focus:border-black rounded-none px-0 pl-10 h-14"
        />

        <Input
          label="Phone Number"
          icon={Phone}
          type="tel"
          value={data.phone}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="0541234567"
          className="bg-transparent border-b-2 border-gray-100 focus:border-black rounded-none px-0 pl-10 h-14"
        />

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest black">
            Gender
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {genders.map((g) => {
              const value = g.toLowerCase();
              const isSelected = data.gender === value;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleFieldChange('gender', value)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all duration-300 border ${isSelected
                    ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                    : 'bg-white text-black border-gray-100 hover:border-gray-300'
                    }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full sm:w-auto px-10 h-14 rounded-2xl bg-black text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? 'Saving...' : 'Continue'}
          {!isLoading && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};
