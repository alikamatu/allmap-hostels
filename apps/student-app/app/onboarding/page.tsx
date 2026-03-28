"use client";

import { useOnboarding } from '@repo/shared/hooks';
import { useSchoolSearch } from '@repo/shared/hooks';
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { OnboardingStep, EmergencyContact, OnboardingData } from '@repo/types';
import { ProgressBar } from '@/_components/onboarding/ProgressBar';
import { ErrorAlert } from '@/_components/common/ui/ErrorAlert';
import { PersonalInfoStep } from '@/_components/onboarding/PersonalInfoStep';
import { SchoolSelectionStep } from '@/_components/onboarding/SchoolSelectionStep';
import { EmergencyContactStep } from '@/_components/onboarding/EmergencyContactStep';

const steps = [
  { number: 1, label: 'Personal Info' },
  { number: 2, label: 'Select School' },
  { number: 3, label: 'Emergency Contact' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [personalData, setPersonalData] = useState({
    name: '',
    phone: '',
    gender: '',
  });
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
    fetchOnboardingStatus,
    submitOnboarding,
  } = useOnboarding();

  useEffect(() => {
    const init = async () => {
      const profile = await fetchOnboardingStatus();
      if (profile) {
        setPersonalData({
          name: profile.name || '',
          phone: profile.phone || '',
          gender: profile.gender || '',
        });
        
        if (profile.school_id) {
          setSelectedSchool(profile.school_id);
        }
        
        if (profile.emergency_contact_name) {
          setContactData({
            name: profile.emergency_contact_name,
            phone: profile.emergency_contact_phone || '',
            relationship: profile.emergency_contact_relationship || '',
            email: profile.emergency_contact_email || '',
          });
        }

        // Determine correct step based on missing fields
        if (!profile.name || !profile.phone || !profile.gender) {
          setStep(1);
        } else if (!profile.school_id) {
          setStep(2);
        } else {
          setStep(3);
        }
      }
    };
    init();
  }, [fetchOnboardingStatus]);

  const error = schoolsError || submitError;
  const selectedSchoolData = schools.find(s => s.id === selectedSchool);

  const handlePersonalInfoNext = async () => {
    const success = await submitOnboarding({
      name: personalData.name,
      phone: personalData.phone,
      gender: personalData.gender,
      last_onboarding_step: 2
    });
    if (success) {
      setError('');
      setStep(2);
    }
  };

  const handleSchoolNext = async () => {
    if (!selectedSchool) {
      setError('Please select your school');
      return;
    }
    const success = await submitOnboarding({ 
      school_id: selectedSchool,
      last_onboarding_step: 3
    });
    if (success) {
      setError('');
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => (prev - 1) as OnboardingStep);
  };

  const handleSubmit = async () => {
    const onboardingData: OnboardingData = {
      name: personalData.name,
      phone: personalData.phone,
      gender: personalData.gender,
      school_id: selectedSchool,
      emergency_contact_name: contactData.name,
      emergency_contact_phone: contactData.phone,
      emergency_contact_relationship: contactData.relationship,
      emergency_contact_email: contactData.email || undefined,
    };

    const success = await submitOnboarding(onboardingData);
    if (success) {
      router.push('/dashboard');
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
            <PersonalInfoStep
              data={personalData}
              onChange={setPersonalData}
              onNext={handlePersonalInfoNext}
              isLoading={isLoading}
              error={error}
            />
          )}

          {step === 2 && (
            <SchoolSelectionStep
              schools={schools}
              loadingSchools={loadingSchools}
              searchQuery={searchQuery}
              selectedSchool={selectedSchool}
              onSearchChange={setSearchQuery}
              onSchoolSelect={(id) => { setSelectedSchool(id); setError(''); }}
              onNext={handleSchoolNext}
              onBack={handleBack}
              error={error}
            />
          )}

          {step === 3 && (
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