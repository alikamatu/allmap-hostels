"use client"

import { motion } from 'framer-motion';
import { 
  Users, 
  Phone, 
  Mail, 
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { School, EmergencyContact } from '@repo/types';
import { Button, Input } from '@repo/ui';
import React from 'react';

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
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 10) return;
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
      return 'Please select your relationship';
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) return;
    onSubmit();
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
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Emergency Contact</h2>
        </div>
        <p className="text-gray-500 font-medium">
          Who should we reach out to in case of an emergency?
        </p>
      </div>

      <div className="grid gap-6">
        <Input
          label="Contact Name"
          icon={Users}
          value={contactData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="e.g. Mary Doe"
          className="bg-transparent border-b-2 border-gray-100 focus:border-black rounded-none px-0 pl-10 h-14"
        />

        <Input
          label="Phone Number"
          icon={Phone}
          type="tel"
          value={contactData.phone}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          placeholder="054XXXXXXX"
          className="bg-transparent border-b-2 border-gray-100 focus:border-black rounded-none px-0 pl-10 h-14"
        />

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Relationship
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relationships.map((rel) => {
              const value = rel.toLowerCase();
              const isSelected = contactData.relationship === value;
              return (
                <button
                  key={rel}
                  type="button"
                  onClick={() => handleFieldChange('relationship', value)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                    isSelected 
                      ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {rel}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Email Address (Optional)"
          icon={Mail}
          type="email"
          value={contactData.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          placeholder="contact@example.com"
          className="bg-transparent border-b-2 border-gray-100 focus:border-black rounded-none px-0 pl-10 h-14"
        />
      </div>

      <div className="pt-6 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="h-14 px-8 rounded-2xl border-gray-200 font-bold flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 h-14 rounded-2xl bg-black text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Completing...
            </>
          ) : (
            <>
              Complete Setup
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
