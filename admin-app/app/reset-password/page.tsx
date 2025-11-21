'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiHome, FiCheck, FiX } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  
  const token = searchParams.get('token') || '';
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    submit: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = {
      newPassword: '',
      confirmPassword: '',
      submit: ''
    };
    let isValid = true;

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/[A-Z]/.test(formData.newPassword) || !/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must include both uppercase and lowercase letters';
      isValid = false;
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must include at least one number';
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must include at least one special character';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, submit: '' });
    setSuccessMessage('');

    if (!validateForm()) return;
    if (!token) {
      setErrors({ ...errors, submit: 'Invalid or missing reset token' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(token, formData.newPassword);
      
      if (result?.ok) {
        setSuccessMessage('Your password has been successfully reset!');
        setTimeout(() => router.push('/'), 3000);
      } else {
        throw new Error('Failed to reset password. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          errorMessage = 'Your reset token has expired. Please request a new password reset.';
        } else if (error.message.includes('Invalid')) {
          errorMessage = 'Invalid reset token. Please request a new password reset.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({
        ...errors,
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check password requirements
  const passwordRequirements = {
    length: formData.newPassword.length >= 8,
    upperLower: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
    match: formData.newPassword && formData.newPassword === formData.confirmPassword
  };

  const getPasswordStrength = () => {
    const requirements = [passwordRequirements.length, passwordRequirements.upperLower, passwordRequirements.number, passwordRequirements.special];
    return requirements.filter(Boolean).length;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Hero Section */}
      <div className="w-full md:w-1/2 bg-[#1a1a1a] p-8 md:p-12 flex flex-col justify-between">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-[#FF6A00] mr-2"></div>
          <span className="text-white font-bold text-xl">HostelHub</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Reset Your Password
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-md">
            Create a new secure password to protect your account and continue exploring hostels worldwide.
          </p>
          
          <div className="space-y-4">
            {[
              "Secure account protection",
              "Global hostel access",
              "Instant booking capability",
              "Personalized travel experience"
            ].map((text, i) => (
              <div key={i} className="flex items-center">
                <div className="w-5 h-5 bg-[#FF6A00] mr-3 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-gray-500 text-sm">
          © 2025 HostelHub. All rights reserved.
        </div>
      </div>

      {/* Reset Password Form Section */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-[#FF6A00] flex items-center justify-center mx-auto mb-4">
              <FiLock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 border border-green-200"
            >
              <p className="text-green-800 text-sm text-center font-medium">{successMessage}</p>
              <p className="text-green-800 text-sm text-center mt-1">
                Redirecting to login page...
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200"
            >
              <p className="text-red-800 text-sm text-center font-medium">{errors.submit}</p>
            </motion.div>
          )}

          {/* Reset Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full py-3 bg-white border focus:outline-none focus:border-[#FF6A00] ${
                    errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${formData.newPassword ? 'pl-10 pr-10' : 'pl-10 pr-4'}`}
                  placeholder="Enter new password"
                  disabled={isLoading || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  disabled={isLoading || !!successMessage}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full py-3 bg-white border focus:outline-none focus:border-[#FF6A00] ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${formData.confirmPassword ? 'pl-10 pr-10' : 'pl-10 pr-4'}`}
                  placeholder="Confirm your new password"
                  disabled={isLoading || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  disabled={isLoading || !!successMessage}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Password Strength</span>
                  <span className="text-xs text-gray-500">
                    {getPasswordStrength() < 3 ? 'Weak' : getPasswordStrength() === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-1">
                  <div 
                    className={`h-1 ${getStrengthColor()}`}
                    style={{ width: `${(getPasswordStrength() / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            <div className="p-4 bg-gray-50 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Password Requirements:
              </h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.length ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center ${passwordRequirements.upperLower ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.upperLower ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                  Uppercase & lowercase letters
                </div>
                <div className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.number ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                  At least one number
                </div>
                <div className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.special ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                  One special character
                </div>
                <div className={`flex items-center ${passwordRequirements.match ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordRequirements.match ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                  Passwords match
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !!successMessage}
              whileHover={{ scale: isLoading || successMessage ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || successMessage ? 1 : 0.98 }}
              className={`w-full py-3 px-4 text-white font-medium flex items-center justify-center ${
                isLoading || successMessage
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#FF6A00] hover:bg-[#E55E00]'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-3" />
                  Resetting Password...
                </>
              ) : successMessage ? (
                'Password Reset Successful!'
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </form>

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 font-medium transition-colors"
              disabled={isLoading}
            >
              <FiHome />
              Back to Home
            </motion.button>
            
            <motion.button
              onClick={() => router.push('/auth')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 text-[#FF6A00] hover:text-[#E55E00] py-3 px-6 font-medium transition-colors"
              disabled={isLoading}
            >
              Back to Login
              <FiArrowRight />
            </motion.button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Make sure to use a strong, unique password to keep your account secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export wraps content in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Left Hero Section */}
        <div className="w-full md:w-1/2 bg-[#1a1a1a] p-8 md:p-12 flex flex-col justify-between">
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-[#FF6A00] mr-2"></div>
            <span className="text-white font-bold text-xl">HostelHub</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Reset Your Password
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-md">
              Create a new secure password to protect your account.
            </p>
          </div>
          
          <div className="text-gray-500 text-sm">
            © 2025 HostelHub. All rights reserved.
          </div>
        </div>

        {/* Loading State */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-[#FF6A00] flex items-center justify-center mx-auto mb-4">
              <FaSpinner className="h-8 w-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading...
            </h1>
            <p className="text-gray-600">
              Preparing reset password form
            </p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}