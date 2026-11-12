"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  OnboardingPageSkeleton,
  DashboardPageSkeleton,
  BookingsPageSkeleton,
  ProfilePageSkeleton,
  HostelDetailPageSkeleton,
  RoomDetailPageSkeleton,
} from "@/_components/common/ui/PageSkeletons";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Skip check for public routes
        const publicRoutes = [
          "/",
          "/login",
          "/sign-up",
          "/verify-email",
          "/reset-password",
          "/forgot-password",
        ];
        if (
          publicRoutes.includes(pathname) ||
          pathname.startsWith("/verify-email")
        ) {
          setIsChecking(false);
          return;
        }

        // Get token
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        if (!token) {
          // No token, redirect to login
          router.push("/login");
          return;
        }

        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);

        // If user is not verified, redirect to verify email
        if (!user.is_verified) {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
          return;
        }

        // If user hasn't completed onboarding or is missing school_id, gender, or phone
        // Check both snake_case (standardized) and camelCase (from Prisma)
        const onboardingCompleted =
          user.onboarding_completed ?? user.onboardingCompleted;
        const schoolId = user.school_id ?? user.schoolId;
        const gender = user.gender;
        const phone = user.phone;

        const isProfileIncomplete =
          !onboardingCompleted || !schoolId || !gender || !phone;

        if (isProfileIncomplete && pathname !== "/onboarding") {
          router.push("/onboarding");
          return;
        }

        // If user has completed onboarding and is on onboarding page, redirect to dashboard
        if (!isProfileIncomplete && pathname === "/onboarding") {
          router.push("/dashboard");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [pathname]);

  if (isChecking) {
    if (pathname === "/onboarding") {
      return <OnboardingPageSkeleton />;
    }
    if (pathname.startsWith("/dashboard/profile")) {
      return <ProfilePageSkeleton />;
    }
    if (pathname.startsWith("/dashboard/bookings")) {
      return <BookingsPageSkeleton />;
    }
    if (pathname.includes("/room-types/")) {
      return <RoomDetailPageSkeleton />;
    }
    if (pathname.startsWith("/dashboard/hostels/")) {
      return <HostelDetailPageSkeleton />;
    }
    return <DashboardPageSkeleton withNavbar />;
  }

  return <>{children}</>;
}
