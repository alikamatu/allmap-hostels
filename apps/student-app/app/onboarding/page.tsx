"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Card,
  CardContent,
  Heading,
  Text,
  cn,
} from "@repo/ui";
import { useOnboarding } from "@repo/shared/hooks";
import { ProgressBar } from "@/_components/onboarding/ProgressBar";
import { PersonalInfoStep } from "@/_components/onboarding/PersonalInfoStep";
import { SchoolSelectionStep } from "@/_components/onboarding/SchoolSelectionStep";
import { EmergencyContactStep } from "@/_components/onboarding/EmergencyContactStep";
import { BrandLogo, BRAND } from "@/_components/brand";
import { OnboardingPageSkeleton } from "@/_components/common/ui/PageSkeletons";

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "Confirm your personal details to get started",
  2: "Select your university or college campus",
  3: "Add a trusted emergency contact for your safety",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [initializing, setInitializing] = useState(true);
  const [localFallback, setLocalFallback] = useState<{
    name?: string;
    phone?: string;
    gender?: "male" | "female" | "";
    school_id?: string;
  }>({});
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "destructive" | "idle";
  }>({
    message: "",
    type: "idle",
  });

  const {
    schools,
    isLoading,
    loadingSchools,
    onboardingData,
    error,
    setError,
    fetchSchools,
    fetchOnboardingStatus,
    submitOnboarding,
  } = useOnboarding();

  useEffect(() => {
    if (error) {
      setNotification({ message: error, type: "destructive" });
    }
  }, [error]);

  useEffect(() => {
    if (notification.type !== "idle") {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "idle" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const initOnboarding = async () => {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      // Immediately seed fields from localStorage for first-timers
      let cachedUser: Record<string, unknown> = {};
      try {
        cachedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const nameVal =
          typeof cachedUser.name === "string" ? cachedUser.name : "";
        const phoneVal =
          typeof cachedUser.phone === "string" ? cachedUser.phone : "";
        const genderVal =
          typeof cachedUser.gender === "string" ? cachedUser.gender : "";
        const schoolVal =
          typeof cachedUser.school_id === "string"
            ? cachedUser.school_id
            : typeof cachedUser.schoolId === "string"
              ? cachedUser.schoolId
              : "";
        setLocalFallback({
          name: nameVal,
          phone: phoneVal,
          gender: genderVal,
          school_id: schoolVal,
        });
      } catch {
        // Ignore malformed localStorage
      }

      const [, profile] = await Promise.all([
        fetchSchools(),
        fetchOnboardingStatus(),
      ]);

      const merged = { ...cachedUser, ...(profile || {}) };
      const onboardingCompleted =
        merged.onboarding_completed ?? merged.onboardingCompleted;
      const schoolId = merged.school_id ?? merged.schoolId;
      const hasPersonal = Boolean(merged.name && merged.phone && merged.gender);
      const hasEmergency = Boolean(
        merged.emergency_contact_name && merged.emergency_contact_phone,
      );

      // If user has already completed all onboarding requirements, go to dashboard
      if (onboardingCompleted && schoolId && hasPersonal && hasEmergency) {
        router.replace("/dashboard");
        return;
      }

      // Determine smart starting step for first-timers:
      // - Google OAuth first-timers lack phone/gender -> start at Step 1
      // - Email signup first-timers already entered name/phone/gender -> start at Step 2
      // - Users who already picked a school -> resume at Step 3
      if (!hasPersonal) {
        setStep(1);
      } else if (!schoolId) {
        setStep(2);
      } else {
        setStep(3);
      }

      setInitializing(false);
    };

    initOnboarding();
  }, [fetchSchools, fetchOnboardingStatus, router]);

  const handleOnboardingError = (message: string) => {
    setError(message);
    if (!message) {
      setNotification({ message: "", type: "idle" });
      return;
    }
    setNotification({ message, type: "destructive" });
  };

  const handleComplete = () => {
    setNotification({
      message: "Onboarding completed! Redirecting to your dashboard...",
      type: "success",
    });
    router.replace("/dashboard");
  };

  if (initializing) {
    return <OnboardingPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 sm:py-12 px-4 font-sans relative overflow-hidden">
      <AnimatePresence>
        {notification.type !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <Alert
              variant={notification.type}
              className={cn(
                "shadow-xl border flex items-center py-4 px-5 gap-3 rounded-2xl backdrop-blur-xl",
                notification.type === "success"
                  ? "bg-green-50/95 border-green-200"
                  : "bg-red-50/95 border-red-200",
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 p-2 rounded-full",
                  notification.type === "success"
                    ? "bg-green-100"
                    : "bg-red-100",
                )}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-700" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-700" />
                )}
              </div>
              <AlertDescription className="text-sm font-semibold text-black leading-snug">
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-4">
                <BrandLogo size={44} showText={false} />
              </div>
              <Heading
                variant="h2"
                className="text-black mb-2 font-bold tracking-tight"
              >
                {BRAND.name}
              </Heading>
              <Text className="text-black font-medium">
                {STEP_DESCRIPTIONS[step] || "Complete your profile to continue"}
              </Text>
            </div>

            <ProgressBar
              currentStep={step}
              totalSteps={3}
              onStepClick={(targetStep) => {
                handleOnboardingError("");
                setStep(targetStep);
              }}
            />

            <div className="relative min-h-[340px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PersonalInfoStep
                      onNext={() => {
                        handleOnboardingError("");
                        setStep(2);
                      }}
                      submitOnboarding={submitOnboarding}
                      initialData={{
                        name: onboardingData.name || localFallback.name || "",
                        phone:
                          onboardingData.phone || localFallback.phone || "",
                        gender:
                          (onboardingData.gender as "male" | "female") ||
                          localFallback.gender ||
                          "",
                      }}
                      isLoading={isLoading}
                      onError={handleOnboardingError}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SchoolSelectionStep
                      schools={schools}
                      loadingSchools={loadingSchools}
                      onFetchSchools={fetchSchools}
                      onNext={() => {
                        handleOnboardingError("");
                        setStep(3);
                      }}
                      onBack={() => {
                        handleOnboardingError("");
                        setStep(1);
                      }}
                      submitOnboarding={submitOnboarding}
                      initialSchoolId={
                        onboardingData.school_id || localFallback.school_id
                      }
                      isLoading={isLoading}
                      onError={handleOnboardingError}
                    />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmergencyContactStep
                      onBack={() => {
                        handleOnboardingError("");
                        setStep(2);
                      }}
                      onComplete={handleComplete}
                      submitOnboarding={submitOnboarding}
                      initialData={{
                        name: onboardingData.emergency_contact_name || "",
                        phone: onboardingData.emergency_contact_phone || "",
                        relationship:
                          onboardingData.emergency_contact_relationship || "",
                        email: onboardingData.emergency_contact_email || "",
                      }}
                      isLoading={isLoading}
                      onError={handleOnboardingError}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Text variant="sm" className="text-gray-400">
            {BRAND.copyright}
          </Text>
        </div>
      </motion.div>
    </div>
  );
}
