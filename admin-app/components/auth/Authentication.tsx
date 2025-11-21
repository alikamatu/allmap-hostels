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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(formData.email, formData.password, true);
      router.push('/verification-status');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
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
        formData.role || 'hostel_admin',
        formData.acceptTerms || false
      );
      router.push('/verification-status');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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