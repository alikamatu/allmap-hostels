import { useState, useCallback } from 'react';
import { School, OnboardingData } from '@/types/onboarding';

export const useOnboarding = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
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

  const submitOnboarding = useCallback(async (data: OnboardingData) => {
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
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

        //add school id to user data in  local storage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.school_id = data.school_id;
        localStorage.setItem('user', JSON.stringify(userData));

        //add onboarding completed to user data in  local storage
        userData.onboarding_completed = true;
        localStorage.setItem('user', JSON.stringify(userData));

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
    error,
    setError,
    fetchSchools,
    submitOnboarding,
  };
};