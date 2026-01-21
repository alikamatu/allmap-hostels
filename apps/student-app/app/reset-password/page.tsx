'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [passwordStrength, setPasswordStrength] = useState(0);

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
    } else if (passwordStrength < 3) {
      newErrors.newPassword = 'Password is too weak. Use 8+ characters with uppercase, lowercase, and a number.';
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

    if (name === 'newPassword') {
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value) && /[a-z]/.test(value)) strength += 1;
      if (/\d/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, submit: '' });
    setSuccessMessage('');

    if (!validateForm()) {
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => {
        form.classList.remove('animate-shake');
      }, 500);
      return;
    }
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
        throw new Error('Failed to reset password.');
      }
    } catch (error: unknown) {
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
      setErrors({ ...errors, submit: errorMessage });
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => {
        form.classList.remove('animate-shake');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-black mb-2">Reset Your Password</h1>
          <p className="text-gray-666 mb-6 text-base leading-relaxed">
            Enter your new password to access the hostel portal
          </p>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 p-3 mb-6 flex items-center justify-center text-black"
            >
              <FiCheckCircle className="h-4 w-4 mr-2 text-black" />
              {successMessage}
            </motion.div>
          )}

          {errors.submit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-100 p-3 mb-6 flex items-center justify-center text-black"
            >
              <FiXCircle className="h-4 w-4 mr-2 text-black" />
              {errors.submit}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className="block text-lg font-medium text-black mb-1">
                New Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="h-4 w-4 text-black absolute left-3" />
                <input
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition ${
                    errors.newPassword ? 'border-red-200' : ''
                  }`}
                  placeholder="Enter new password"
                  disabled={isLoading || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3"
                  disabled={isLoading || !!successMessage}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4 text-black" />
                  ) : (
                    <FiEye className="h-4 w-4 text-black" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
              <div className="mt-2 text-sm text-black">
                Password Strength: {passwordStrength < 3 ? 'Weak' : passwordStrength === 3 ? 'Good' : 'Strong'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="block text-lg font-medium text-black mb-1">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <FiLock className="h-4 w-4 text-black absolute left-3" />
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition ${
                    errors.confirmPassword ? 'border-red-200' : ''
                  }`}
                  placeholder="Confirm new password"
                  disabled={isLoading || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3"
                  disabled={isLoading || !!successMessage}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4 text-black" />
                  ) : (
                    <FiEye className="h-4 w-4 text-black" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || !!successMessage}
                className={`w-full py-3 px-4 font-medium text-white transition flex items-center justify-center ${
                  isLoading || successMessage ? 'bg-gray-999 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </motion.div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-666">
            <button
              onClick={() => router.push('/')}
              className="text-black hover:underline"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Image with Overlay */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Hostel Community"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Reset Your Password
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white max-w-md text-center"
          >
            Create a new password to securely access the hostel portal
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <FaSpinner className="animate-spin text-black h-6 w-6 mx-auto mb-4" />
          <p className="text-gray-666">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}