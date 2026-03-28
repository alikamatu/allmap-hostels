"use client";

import { useState, useCallback } from 'react';
import { School, OnboardingData } from '@repo/types';

export const useOnboarding = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [error, setError] = useState('');

  const fetchSchools = useCallback(async (search = '') => {
    try {
      setLoadingSchools(true);
      setError('');
      
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}/schools?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schools: ${response.status}`);
      }
      
      const data = await response.json();
      setSchools(data);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoadingSchools(false);
    }
  }, []);

  const fetchOnboardingStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      const profile = await response.json();
      
      const data: Partial<OnboardingData> = {
        name: profile.name,
        phone: profile.phone,
        gender: profile.gender,
        school_id: profile.school_id,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        emergency_contact_relationship: profile.emergency_contact_relationship,
        emergency_contact_email: profile.emergency_contact_email,
        last_onboarding_step: profile.last_onboarding_step,
      };
      
      setOnboardingData(data);
      return profile;
    } catch (err) {
      console.error('Error fetching onboarding status:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitOnboarding = useCallback(async (data: Partial<OnboardingData>) => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update onboarding');
      }

      const updatedProfile = await response.json();

      // Update local storage with full updated profile
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserData = { ...userData, ...updatedProfile };
      localStorage.setItem('user', JSON.stringify(newUserData));

      setOnboardingData(prev => ({ ...prev, ...data }));
      return true;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    schools,
    isLoading,
    loadingSchools,
    onboardingData,
    error,
    setError,
    fetchSchools,
    fetchOnboardingStatus,
    submitOnboarding,
  };
};