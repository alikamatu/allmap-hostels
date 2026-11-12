"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthPageSkeleton,
  OnboardingPageSkeleton,
} from "@/_components/common/ui/PageSkeletons";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store auth data
        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        if (user.id) {
          localStorage.setItem("userId", user.id);
        }

        // Notify all contexts that auth state has updated
        window.dispatchEvent(new Event("auth-state-change"));

        // First-timers check: route to onboarding if profile/onboarding is incomplete
        const onboardingCompleted =
          user.onboarding_completed ?? user.onboardingCompleted;
        const schoolId = user.school_id ?? user.schoolId;
        const isProfileComplete = !!(
          onboardingCompleted &&
          schoolId &&
          user.gender &&
          user.phone
        );

        if (isProfileComplete) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.replace("/login?error=auth_failed");
      }
    } else {
      router.replace("/login?error=missing_params");
    }
  }, [router, searchParams]);

  return <OnboardingPageSkeleton />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <CallbackContent />
    </Suspense>
  );
}
