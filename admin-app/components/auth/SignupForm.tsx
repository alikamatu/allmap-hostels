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
          disabled={loading}
          className={`flex-1 py-3 px-4 text-white font-medium flex items-center justify-center ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#FF6A00] hover:bg-[#E55E00]'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-3" />
              Creating Account...
            </>
          ) : (
            'Create Account'
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
        {step === 1 ? 'Join thousands of travelers worldwide' : 'Create a secure password for your account'}
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3">
          {error}
        </div>
      )}
      
      {step === 1 ? renderStep1() : renderStep2()}
    </motion.form>
  );
};