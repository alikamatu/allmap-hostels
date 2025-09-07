"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const heroTexts = [
    "Streamline Your Hostel Management",
    "Fast, Efficient and Productive",
    "Designed for Administrators",
    "Simplify Your Operations"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroTexts.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== repeatPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setSuccess(true);
    } catch (err: unknown) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicators
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900 to-purple-800 p-8 md:p-12 hidden md:flex flex-col justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white opacity-10"></div>
        </div>

        <div className="relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl mb-4 font-bold">HostelHub Admin</h1>
            
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
          </motion.div>

          <div className="space-y-4">
            {[
              "Manage bookings effortlessly",
              "Track occupancy in real-time",
              "Automate billing and payments",
              "Generate insightful reports"
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center"
              >
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className='text-xl font-bold'>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {success ? (
            // Success message after registration
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="mb-6">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                Please check your email at <span className="font-semibold">{email}</span> to verify your account.
                A verification link has been sent to your inbox.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> If you don&apos;t see the email, check your spam folder or 
                  click <button className="text-blue-600 font-medium underline">here</button> to resend.
                </p>
              </div>
              <Link 
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Return to Login
              </Link>
            </motion.div>
          ) : (
            // Registration form
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Admin Account</h2>
              
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
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="admin@hostelhub.com"
                    required
                  />
                </div>
                
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Use 8 or more characters with a mix of letters, numbers & symbols
                  </p>
                  
                  {/* Password strength indicators */}
                  <div className="flex space-x-2 mt-2">
                    <div 
                      className={`h-1 flex-1 rounded-full ${
                        hasMinLength ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                    <div 
                      className={`h-1 flex-1 rounded-full ${
                        hasNumber ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                    <div 
                      className={`h-1 flex-1 rounded-full ${
                        hasSpecialChar ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  </div>
                </div>
                
                {/* Repeat Password */}
                <div>
                  <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Password
                  </label>
                  <input
                    id="repeatPassword"
                    type="password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {/* Terms */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                      I accept the <Link href="#" className="text-blue-600 hover:underline">Terms and Conditions</Link>
                    </label>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ${
                      loading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
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
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
              
              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/" 
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}