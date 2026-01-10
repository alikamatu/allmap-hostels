"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiX, FiCheckCircle, FiXCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetError, setResetError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, forgotPassword, resetPassword } = useAuth();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetToken(token);
      setShowResetModal(true);
      setShowResetForm(true);
    }
  }, []);

  useEffect(() => {
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
    } catch (err: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      if (err instanceof Error && err.message.includes('credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (err instanceof Error && err.message.includes('verified')) {
        errorMessage = 'Please verify your email first';
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
    } catch (err: unknown) {
      setResetStatus('error');
      setResetError(err instanceof Error ? err.message || 'Failed to send reset email' : 'Failed to send reset email');
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
    } catch (err: unknown) {
      setResetStatus('error');
      setResetError(err instanceof Error ? err.message || 'Failed to reset password' : 'Failed to reset password');
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-black mb-6">Hostel Portal Login</h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 p-3 mb-6 flex items-center text-black border-l-4 border-red-500"
          >
            <FiXCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label htmlFor="email" className="block text-lg font-medium text-black mb-1">
              Email
            </label>
            <div className="relative flex items-center">
              <FiMail className="h-4 w-4 text-black absolute left-3 z-10" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition relative z-0"
                placeholder="your@email.com"
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label htmlFor="password" className="block text-lg font-medium text-black mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="h-4 w-4 text-black absolute left-3 z-10" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition relative z-0"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 z-10 text-black hover:text-gray-700 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center space-x-2 text-gray-666 hover:text-black transition-colors group"
            >
              <div className={`w-4 h-4 border border-gray-400 flex items-center justify-center ${rememberMe ? 'bg-black border-black' : ''}`}>
                {rememberMe && <FiCheckCircle className="h-3 w-3 text-white" />}
              </div>
              <span>Remember me</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-gray-666 hover:text-black hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <motion.button
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={{ duration: 0.2 }}
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-4 text-white font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                loading 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Background animation for loading state */}
              {loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {/* Button content */}
              <span className={`relative z-10 flex items-center justify-center transition-all ${loading ? 'opacity-90' : 'opacity-100'}`}>
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                    <span className="font-medium">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Sign In</span>
                    <FiArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-black">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-black hover:underline font-medium transition-colors">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="w-full max-w-sm bg-white p-6 shadow-2xl border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">
                  {showResetForm ? 'Reset Your Password' : 'Forgot Password'}
                </h3>
                <button 
                  onClick={() => setShowResetModal(false)} 
                  className="text-black hover:text-gray-700 transition-colors p-1"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {resetStatus === 'success' ? (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-green-50 p-4 mb-4 flex items-center justify-center text-green-800 border border-green-200"
                  >
                    <FiCheckCircle className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {showResetForm ? 'Password reset successfully!' : 'Password reset email sent! Check your inbox.'}
                    </span>
                  </motion.div>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {resetError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-red-50 p-3 mb-4 flex items-center text-red-800 border border-red-200"
                    >
                      <FiXCircle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                      <span className="text-sm">{resetError}</span>
                    </motion.div>
                  )}

                  {!showResetForm ? (
                    <div className="space-y-4">
                      <p className="text-gray-666 text-sm">
                        Enter your email to receive a password reset link.
                      </p>
                      <div className="relative flex items-center">
                        <FiMail className="h-4 w-4 text-black absolute left-3 z-10" />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition relative z-0"
                          placeholder="your@email.com"
                        />
                      </div>
                      <motion.button
                        whileHover={resetStatus !== 'loading' ? { scale: 1.02 } : {}}
                        whileTap={resetStatus !== 'loading' ? { scale: 0.98 } : {}}
                        onClick={handleResetRequest}
                        disabled={resetStatus === 'loading'}
                        className={`w-full py-3 px-4 text-white font-medium transition-all relative overflow-hidden ${
                          resetStatus === 'loading' 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-black hover:bg-gray-800 shadow-lg'
                        }`}
                      >
                        {resetStatus === 'loading' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center">
                          {resetStatus === 'loading' ? (
                            <>
                              <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                              Sending...
                            </>
                          ) : (
                            'Send Reset Link'
                          )}
                        </span>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-666 text-sm">
                        Enter your new password below.
                      </p>
                      
                      <div>
                        <label className="block text-lg font-medium text-black mb-1">
                          New Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pr-12 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 text-black hover:text-gray-700 transition-colors p-1"
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                          >
                            {showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-black">Password Strength:</span>
                            <span className={`text-sm font-medium ${
                              passwordStrength < 3 ? 'text-red-500' : 
                              passwordStrength === 3 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {passwordStrength < 3 ? 'Weak' : passwordStrength === 3 ? 'Good' : 'Strong'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-black mb-1">
                          Confirm Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pr-12 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 text-black hover:text-gray-700 transition-colors p-1"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <motion.button
                        whileHover={resetStatus !== 'loading' ? { scale: 1.02 } : {}}
                        whileTap={resetStatus !== 'loading' ? { scale: 0.98 } : {}}
                        onClick={handlePasswordReset}
                        disabled={resetStatus === 'loading'}
                        className={`w-full py-3 px-4 text-white font-medium transition-all relative overflow-hidden ${
                          resetStatus === 'loading' 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-black hover:bg-gray-800 shadow-lg'
                        }`}
                      >
                        {resetStatus === 'loading' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center">
                          {resetStatus === 'loading' ? (
                            <>
                              <FaSpinner className="animate-spin mr-3 h-4 w-4" />
                              Resetting...
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </span>
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}