"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { useSchoolSearch } from '@/hooks/useSchoolSearch';
import { useOnboarding } from '@/hooks/useOnboarding';

import { OnboardingStep, EmergencyContact, OnboardingData } from '@/types/onboarding';
import { ProgressBar } from '@/_components/onboarding/ProgressBar';
import { ErrorAlert } from '@/_components/common/ui/ErrorAlert';
import { SchoolSelectionStep } from '@/_components/onboarding/SchoolSelectionStep';
import { EmergencyContactStep } from '@/_components/onboarding/EmergencyContactStep';

const steps = [
  { number: 1, label: 'Select School' },
  { number: 2, label: 'Emergency Contact' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [contactData, setContactData] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relationship: '',
    email: '',
  });

  const {
    schools,
    loadingSchools,
    error: schoolsError,
    searchQuery,
    setSearchQuery,
  } = useSchoolSearch();

  const {
    isLoading,
    error: submitError,
    setError,
    submitOnboarding,
  } = useOnboarding();

  const error = schoolsError || submitError;

  const selectedSchoolData = schools.find(s => s.id === selectedSchool);

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && !selectedSchool) {
      setError('Please select your school');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async () => {
    const onboardingData: OnboardingData = {
      school_id: selectedSchool,
      emergency_contact_name: contactData.name,
      emergency_contact_phone: contactData.phone,
      emergency_contact_relationship: contactData.relationship,
      emergency_contact_email: contactData.email || undefined,
    };

    const success = await submitOnboarding(onboardingData);
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <ProgressBar currentStep={step} steps={steps} />

        <ErrorAlert 
          error={error} 
          onDismiss={() => setError('')} 
        />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <SchoolSelectionStep
              schools={schools}
              loadingSchools={loadingSchools}
              searchQuery={searchQuery}
              selectedSchool={selectedSchool}
              onSearchChange={setSearchQuery}
              onSchoolSelect={handleSchoolSelect}
              onNext={handleNext}
              error={error}
            />
          )}

          {step === 2 && (
            <EmergencyContactStep
              selectedSchool={selectedSchoolData || null}
              contactData={contactData}
              onContactChange={setContactData}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}