"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';
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
            className="bg-gray-100 p-3 mb-6 flex items-center text-black"
          >
            <FiXCircle className="h-4 w-4 mr-2 text-black" />
            {error}
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
              <FiMail className="h-4 w-4 text-black absolute left-3" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
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
              <FiLock className="h-4 w-4 text-black absolute left-3" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </motion.div>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="text-gray-666 hover:underline"
            >
              {rememberMe ? 'Remember me' : 'Don’t remember me'}
            </button>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-gray-666 hover:underline"
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
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-medium transition flex items-center justify-center ${
                loading ? 'bg-gray-999 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
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
            </motion.button>
          </motion.div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-666">
            Don’t have an account?{' '}
            <Link href="/sign-up" className="text-black hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm bg-white p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">
                  {showResetForm ? 'Reset Your Password' : 'Forgot Password'}
                </h3>
                <button onClick={() => setShowResetModal(false)} className="text-black">
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {resetStatus === 'success' ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-100 p-3 mb-6 flex items-center justify-center text-black"
                  >
                    <FiCheckCircle className="h-4 w-4 mr-2 text-black" />
                    {showResetForm ? 'Password reset successfully!' : 'Password reset email sent! Check your inbox.'}
                  </motion.div>
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition"
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
                      className="bg-gray-100 p-3 mb-6 flex items-center text-black"
                    >
                      <FiXCircle className="h-4 w-4 mr-2 text-black" />
                      {resetError}
                    </motion.div>
                  )}

                  {!showResetForm ? (
                    <div className="space-y-4">
                      <p className="text-gray-666 text-sm">
                        Enter your email to receive a password reset link.
                      </p>
                      <div className="relative flex items-center">
                        <FiMail className="h-4 w-4 text-black absolute left-3" />
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                          placeholder="your@email.com"
                        />
                      </div>
                      <button
                        onClick={handleResetRequest}
                        disabled={resetStatus === 'loading'}
                        className={`w-full py-3 px-4 text-white font-medium transition ${
                          resetStatus === 'loading' ? 'bg-gray-999 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
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
                      <p className="text-gray-666 text-sm">
                        Enter your new password below.
                      </p>
                      <div>
                        <label className="block text-lg font-medium text-black mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                          placeholder="••••••••"
                        />
                        <div className="mt-2 text-sm text-black">
                          Password Strength: {passwordStrength < 3 ? 'Weak' : passwordStrength === 3 ? 'Good' : 'Strong'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-black mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pr-4 py-3 text-base text-black bg-white border-b border-gray-200 focus:border-black outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                      <button
                        onClick={handlePasswordReset}
                        disabled={resetStatus === 'loading'}
                        className={`w-full py-3 px-4 text-white font-medium transition ${
                          resetStatus === 'loading' ? 'bg-gray-999 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
                      }