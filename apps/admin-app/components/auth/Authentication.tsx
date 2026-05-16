"use client";

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { HeroSection } from './HeroSection';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PasswordResetModal } from './PasswordResetModal';
import { AuthTab } from '@/types/auth';

export const Authentication: React.FC = () => {
  const { login, loginWithGoogle, register } = useAuth();

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
    closeModal,
  } = usePasswordReset();

  const [rememberMe, setRememberMe] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = useCallback(
    (tab: AuthTab) => {
      switchTab(tab);
      setSuccessMessage('');
      setError('');
    },
    [switchTab, setError],
  );

  // ─── Google ───────────────────────────────────────────────────────────────

  const handleGoogleSuccess = useCallback(
    async (credential: string) => {
      setError('');
      setLoading(true);
      try {
        await loginWithGoogle(credential, rememberMe);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, rememberMe, setError, setLoading],
  );

  const handleGoogleError = useCallback(
    (msg: string) => setError(msg),
    [setError],
  );

  // ─── Email login ──────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password, rememberMe);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.toLowerCase().includes('verify your email')) {
        setSuccessMessage(
          `A verification link has been sent to ${formData.email}. Check your inbox.`,
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Email signup ─────────────────────────────────────────────────────────

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (step === 1) {
      if (!formData.name?.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      nextStep();
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors[0]);
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

    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        'hostel_admin',
        formData.acceptTerms!,
        formData.name,
        formData.phone,
      );
      setSuccessMessage(
        `Account created. We sent a verification link to ${formData.email} — click it to activate your account.`,
      );
      updateFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        acceptTerms: false,
      });
      prevStep();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left hero panel (desktop only) ── */}
      <HeroSection activeTab={activeTab} onSwitchTab={handleTabChange} />

      {/* ── Right / full-width form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* ── Mobile brand header ── */}
        <div className="lg:hidden relative w-full h-44 sm:h-52 overflow-hidden flex-shrink-0">
          <Image
            src="/assets/23169.jpg"
            alt="Hostel"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Dark gradient */}
          <div className="absolute inset-0" />

          <div className="absolute inset-0 flex flex-col justify-between p-5">
            {/* Logo row */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6A00] rounded-xl flex items-center justify-center">
                <Image src="/logo/logo.png" width={16} height={16} alt="Logo" className="object-contain" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                AllmapHostels
              </span>
              <span className="text-[9px] text-[#FF6A00] font-bold bg-black/40 border border-[#FF6A00]/40 rounded px-1.5 py-0.5 uppercase tracking-widest">
                Admin
              </span>
            </div>

            {/* Tagline */}
            <p className="text-white/80 text-sm font-medium">
              Your hostel management dashboard
            </p>
          </div>
        </div>

        {/* ── Form area ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
          <div className="w-full max-w-[400px]">

            {/* Tab switcher */}
            <div className="flex mb-7 p-1 bg-gray-100 rounded-xl">
              {(['login', 'signup'] as AuthTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={[
                    'flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700',
                  ].join(' ')}
                >
                  {tab === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Banners */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <LoginForm
                  key="login"
                  formData={formData}
                  loading={loading}
                  error={error}
                  showPassword={showPassword}
                  rememberMe={rememberMe}
                  onFormDataChange={updateFormData}
                  onShowPasswordChange={setShowPassword}
                  onRememberMeChange={setRememberMe}
                  onForgotPassword={() => setShowResetModal(true)}
                  onGoogleSuccess={handleGoogleSuccess}
                  onGoogleError={handleGoogleError}
                  onSubmit={handleLogin}
                />
              ) : (
                <SignupForm
                  key="signup"
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
                  onGoogleSuccess={handleGoogleSuccess}
                  onGoogleError={handleGoogleError}
                  onSubmit={handleSignup}
                />
              )}
            </AnimatePresence>

            {/* Footer link */}
            <p className="mt-7 text-center text-sm text-gray-500">
              {activeTab === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="text-[#FF6A00] font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-[#FF6A00] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="lg:hidden text-center pb-5 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} AllmapHostels. All rights reserved.
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
