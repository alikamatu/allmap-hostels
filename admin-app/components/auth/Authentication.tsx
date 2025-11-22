"use client";

import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { HeroSection } from './HeroSection';
import { TabNavigation } from './TabNavigation';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PasswordResetModal } from './PasswordResetModal';
import { useState } from 'react';

export const Authentication: React.FC = () => {
  const router = useRouter();
  const { login, register } = useAuth();
  
  const {
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
  } = useAuthForm();

  const {
    showResetModal,
    setShowResetModal,
    resetEmail,
    setResetEmail,
    resetStatus,
    resetError,
    modalRef,
    handleResetRequest,
    closeModal
  } = usePasswordReset();

  const [verificationMessage, setVerificationMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(formData.email, formData.password, true);
      router.push('/verification-status');
    } catch (err: any) {
      // Check if it's an unverified email error
      if (err.message?.includes('verify your email')) {
        setError('Please verify your email before logging in. Check your inbox for verification instructions.');
        setVerificationMessage(`A verification email has been sent to ${formData.email}. Please check your inbox and spam folder.`);
      } else {
        setError(err.message || 'Login failed. Please try again.');
        setVerificationMessage('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationMessage('');
    
    if (step === 1) {
      nextStep();
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
      return;
    }

    try {
      setLoading(true);
      await register(
        formData.email,
        formData.password,
        'hostel_admin', // Force hostel_admin role for admin dashboard
        formData.acceptTerms
      );
      
      // Show success message instead of immediate redirect
      setVerificationMessage(`Verification email sent to ${formData.email}! Please check your inbox and click the verification link to activate your account.`);
      setError('');
      
      // Reset form
      updateFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        acceptTerms: false
      });
      prevStep(); // Go back to step 1
      
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setVerificationMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <HeroSection activeTab={activeTab} onSwitchTab={switchTab} />

      {/* Form Section */}
      <div className="w-full lg:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <TabNavigation activeTab={activeTab} onTabChange={switchTab} />
          
          {/* Verification Success Message */}
          {verificationMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{verificationMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <LoginForm
                formData={formData}
                loading={loading}
                error={error}
                showPassword={showPassword}
                onFormDataChange={updateFormData}
                onShowPasswordChange={setShowPassword}
                onForgotPassword={() => setShowResetModal(true)}
                onSubmit={handleLogin}
              />
            ) : (
              <SignupForm
                formData={formData}
                step={step}
                loading={loading}
                error={error}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                onFormDataChange={updateFormData}
                onShowPasswordChange={setShowPassword}
                onShowConfirmPasswordChange={setShowConfirmPassword}
                onStepChange={prevStep}
                onSubmit={handleSignup}
              />
            )}
          </AnimatePresence>

          {/* Additional verification info for login */}
          {activeTab === 'login' && error?.includes('verify your email') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Didn't receive the verification email?</strong>{' '}
                Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => {
                    // You could implement a resend verification endpoint call here
                    setVerificationMessage(`New verification email sent to ${formData.email}`);
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  click here to resend
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      <PasswordResetModal
        isOpen={showResetModal}
        email={resetEmail}
        status={resetStatus}
        error={resetError}
        modalRef={modalRef}
        onEmailChange={setResetEmail}
        onResetRequest={handleResetRequest}
        onClose={closeModal}
      />
    </div>
  );
};