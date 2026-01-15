// SignupForm.tsx - Add this after the password fields in renderStep2()
"use client";

import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { InputField } from '@/components/ui/InputField';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
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
  onSubmit
}) => {
  const renderStep1 = () => (
    <>
      <InputField
        label="Full Name"
        type="text"
        icon="user"
        value={formData.name || ''}
        onChange={(e) => onFormDataChange({ name: e.target.value })}
        placeholder="John Doe"
        required
      />
      
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
        label="Phone Number"
        type="tel"
        icon="phone"
        maxLength={10}
        value={formData.phone || ''}
        onChange={(e) => onFormDataChange({ phone: e.target.value })}
        placeholder="+1 (555) 123-4567"
      />

      <button
        type="submit"
        className="w-full py-3 px-4 bg-[#FF6A00] text-white font-medium hover:bg-[#E55E00] flex items-center justify-center"
      >
        Continue <FiArrowRight className="ml-2" />
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
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
      />
      <PasswordStrength password={formData.password} />
      
      <InputField
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        icon="lock"
        showPasswordToggle
        onTogglePassword={() => onShowConfirmPasswordChange(!showConfirmPassword)}
        value={formData.confirmPassword || ''}
        onChange={(e) => onFormDataChange({ confirmPassword: e.target.value })}
        placeholder="••••••••"
        required
        error={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : undefined}
      />

      {/* Terms and Conditions Checkbox */}
      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="acceptTerms"
          checked={formData.acceptTerms || false}
          onChange={(e) => onFormDataChange({ acceptTerms: e.target.checked })}
          className="mt-1 rounded border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
          required
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-700">
          I agree to the{' '}
          <a 
            href="/terms" 
            target="_blank" 
            className="text-[#FF6A00] hover:underline font-medium"
          >
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a 
            href="/privacy" 
            target="_blank" 
            className="text-[#FF6A00] hover:underline font-medium"
          >
            Privacy Policy
          </a>
        </label>
      </div>

      {formData.role === 'student' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Student Account:</strong> You will need to complete your profile setup after verification, including school information and emergency contacts.
          </p>
        </div>
      )}
      
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => onStepChange(1)}
          className="w-1/3 py-3 px-4 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !formData.acceptTerms}
          className={`flex-1 py-3 px-4 text-white font-medium flex items-center justify-center ${
            loading || !formData.acceptTerms
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#FF6A00] hover:bg-[#E55E00]'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-3" />
              {formData.role === 'student' ? 'Creating Student Account...' : 'Creating Account...'}
            </>
          ) : (
            formData.role === 'student' ? 'Create Student Account' : 'Create Account'
          )}
        </button>
      </div>
    </>
  );

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {step === 1 ? 'Create Your Account' : 'Set Your Password'}
      </h2>
      <p className="text-gray-600 mb-6">
        {step === 1 
          ? 'Join thousands of travelers worldwide' 
          : 'Create a secure password for your account'
        }
      </p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {step === 1 ? renderStep1() : renderStep2()}
    </motion.form>
  );
};