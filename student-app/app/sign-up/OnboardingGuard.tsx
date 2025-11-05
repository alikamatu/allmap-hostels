"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
        const publicRoutes = ['/', '/sign-up', '/verify-email', '/reset-password', '/forgot-password'];
        if (publicRoutes.includes(pathname) || pathname.startsWith('/verify-email')) {
          setIsChecking(false);
          return;
        }

        // Get token
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        
        if (!token) {
          // No token, redirect to login
          router.push('/');
          return;
        }

        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/');
          return;
        }

        const user = JSON.parse(userStr);

        // If user is not verified, redirect to verify email
        if (!user.is_verified) {
          router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
          return;
        }

        // If user hasn't completed onboarding and not on onboarding page
        if (!user.onboarding_completed && pathname !== '/onboarding') {
          router.push('/onboarding');
          return;
        }

        // If user has completed onboarding and is on onboarding page, redirect to dashboard
        if (user.onboarding_completed && pathname === '/onboarding') {
          router.push('/dashboard');
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}