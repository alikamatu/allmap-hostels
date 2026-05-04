"use client";

import { useOnboarding } from '@repo/shared/hooks';
import { useSchoolSearch } from '@repo/shared/hooks';
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { OnboardingStep, EmergencyContact, OnboardingData } from '@repo/types';
import { ProgressBar } from '@/_components/onboarding/ProgressBar';
import { ErrorAlert } from '@/_components/common/ui/ErrorAlert';
import { PersonalInfoStep } from '@/_components/onboarding/PersonalInfoStep';
import { SchoolSelectionStep } from '@/_components/onboarding/SchoolSelectionStep';
import { EmergencyContactStep } from '@/_components/onboarding/EmergencyContactStep';
import { Card } from '@repo/ui';

const steps = [
  { number: 1, label: 'Profile' },
  { number: 2, label: 'School' },
  { number: 3, label: 'Safety' },
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
    <div className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white">
      <div className="max-w-xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-black/5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Setup Progress</span>
          </div>
          <ProgressBar currentStep={step} steps={steps} />
        </motion.div>

        <ErrorAlert 
          error={error} 
          onDismiss={() => setError('')} 
        />

        <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] p-8 md:p-12 bg-white overflow-hidden relative">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-bl-[5rem] -mr-8 -mt-8" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <PersonalInfoStep
                key="step1"
                data={personalData}
                onChange={setPersonalData}
                onNext={handlePersonalInfoNext}
                isLoading={isLoading}
                error={error}
              />
            )}

            {step === 2 && (
              <SchoolSelectionStep
                key="step2"
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
                key="step3"
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
        </Card>

        {/* Footer Info */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-400 text-xs font-medium"
        >
          Your information is secure and only used for hostel matching.
        </motion.p>
      </div>
    </div>
  );
}