'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiMail, FiArrowRight, FiUserPlus, FiHome } from 'react-icons/fi';
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

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const token = searchParams.get('token');

    if (status) {
      handleStatusResponse(status, message);
      return;
    }

    if (token) {
      verifyToken(token);
    } else {
      setVerification({
        status: 'error',
        message: 'No verification token provided.'
      });
    }
  }, [searchParams]);

  const handleStatusResponse = (status: string, message: string | null) => {
    if (status === 'success') {
      setVerification({
        status: 'success',
        message: message || 'Your email has been verified successfully! You can now log in.'
      });
    } else if (status === 'error') {
      const errorMessage = message ? decodeURIComponent(message) : 'Verification failed';
      const isExpired = errorMessage.toLowerCase().includes('expired');
      
      setVerification({
        status: isExpired ? 'expired' : 'error',
        message: errorMessage
      });
    }
  };

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setVerification({
          status: 'success',
          message: 'Your email has been verified successfully!'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Verification failed';
        const isExpired = errorMessage.toLowerCase().includes('expired');
        
        setVerification({
          status: isExpired ? 'expired' : 'error',
          message: errorMessage
        });
      }
    } catch {
      setVerification({
        status: 'error',
        message: 'Could not connect to the server. Please try again later.'
      });
    }
  };

  const handleResendEmail = async () => {
    const email = searchParams.get('email') || prompt('Please enter your email address:');
    if (!email) return;

    setIsResending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setShowResendSuccess(true);
        setTimeout(() => setShowResendSuccess(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send email');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      setVerification({
        ...verification,
        message: errorMessage
      });
    } finally {
      setIsResending(false);
    }
  };

  const StatusIcon = () => {
    const iconSize = 64;
    const iconColor = getStatusColor();

    switch (verification.status) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="p-4 bg-green-50"
          >
            <FiCheckCircle size={iconSize} color={iconColor} />
          </motion.div>
        );
      case 'error':
      case 'expired':
        return (
          <motion.div
            initial={{ rotate: 20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: 'spring' }}
            className="p-4 bg-red-50"
          >
            <FiXCircle size={iconSize} color={iconColor} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="p-4 bg-blue-50"
          >
            <FaSpinner size={iconSize} color={iconColor} />
          </motion.div>
        );
    }
  };

  const getStatusColor = () => {
    switch (verification.status) {
      case 'success':
        return '#10B981'; // green-500
      case 'error':
      case 'expired':
        return '#EF4444'; // red-500
      default:
        return '#3B82F6'; // blue-500
    }
  };

  const getStatusBackground = () => {
    switch (verification.status) {
      case 'success':
        return 'bg-green-50';
      case 'error':
      case 'expired':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getStatusTextColor = () => {
    switch (verification.status) {
      case 'success':
        return 'text-green-700';
      case 'error':
      case 'expired':
        return 'text-red-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white border border-gray-200 overflow-hidden">
        {/* Left Hero Section */}
        <div className="w-full md:w-1/2 bg-[#1a1a1a] p-8 md:p-12 flex flex-col justify-between">
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-[#FF6A00] mr-2"></div>
            <span className="text-white font-bold text-xl">HostelHub</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Email Verification
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-md">
              {verification.status === 'loading' && 'We\'re confirming your email address...'}
              {verification.status === 'success' && 'Welcome to the HostelHub community!'}
              {verification.status !== 'success' && verification.status !== 'loading' && 'Let\'s get you verified and ready to explore.'}
            </p>
            
            <div className="space-y-4">
              {[
                "Access hostels worldwide",
                "Secure booking system", 
                "Exclusive member benefits",
                "24/7 customer support"
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

        {/* Verification Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <StatusIcon />
            </div>
            
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {verification.status === 'loading' && 'Verifying Your Email'}
              {verification.status === 'success' && 'Verification Complete!'}
              {verification.status === 'error' && 'Verification Failed'}
              {verification.status === 'expired' && 'Link Expired'}
            </motion.h2>
            
            <motion.p
              className={`text-base mb-6 p-4 ${getStatusBackground()} ${getStatusTextColor()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {verification.message}
            </motion.p>

            <AnimatePresence>
              {showResendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 text-green-700 p-3 mb-4 border border-green-200"
                >
                  Verification email sent successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3">
              {verification.status === 'success' && (
                <motion.button
                  onClick={() => router.push('/')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white py-3 px-6 font-medium transition-colors"
                >
                  Go to Login <FiArrowRight />
                </motion.button>
              )}

              {(verification.status === 'error' || verification.status === 'expired') && (
                <>
                  <motion.button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 ${
                      isResending ? 'bg-gray-400' : 'bg-[#FF6A00] hover:bg-[#E55E00]'
                    } text-white py-3 px-6 font-medium transition-colors`}
                  >
                    {isResending ? (
                      <>
                        <FaSpinner className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <FiMail /> Resend Verification
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => router.push('/sign-up')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 font-medium transition-colors"
                  >
                    <FiUserPlus /> Back to Registration
                  </motion.button>
                </>
              )}

              {/* Always show home button */}
              <motion.button
                onClick={() => router.push('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 font-medium transition-colors"
              >
                <FiHome /> Back to Home
              </motion.button>
            </div>

            {/* Additional help text for error states */}
            {(verification.status === 'error' || verification.status === 'expired') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-gray-50 border border-gray-200"
              >
                <p className="text-sm text-gray-600">
                  <strong>Need help?</strong> Check your spam folder or contact support if you continue to experience issues.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white border border-gray-200 overflow-hidden">
          {/* Left Hero Section */}
          <div className="w-full md:w-1/2 bg-[#1a1a1a] p-8 md:p-12 flex flex-col justify-between">
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-[#FF6A00] mr-2"></div>
              <span className="text-white font-bold text-xl">HostelHub</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Email Verification
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-md">
                We're confirming your email address...
              </p>
            </div>
            
            <div className="text-gray-500 text-sm">
              © 2025 HostelHub. All rights reserved.
            </div>
          </div>

          {/* Loading State */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-50">
                  <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Your Email</h2>
              <p className="text-base mb-6 p-4 bg-blue-50 text-blue-700">
                Loading verification...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}