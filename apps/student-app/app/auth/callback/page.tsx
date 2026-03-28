"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store auth data
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Sync with any auth context if necessary (usually context reads from localStorage)
        
        // Redirect based on onboarding status and profile completeness
        const isProfileComplete = !!(user.onboarding_completed && user.school_id && user.gender);
        if (isProfileComplete) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login?error=auth_failed');
      }
    } else {
      router.push('/login?error=missing_params');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <FaSpinner className="animate-spin h-10 w-10 text-black mb-4" />
      <p className="text-gray-500 font-medium">Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <FaSpinner className="animate-spin h-10 w-10 text-black" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
