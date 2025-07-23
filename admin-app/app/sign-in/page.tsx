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
      {/* ...existing JSX code... */}
      {/* Place all your form and UI code here, unchanged */}
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