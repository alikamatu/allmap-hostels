"use client";

import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Check } from 'lucide-react';
import { InputField } from '@/components/ui/InputField';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { AuthFormData } from '@/types/auth';

interface LoginFormProps {
  formData: AuthFormData;
  loading: boolean;
  error: string;
  showPassword: boolean;
  rememberMe: boolean;
  onFormDataChange: (updates: Partial<AuthFormData>) => void;
  onShowPasswordChange: (show: boolean) => void;
  onRememberMeChange: (v: boolean) => void;
  onForgotPassword: () => void;
  onGoogleSuccess: (credential: string) => Promise<void>;
  onGoogleError: (error: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  loading,
  error,
  showPassword,
  rememberMe,
  onFormDataChange,
  onShowPasswordChange,
  onRememberMeChange,
  onForgotPassword,
  onGoogleSuccess,
  onGoogleError,
  onSubmit,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Access your hostel admin dashboard
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Google */}
      <div className="mb-4">
        <GoogleAuthButton
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          disabled={loading}
        />
      </div>

      {/* Divider */}
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

      <form onSubmit={onSubmit} noValidate>
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
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon="lock"
          name="password"
          autoComplete="current-password"
          showPasswordToggle
          onTogglePassword={() => onShowPasswordChange(!showPassword)}
          value={formData.password}
          onChange={(e) => onFormDataChange({ password: e.target.value })}
          placeholder="••••••••"
          required
          extraElement={
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#FF6A00] hover:text-[#E55E00] font-medium transition-colors text-sm"
            >
              Forgot password?
            </button>
          }
        />

        {/* Remember me */}
        <div className="flex items-center gap-2.5 mb-5 -mt-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => onRememberMeChange(!rememberMe)}
            className={[
              'flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]/40',
              rememberMe
                ? 'bg-[#FF6A00] border-[#FF6A00]'
                : 'bg-white border-gray-300 hover:border-gray-400',
            ].join(' ')}
            style={{ width: 18, height: 18 }}
          >
            {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>
          <span
            className="text-sm text-gray-600 cursor-pointer select-none"
            onClick={() => onRememberMeChange(!rememberMe)}
          >
            Remember me for 30 days
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={[
            'w-full h-11 rounded-lg text-sm font-semibold',
            'flex items-center justify-center gap-2 transition-all',
            loading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#FF6A00] hover:bg-[#E55E00] active:scale-[0.98] text-white',
          ].join(' ')}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
