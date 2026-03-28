"use client";

import OnboardingGuard from "@/_components/auth/OnboardingGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
