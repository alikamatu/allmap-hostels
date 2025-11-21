import { useState, useCallback } from 'react';
import { AuthFormData, AuthTab } from '@/types/auth';

export const useAuthForm = (initialTab: AuthTab = 'login') => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: '',
    acceptTerms: false,
    role: 'hostel_admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateFormData = useCallback((updates: Partial<AuthFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const switchTab = useCallback((tab: AuthTab) => {
    setActiveTab(tab);
    setStep(1);
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      confirmPassword: '',
      acceptTerms: false,
      role: 'hostel_admin'
    });
  }, []);

  const nextStep = useCallback(() => setStep(2), []);
  const prevStep = useCallback(() => setStep(1), []);

  const validatePassword = useCallback((password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long");
    if (!/(?=.*[a-z])/.test(password)) errors.push("Password must contain at least one lowercase letter");
    if (!/(?=.*[A-Z])/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/(?=.*\d)/.test(password)) errors.push("Password must contain at least one number");
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) errors.push("Password must contain at least one special character");
    return errors;
  }, []);

  const getPasswordStrength = useCallback((password: string) => {
    const hasNumber = /\d/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    const strengthChecks = [hasMinLength, hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar];
    return strengthChecks.filter(Boolean).length;
  }, []);

  return {
    activeTab,
    step,
    formData,
    showPassword,
    showConfirmPassword,
    error,
    loading,
    updateFormData,
    switchTab,
    nextStep,
    prevStep,
    setShowPassword,
    setShowConfirmPassword,
    setError,
    setLoading,
    validatePassword,
    getPasswordStrength
  };
};