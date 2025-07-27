'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Move all logic into a separate component
function LoginPageContent() {
  const { login, forgotPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'verified') {
      setLoginMessage('Your email has been verified! You can now log in.');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password && !forgotPasswordMode) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6 && !forgotPasswordMode) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage('');

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (err: unknown) {
      if ((err as Error).message.includes('401')) {
        setErrors({ submit: 'Invalid email or password' });
      } else if ((err as Error).message.includes('403')) {
        setErrors({ submit: 'Please verify your email before logging in' });
      } else {
        setErrors({ submit: (err as Error).message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    
    if (!forgotPasswordEmail || !/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(forgotPasswordEmail);
      setForgotPasswordMessage(`Password reset instructions sent to ${forgotPasswordEmail}`);
    } catch (err: unknown) {
      setErrors({ submit: (err as Error).message || 'Failed to send reset instructions' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLFormElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      if (forgotPasswordMode) {
        handleForgotPasswordSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      } else {
        handleLoginSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  const toggleForgotPasswordMode = () => {
    setForgotPasswordMode(!forgotPasswordMode);
    setErrors({});
    setLoginMessage('');
    setForgotPasswordMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"></div>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {forgotPasswordMode ? 'Forgot Password' : 'Sign In'}
        </h2>
        {loginMessage && (
          <div className="mb-4 text-green-600 text-center">{loginMessage}</div>
        )}
        {forgotPasswordMessage && (
          <div className="mb-4 text-green-600 text-center">{forgotPasswordMessage}</div>
        )}
        <form
          onSubmit={forgotPasswordMode ? handleForgotPasswordSubmit : handleLoginSubmit}
          onKeyPress={handleKeyPress}
          className="space-y-6"
          autoComplete="off"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={forgotPasswordMode ? forgotPasswordEmail : formData.email}
              onChange={forgotPasswordMode
                ? (e) => {
                    setForgotPasswordEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }
                : handleInputChange('email')
              }
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              disabled={isLoading}
              autoFocus
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          {!forgotPasswordMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
          )}
          {!forgotPasswordMode && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange('rememberMe')}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          )}
          {errors.submit && (
            <div className="mb-2 text-center text-red-600 text-sm">{errors.submit}</div>
          )}
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading
              ? forgotPasswordMode
                ? 'Sending...'
                : 'Signing in...'
              : forgotPasswordMode
              ? 'Send Reset Link'
              : 'Sign In'}
          </button>
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:underline"
              onClick={toggleForgotPasswordMode}
              disabled={isLoading}
            >
              {forgotPasswordMode ? 'Back to Sign In' : 'Forgot password?'}
            </button>
            {!forgotPasswordMode && (
              <button
                type="button"
                className="text-sm text-gray-600 hover:underline"
                onClick={handleSignUp}
                disabled={isLoading}
              >
                Sign Up
              </button>
            )}
          </div>
        </form>
      </div>
  );
}

// Default export: wrap content in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="loader">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}