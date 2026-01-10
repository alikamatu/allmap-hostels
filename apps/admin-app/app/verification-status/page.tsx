"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiClock, FiXCircle, FiCheckCircle, FiAlertCircle, FiArrowRight, FiHome } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected' | 'unverified';
  lastUpdated?: string;
}

export default function VerificationStatusPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus['status'] | 'loading'>('loading');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        if (!user) {
          router.push('/');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }

        const data: VerificationStatus = await response.json();
        
        if (data.status === 'approved') {
          router.push('/dashboard');
        } else {
          setStatus(data.status);
          if (data.lastUpdated) {
            setLastUpdated(data.lastUpdated);
          }
        }
      } catch {
        setStatus('unverified');
      }
    };

    fetchVerificationStatus();
  }, [user, router]);

  useEffect(() => {
    if (status === 'rejected' || status === 'unverified') {
      const timer = setTimeout(() => {
        router.push('/verification');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'approved' || !user) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Loading Section */}
        <div className="w-full p-6 md:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF6A00] flex items-center justify-center">
                <FaSpinner className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Finalizing Setup</h2>
            <p className="text-gray-600 mb-6">
              Preparing your administrator dashboard
            </p>
            
            {/* Loading Bar */}
            <div className="w-full h-1 bg-gray-200 mb-4">
              <motion.div
                className="h-full bg-[#FF6A00]"
                animate={{ 
                  x: ['-100%', '100%'],
                  transition: {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Status Content Section */}
      <div className="w-full bg-white p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {status === 'loading' ? (
              <LoadingState />
            ) : status === 'pending' ? (
              <PendingState lastUpdated={lastUpdated} />
            ) : status === 'rejected' ? (
              <RejectedState />
            ) : (
              <UnverifiedState />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-blue-50 flex items-center justify-center">
        <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Checking Status</h1>
    <p className="text-gray-600 mb-6">Please wait while we verify your administrator status</p>
    
    {/* Loading Bar */}
    <div className="w-full h-1 bg-gray-200 mb-4">
      <motion.div
        className="h-full bg-[#FF6A00]"
        animate={{ 
          x: ['-100%', '100%'],
          transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
      />
    </div>
  </motion.div>
);

const PendingState = ({ lastUpdated }: { lastUpdated: string | null }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-yellow-50 flex items-center justify-center">
        <FiClock className="h-8 w-8 text-yellow-500" />
      </div>
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Under Review</h1>
    <p className="text-gray-600 mb-4">
      Your administrator application is being reviewed. This typically takes 1-2 business days.
    </p>
    {lastUpdated && (
      <p className="text-sm text-gray-500 mb-6">
        Submitted on: {new Date(lastUpdated).toLocaleDateString()}
      </p>
    )}
    
    {/* Loading Bar */}
    <div className="w-32 h-1 bg-gray-200 mx-auto mb-4">
      <motion.div
        className="h-full bg-[#FF6A00]"
        animate={{ 
          x: ['-100%', '100%'],
          transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
      />
    </div>
    
    <p className="text-sm text-gray-500 mb-6">
      You will be redirected automatically when approved
    </p>

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => window.location.reload()}
      className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 font-medium transition-colors w-full mb-3"
    >
      <FaSpinner className="animate-spin" />
      Refresh Status
    </motion.button>
  </motion.div>
);

const RejectedState = () => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-red-50 flex items-center justify-center">
          <FiXCircle className="h-8 w-8 text-red-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Approved</h1>
      <p className="text-gray-600 mb-4">
        Your application was not approved. Please resubmit with additional documentation or contact support for more information.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Redirecting to verification page in 5 seconds...
      </p>
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 mb-6">
        <motion.div
          className="h-full bg-[#FF6A00]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>
      
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/verification')}
          className="flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white py-3 px-6 font-medium transition-colors"
        >
          Resubmit Application
          <FiArrowRight />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 font-medium transition-colors"
        >
          <FiHome />
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );
};

const UnverifiedState = () => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
          <FiAlertCircle className="h-8 w-8 text-gray-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Required</h1>
      <p className="text-gray-600 mb-4">
        We could not find your verification application. Please submit one to access the administrator dashboard.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Redirecting to verification page in 5 seconds...
      </p>
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 mb-6">
        <motion.div
          className="h-full bg-[#FF6A00]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>
      
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/verification')}
          className="flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white py-3 px-6 font-medium transition-colors"
        >
          Start Verification
          <FiArrowRight />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 font-medium transition-colors"
        >
          <FiHome />
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );
};