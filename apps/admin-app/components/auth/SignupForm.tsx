"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { InputField } from '@/components/ui/InputField';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { AuthFormData } from '@/types/auth';

interface SignupFormProps {
  formData: AuthFormData;
  step: number;
  loading: boolean;
  error: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onFormDataChange: (updates: Partial<AuthFormData>) => void;
  onShowPasswordChange: (show: boolean) => void;
  onShowConfirmPasswordChange: (show: boolean) => void;
  onStepChange: (step: number) => void;
  onGoogleSuccess: (credential: string) => Promise<void>;
  onGoogleError: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  formData,
  step,
  loading,
  error,
  showPassword,
  showConfirmPassword,
  onFormDataChange,
  onShowPasswordChange,
  onShowConfirmPasswordChange,
  onStepChange,
  onGoogleSuccess,
  onGoogleError,
  onSubmit,
}) => {
  const passwordsMatch =
    !!formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      {/* Header */}
      <div className="mb-6">
        {step === 2 && (
          <button
            type="button"
            onClick={() => onStepChange(1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}

        {/* Step bar */}
        <div className="flex gap-1.5 mb-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={[
                'h-[3px] rounded-full transition-all duration-300',
                s === step ? 'flex-1 bg-[#FF6A00]' : 'w-8 bg-gray-200',
              ].join(' ')}
            />
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {step === 1 ? 'Create your account' : 'Secure your account'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {step === 1
            ? 'Step 1 of 2 — Your basic information'
            : 'Step 2 of 2 — Set a strong password'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.18 }}
            onSubmit={onSubmit}
            noValidate
          >
            {/* Google on step 1 */}
            <div className="mb-4">
              <GoogleAuthButton
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                disabled={loading}
                label="Sign up with Google"
              />
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            <InputField
              label="Full name"
              type="text"
              icon="user"
              name="name"
              autoComplete="name"
              value={formData.name || ''}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="John Doe"
              required
            />

            <InputField
              label="Email address"
              type="email"
              icon="mail"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ email: e.target.value })}
              placeholder="you@example.com"
              required
            />

            <InputField
              label="Phone number"
              type="tel"
              icon="phone"
              name="phone"
              autoComplete="tel"
              maxLength={15}
              value={formData.phone || ''}
              onChange={(e) => onFormDataChange({ phone: e.target.value })}
              placeholder="0XX XXX XXXX"
              hint="Used for account recovery only"
            />

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#FF6A00] hover:bg-[#E55E00] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.18 }}
            onSubmit={onSubmit}
            noValidate
          >
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              name="password"
              autoComplete="new-password"
              showPasswordToggle
              onTogglePassword={() => onShowPasswordChange(!showPassword)}
              value={formData.password}
              onChange={(e) => onFormDataChange({ password: e.target.value })}
              placeholder="Min. 8 characters"
              required
            />
            {formData.password && (
              <div className="-mt-3 mb-5">
                <PasswordStrength password={formData.password} />
              </div>
            )}

            <InputField
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              icon="lock"
              name="confirmPassword"
              autoComplete="new-password"
              showPasswordToggle
              onTogglePassword={() =>
                onShowConfirmPasswordChange(!showConfirmPassword)
              }
              value={formData.confirmPassword || ''}
              onChange={(e) =>
                onFormDataChange({ confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              required
              error={
                formData.confirmPassword && !passwordsMatch
                  ? 'Passwords do not match'
                  : undefined
              }
            />

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-5">
              <button
                type="button"
                role="checkbox"
                aria-checked={formData.acceptTerms ?? false}
                onClick={() =>
                  onFormDataChange({ acceptTerms: !formData.acceptTerms })
                }
                className={[
                  'mt-0.5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors',
                  formData.acceptTerms
                    ? 'bg-[#FF6A00] border-[#FF6A00]'
                    : 'bg-white border-gray-300 hover:border-gray-400',
                ].join(' ')}
                style={{ width: 18, height: 18 }}
              >
                {formData.acceptTerms && (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                )}
              </button>
              <p className="text-sm text-gray-600 leading-relaxed">
                I agree to AllmapHostels&apos;{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6A00] hover:underline font-medium"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6A00] hover:underline font-medium"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.acceptTerms}
              className={[
                'w-full h-11 rounded-lg text-sm font-semibold',
                'flex items-center justify-center gap-2 transition-all',
                loading || !formData.acceptTerms
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#FF6A00] hover:bg-[#E55E00] active:scale-[0.98] text-white',
              ].join(' ')}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
