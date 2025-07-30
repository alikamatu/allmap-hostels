'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Move all page logic into a separate component
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
    // Call resetPassword and wait for the response
    const result = await resetPassword(token, formData.newPassword);
    
    // Check for success in the response data
    if (result?.success) {
      setSuccessMessage('Your password has been successfully reset!');
      setTimeout(() => router.push('/'), 3000);
    } else {
      // Handle backend error message if available
      const errorMsg = result?.message || 'Failed to reset password. Please try again.';
      throw new Error(errorMsg);
    }
  } catch (error: unknown) {
    console.error('Password reset error:', error);
    
    // Handle specific error cases
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
    match: formData.newPassword && formData.newPassword === formData.confirmPassword
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm text-center">{successMessage}</p>
              <p className="text-green-800 text-sm text-center mt-1">
                Redirecting to login page...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center">{errors.submit}</p>
            </div>
          )}

          {/* Password Reset Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password (min 8 characters)"
                  disabled={isLoading || !!successMessage}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading || !!successMessage}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
                disabled={isLoading || !!successMessage}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Password Requirements:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : ''}`}>
                  {passwordRequirements.length ? '✓' : '•'} At least 8 characters
                </li>
                <li className={`flex items-center ${passwordRequirements.upperLower ? 'text-green-600' : ''}`}>
                  {passwordRequirements.upperLower ? '✓' : '•'} Include uppercase and lowercase letters
                </li>
                <li className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : ''}`}>
                  {passwordRequirements.number ? '✓' : '•'} Include at least one number
                </li>
                <li className={`flex items-center ${passwordRequirements.match ? 'text-green-600' : ''}`}>
                  {passwordRequirements.match ? '✓' : '•'} Passwords match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoading || successMessage
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 hover:shadow-lg'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Resetting...
                </div>
              ) : successMessage ? (
                'Password Reset Successful!'
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Make sure to use a strong password and keep it secure
          </p>
        </div>
      </div>
    </div>
  );
}

// Default export wraps content in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="loader">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}