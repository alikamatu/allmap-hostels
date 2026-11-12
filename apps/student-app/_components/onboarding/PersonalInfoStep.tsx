"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, ArrowRight } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { Button, Input, CustomSelect, cn } from "@repo/ui";
import { OnboardingData } from "@repo/types";

interface PersonalInfoStepProps {
  onNext: () => void;
  submitOnboarding: (data: Partial<OnboardingData>) => Promise<boolean>;
  initialData: {
    name: string;
    phone: string;
    gender: "male" | "female" | "";
  };
  isLoading: boolean;
  onError: (error: string) => void;
}

export const PersonalInfoStep = ({
  onNext,
  submitOnboarding,
  initialData,
  isLoading,
  onError,
}: PersonalInfoStepProps) => {
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [gender, setGender] = useState<"male" | "female" | "">(
    initialData.gender || "",
  );

  useEffect(() => {
    if (initialData.name) setName(initialData.name);
    if (initialData.phone) setPhone(initialData.phone);
    if (initialData.gender) setGender(initialData.gender);
  }, [initialData.name, initialData.phone, initialData.gender]);

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      return "Please enter your full name (at least 2 characters)";
    }
    if (!gender) {
      return "Please select your gender";
    }
    if (!phone.trim()) {
      return "Please enter your phone number";
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return "Please enter a valid phone number (at least 10 digits)";
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
      name: name.trim(),
      phone: phone.trim(),
      gender: gender as "male" | "female",
      last_onboarding_step: 2,
    });

    if (success) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="space-y-1"
      >
        <Input
          id="name"
          type="text"
          label="Full Name"
          icon={User}
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
            onError("");
          }}
          className="bg-white border-b border-gray-200 focus:border-black rounded-none px-0 pl-10 h-11 sm:h-12"
          placeholder="John Doe"
          required
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <CustomSelect
          id="gender"
          label="Gender"
          required
          placeholder="Select gender"
          value={gender}
          onChange={(val) => {
            setGender(val as "male" | "female" | "");
            onError("");
          }}
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />

        <Input
          id="phone"
          type="tel"
          label="Phone Number"
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full h-14 text-white font-medium transition-all duration-300 relative overflow-hidden bg-black hover:bg-gray-800",
            isLoading && "bg-gray-700",
          )}
        >
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <span className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                <span>Saving profile...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </motion.div>
    </form>
  );
};
