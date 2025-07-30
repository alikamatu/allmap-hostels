'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiClock, FiMail, FiArrowRight, FiUserPlus } from 'react-icons/fi';
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify/${token}`, {
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
    } catch (error) {
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
    } catch (error: any) {
      setVerification({
        ...verification,
        message: error.message || 'Failed to resend verification email'
      });
    } finally {
      setIsResending(false);
    }
  };

  const StatusIcon = () => {
    const iconSize = 80;
    const iconColor = getStatusColor();

    switch (verification.status) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
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
          >
            <FiXCircle size={iconSize} color={iconColor} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          >
            <FaSpinner size={iconSize} color={iconColor} />
          </motion.div>
        );
    }
  };

  const getStatusColor = () => {
    switch (verification.status) {
      case 'success':
        return '#10B981'; // emerald-500
      case 'error':
      case 'expired':
        return '#EF4444'; // red-500
      default:
        return '#3B82F6'; // blue-500
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <StatusIcon />
          </div>
          
          <motion.h2 
            className="text-2xl font-bold text-gray-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Email Verification
          </motion.h2>
          
          <motion.p
            className={`text-lg mb-6 ${verification.status === 'success' ? 'text-emerald-600' : verification.status === 'error' ? 'text-red-600' : 'text-blue-600'}`}
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
                className="bg-emerald-100 text-emerald-700 p-3 rounded-lg mb-4"
              >
                Verification email sent successfully!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3">
            {verification.status === 'success' && (
              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
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
                    isResending ? 'bg-amber-400' : 'bg-amber-500 hover:bg-amber-600'
                  } text-white py-3 px-6 rounded-lg font-medium transition-colors`}
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
                  className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FiUserPlus /> Back to Registration
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}