import { useState, useEffect } from 'react';
import { useOnboarding } from './useOnboarding';

export const useSchoolSearch = () => {
  const { schools, loadingSchools, error, fetchSchools } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSchools(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchSchools]);

  return {
    schools,
    loadingSchools,
    error,
    searchQuery,
    setSearchQuery,
  };
};