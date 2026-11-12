"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Phone, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { Button, Input, CustomSelect, cn } from "@repo/ui";
import { OnboardingData } from "@repo/types";

interface EmergencyContactStepProps {
  onBack: () => void;
  onComplete: () => void;
  submitOnboarding: (data: Partial<OnboardingData>) => Promise<boolean>;
  initialData: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
  isLoading: boolean;
  onError: (error: string) => void;
}

const RELATIONSHIPS = [
  "Parent",
  "Guardian",
  "Sibling",
  "Spouse",
  "Relative",
  "Friend",
  "Other",
];

export const EmergencyContactStep = ({
  onBack,
  onComplete,
  submitOnboarding,
  initialData,
  isLoading,
  onError,
}: EmergencyContactStepProps) => {
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [relationship, setRelationship] = useState(
    initialData.relationship || "",
  );
  const [email, setEmail] = useState(initialData.email || "");

  useEffect(() => {
    if (initialData.name) setName(initialData.name);
    if (initialData.phone) setPhone(initialData.phone);
    if (initialData.relationship) setRelationship(initialData.relationship);
    if (initialData.email) setEmail(initialData.email);
  }, [
    initialData.name,
    initialData.phone,
    initialData.relationship,
    initialData.email,
  ]);

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      return "Please enter your emergency contact's full name";
    }
    if (!relationship) {
      return "Please select your relationship with this contact";
    }
    if (!phone.trim()) {
      return "Please enter your emergency contact's phone number";
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return "Please enter a valid emergency contact phone number (at least 10 digits)";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");

    const validationError = validateForm();
    if (validationError) {
      onError(validationError);
      return;
    }

    const success = await submitOnboarding({
      emergency_contact_name: name.trim(),
      emergency_contact_phone: phone.trim(),
      emergency_contact_relationship: relationship,
      emergency_contact_email: email.trim() || undefined,
      last_onboarding_step: 3,
    });

    if (success) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="emergencyName"
          type="text"
          label="Contact Full Name *"
          icon={Users}
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
            onError("");
          }}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11 sm:h-12"
          placeholder="Jane Doe"
          required
        />

        <CustomSelect
          id="relationship"
          label="Relationship"
          required
          placeholder="Select relationship"
          value={relationship}
          onChange={(val) => {
            setRelationship(val);
            onError("");
          }}
          options={RELATIONSHIPS.map((rel) => ({
            value: rel,
            label: rel,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="emergencyPhone"
          type="tel"
          label="Contact Phone *"
          icon={Phone}
          value={phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPhone(e.target.value);
            onError("");
          }}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11 sm:h-12"
          placeholder="+233 XX XXX XXXX"
          required
        />

        <Input
          id="emergencyEmail"
          type="email"
          label="Contact Email (Optional)"
          icon={Mail}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEmail(e.target.value);
            onError("");
          }}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11 sm:h-12"
          placeholder="contact@email.com"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex flex-col-reverse sm:flex-row gap-3 pt-2"
      >
        <Button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full sm:w-1/3 h-14 border border-gray-200 bg-white hover:bg-gray-50 text-black font-bold transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full sm:w-2/3 h-14 text-white font-medium transition-all duration-300 relative overflow-hidden bg-black hover:bg-gray-800",
            isLoading && "bg-gray-700",
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3 h-4 w-4" />
              <span>Completing setup...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>Complete Setup</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </Button>
      </motion.div>
    </form>
  );
};
