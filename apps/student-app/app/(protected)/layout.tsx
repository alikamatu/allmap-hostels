"use client";

import OnboardingGuard from "../sign-up/OnboardingGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
