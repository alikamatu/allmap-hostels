"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
          router.push('/login');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm mx-auto">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-900"
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="text-center">
          {status === 'loading' ? (
            <LoadingState />
          ) : status === 'pending' ? (
            <PendingState lastUpdated={lastUpdated} />
          ) : status === 'rejected' ? (
            <RejectedState />
          ) : (
            <UnverifiedState />
          )}
        </div>
      </motion.div>
    </div>
  );
}

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <h1 className="text-lg font-semibold text-gray-900 mb-2">Checking Status</h1>
    <p className="text-sm text-gray-600 mb-4">Please wait while we verify your administrator status</p>
    
    {/* Purple-900 thin horizontal loading line */}
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-purple-900"
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
    <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
    <h1 className="text-lg font-semibold text-gray-900 mb-2">Application Under Review</h1>
    <p className="text-sm text-gray-600 mb-4">
      Your application is being reviewed. This typically takes 1-2 business days.
    </p>
    {lastUpdated && (
      <p className="text-xs text-gray-500 mb-4">
        Submitted on: {new Date(lastUpdated).toLocaleDateString()}
      </p>
    )}
    
    {/* Purple-900 thin horizontal loading line */}
    <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
      <motion.div
        className="h-full bg-purple-900"
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
    
    <p className="text-xs text-gray-500 mt-4">
      You&apos;ll be redirected when approved
    </p>
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
      <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Application Not Approved</h1>
      <p className="text-sm text-gray-600 mb-4">
        Your application was not approved. Please resubmit with additional documentation.
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Redirecting to verification page in 5 seconds...
      </p>
      
      {/* Purple-900 thin horizontal loading line */}
      <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
        <motion.div
          className="h-full bg-purple-900"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/verification')}
        className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
      >
        Resubmit Application
      </motion.button>
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
      <XCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h1>
      <p className="text-sm text-gray-600 mb-4">
        We couldn&apos;t find your verification application. Please submit one.
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Redirecting to verification page in 5 seconds...
      </p>
      
      {/* Purple-900 thin horizontal loading line */}
      <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
        <motion.div
          className="h-full bg-purple-900"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/verification')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Submit Application
      </motion.button>
    </motion.div>
  );
};