"use client";

import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { InputField } from '@/components/ui/InputField';
import { AuthFormData } from '@/types/auth';

interface LoginFormProps {
  formData: AuthFormData;
  loading: boolean;
  error: string;
  showPassword: boolean;
  onFormDataChange: (updates: Partial<AuthFormData>) => void;
  onShowPasswordChange: (show: boolean) => void;
  onForgotPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  loading,
  error,
  showPassword,
  onFormDataChange,
  onShowPasswordChange,
  onForgotPassword,
  onSubmit
}) => {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Your Account</h2>
      <p className="text-gray-600 mb-6">Enter your credentials to access your bookings</p>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3">
          {error}
        </div>
      )}
      
      <InputField
        label="Email Address"
        type="email"
        icon="mail"
        value={formData.email}
        onChange={(e) => onFormDataChange({ email: e.target.value })}
        placeholder="your@email.com"
        required
      />
      
      <InputField
        label="Password"
        type={showPassword ? "text" : "password"}
        icon="lock"
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
            className="text-sm text-[#FF6A00] hover:underline"
          >
            Forgot password?
          </button>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 text-white font-medium flex items-center justify-center ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#FF6A00] hover:bg-[#E55E00]'
        }`}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin mr-3" />
            Signing in...
          </>
        ) : (
          <>
            Sign In <FiArrowRight className="ml-2" />
          </>
        )}
      </button>
    </motion.form>
  );
};