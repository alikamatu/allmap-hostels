'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiMail, FiArrowRight, FiUserPlus } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

interface VerificationStatus {
  status: 'loading' | 'success' | 'error' | 'expired';
  message: string;
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verification, setVerification] = useState<VerificationStatus>({
    status: 'loading',
    message: 'Verifying your email...'
  });
  const [isResending, setIsResending] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  
  // Use ref to track if verification has been attempted
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerified.current) {
      return;
    }

    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // If email is in URL params, store it
    if (email) {
      setEmailInput(email);
    }

    if (status) {
      hasVerified.current = true;
      handleStatusResponse(status, message);
      return;
    }

    if (token) {
      hasVerified.current = true;
      verifyToken(token);
    } else {
      hasVerified.current = true;
      setVerification({
        status: 'error',
        message: 'No verification token provided, check your Junk/Spam folder if you can not find the email'
      });
    }
  });

  const handleStatusResponse = (status: string, message: string | null) => {
    if (status === 'success') {
      setVerification({
        status: 'success',
        message: message || 'Your email has been verified successfully! You can now log in.'
      });
    } else {
      const errorMessage = message ? decodeURIComponent(message) : 'Verification failed';
      setVerification({
        status: 'error',
        message: errorMessage
      });
    }
  };

  const verifyToken = async (token: string) => {
    try {
      console.log('Verifying token:', token);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
      const response = await fetch(`${apiUrl}/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        // Set success and don't allow any further verification attempts
        setVerification({
          status: 'success',
          message: data.message || 'Your email has been verified successfully!',
        });
        
        // Optional: Redirect to login after a delay
        setTimeout(() => {
          router.push('/?verified=true');
        }, 3000);
      } else {
        const errorMessage = data.message || 'Verification failed';
        const isExpired = errorMessage.toLowerCase().includes('expired');

        console.log('Error message:', errorMessage);
        console.log('Is expired:', isExpired);

        setVerification({
          status: isExpired ? 'expired' : 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerification({
        status: 'error',
        message: 'Could not connect to the server. Please try again later.',
      });
    }
  };

  const handleResendEmail = async (email?: string) => {
    const emailToUse = email || emailInput || searchParams.get('email');
    
    if (!emailToUse) {
      setShowEmailInput(true);
      return;
    }

    setIsResending(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUse }),
      });

      if (response.ok) {
        setShowResendSuccess(true);
        setShowEmailInput(false);
        setTimeout(() => setShowResendSuccess(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send email');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      setVerification({
        status: 'error',
        message: errorMessage
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      handleResendEmail(emailInput.trim());
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Verification Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-black mb-2">Email Verification</h2>
          <p className="text-gray-666 mb-6 text-base leading-relaxed">
            Confirm your email to access the hostel portal
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 p-3 mb-6 flex items-center text-black"
          >
            {verification.status === 'loading' && (
              <>
                <FaSpinner className="animate-spin h-4 w-4 mr-2 text-black" />
                {verification.message}
              </>
            )}
            {verification.status === 'success' && (
              <>
                <FiCheckCircle className="h-4 w-4 mr-2 text-black" />
                {verification.message}
              </>
            )}
            {verification.status === 'error' && (
              <>
                <FiXCircle className="h-4 w-4 mr-2 text-black" />
                {verification.message}
              </>
            )}
          </motion.div>

          <AnimatePresence>
            {showResendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-green-50 border border-green-200 p-3 mb-6 flex items-center text-green-800"
              >
                <FiCheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Verification email sent successfully! Check your inbox.
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showEmailInput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isResending || !emailInput.trim()}
                      className={`flex-1 py-2 px-4 font-medium transition flex items-center justify-center gap-2 ${
                        isResending || !emailInput.trim()
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {isResending ? (
                        <>
                          <FaSpinner className="animate-spin h-4 w-4" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiMail className="h-4 w-4" />
                          Send Email
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailInput(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {verification.status === 'success' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="w-full bg-black text-white py-3 px-6 font-medium transition hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                Go to Login <FiArrowRight />
              </motion.button>
            )}

            {verification.status === 'error' && (
              <>
                {!showEmailInput && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleResendEmail()}
                    disabled={isResending}
                    className={`w-full py-3 px-6 font-medium transition flex items-center justify-center gap-2 ${
                      isResending ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {isResending ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiMail className="h-4 w-4" />
                        Resend Verification
                      </>
                    )}
                  </motion.button>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/sign-up')}
                  className="w-full bg-white text-black py-3 px-6 font-medium transition hover:bg-gray-100 border border-gray-300 flex items-center justify-center gap-2"
                >
                  <FiUserPlus className="h-4 w-4" />
                  Back to Registration
                </motion.button>
              </>
            )}
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
            Verify Your Email
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white max-w-md text-center"
          >
            Complete your registration to access the hostel portal
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <FaSpinner className="animate-spin text-black h-6 w-6 mx-auto mb-4" />
          <p className="text-gray-666">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}