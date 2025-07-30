"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiX, FiCheckCircle } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetError, setResetError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const { login, forgotPassword, resetPassword } = useAuth();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  const heroTexts = [
    "Welcome Back to HostelHub",
    "Streamline Your Hostel Management",
    "Real-time Occupancy Tracking",
    "Automated Billing & Reporting"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close modal when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowResetModal(false);
      }
    };

    if (showResetModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResetModal]);

  useEffect(() => {
    // Check for reset token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    
    if (token) {
      setResetToken(token);
      setShowResetModal(true);
      setShowResetForm(true);
    }
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email, password, rememberMe);
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message.includes('verified')) {
        errorMessage = 'Please verify your email first';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Shake animation for error
      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => {
        form.classList.remove('animate-shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetStatus('loading');
      await forgotPassword(resetEmail);
      setResetStatus('success');
      setTimeout(() => {
        setResetStatus('idle');
        setShowResetModal(false);
      }, 3000);
    } catch (err: any) {
      setResetStatus('error');
      setResetError(err.message || 'Failed to send reset email');
    }
  };

  const handlePasswordReset = async () => {
    if (!resetToken) {
      setResetError('Invalid reset token');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setResetError('Password is too weak. Please use a stronger password.');
      return;
    }

    try {
      setResetStatus('loading');
      const result = await resetPassword(resetToken, newPassword);
      
      if (result.ok) {
        setResetStatus('success');
        setTimeout(() => {
          setShowResetModal(false);
          router.push('/');
        }, 3000);
      } else {
        throw new Error('Password reset failed');
      }
    } catch (err: any) {
      setResetStatus('error');
      setResetError(err.message || 'Failed to reset password');
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-r from-blue-600 to-indigo-800 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-white"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white"></div>
        </div>

        <div className="relative z-10 text-white">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">HostelHub Admin</h1>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTextIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl font-light"
              >
                {heroTexts[currentTextIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            {[
              "Centralized booking management",
              "Automated check-in/check-out",
              "Financial reporting dashboard",
              "Staff management tools"
            ].map((text, i) => (
              <div key={i} className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Sign In</h2>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-96 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="admin@hostelhub.com"
                  required
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-sm text-blue-600 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || redirecting}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition flex items-center justify-center ${
                  loading || redirecting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
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
            </div>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with</span>
            </div>
          </div>
          
          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium flex items-center justify-center hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
              </svg>
              Google
            </button>
            <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium flex items-center justify-center hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C9.5 3.5 8.5 4.85 8.5 6.5c0 .649.175 1.272.5 1.816-1.3.088-2.42.86-2.92 1.992-.5 1.15-.5 2.35 0 3.5.5 1.132 1.62 1.904 2.92 1.992.325.544.5 1.167.5 1.816 0 1.65-1 3-2.336 3.25.415.166.866.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.495-.084-.965-.238-1.4 1.272-.65 2.147-2.018 2.147-3.6zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Apple
            </button>
          </div>
          
          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a
                href="/sign-up" 
                className="text-blue-600 font-medium hover:underline focus:outline-none"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {showResetForm ? "Reset Your Password" : "Forgot Password"}
                  </h3>
                  <button 
                    onClick={() => setShowResetModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {resetStatus === 'success' ? (
                  <div className="text-center py-8">
                    <FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                    <p className="text-gray-700 mb-6">
                      {showResetForm 
                        ? "Your password has been reset successfully!" 
                        : "Password reset email sent! Check your inbox."}
                    </p>
                    <button
                      onClick={() => setShowResetModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {resetError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                        {resetError}
                      </div>
                    )}

                    {!showResetForm ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Enter your email and we'll send you a link to reset your password.
                        </p>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FiMail className="text-gray-400" />
                            </div>
                            <input
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={handleResetRequest}
                          disabled={resetStatus === 'loading'}
                          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ${
                            resetStatus === 'loading'
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {resetStatus === 'loading' ? (
                            <span className="flex items-center justify-center">
                              <FaSpinner className="animate-spin mr-3" />
                              Sending...
                            </span>
                          ) : (
                            'Send Reset Link'
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Please enter your new password below.
                        </p>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                            >
                              {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                            </button>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex items-center mb-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                  style={{ width: `${passwordStrength * 25}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500">
                                {passwordStrength < 3 ? "Weak" : passwordStrength === 3 ? "Good" : "Strong"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Use at least 8 characters with uppercase, numbers & symbols
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                          </label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <button
                          onClick={handlePasswordReset}
                          disabled={resetStatus === 'loading'}
                          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ${
                            resetStatus === 'loading'
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {resetStatus === 'loading' ? (
                            <span className="flex items-center justify-center">
                              <FaSpinner className="animate-spin mr-3" />
                              Resetting...
                            </span>
                          ) : (
                            'Reset Password'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}