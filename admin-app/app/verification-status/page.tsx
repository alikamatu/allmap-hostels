// src/app/verification-status/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiClock, FiXCircle, FiLoader } from 'react-icons/fi';

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
          // Redirect immediately if approved
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

  // Redirect to verification page if rejected or unverified
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
      <div className="flex items-center justify-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-12 text-center">
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
  <>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="inline-block mb-8"
    >
      <FiLoader className="text-8xl text-blue-600" />
    </motion.div>
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Checking Verification Status</h1>
    <p className="text-xl text-gray-600 max-w-md mx-auto">
      Please wait while we verify your administrator status
    </p>
  </>
);

const PendingState = ({ lastUpdated }: { lastUpdated: string | null }) => (
  <>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        transition: { 
          type: "spring", 
          stiffness: 260, 
          damping: 20 
        }
      }}
      className="inline-block mb-8"
    >
      <FiClock className="text-8xl text-yellow-500" />
    </motion.div>
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Under Review</h1>
    <p className="text-xl text-gray-600 max-w-md mx-auto mb-8">
      Your administrator application is currently being reviewed by our team.
      This process typically takes 1-2 business days.
    </p>
    
    {lastUpdated && (
      <p className="text-gray-500 mb-6">
        Submitted on: {new Date(lastUpdated).toLocaleDateString()}
      </p>
    )}
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex justify-center"
    >
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          animate={{ 
            x: ["-100%", "100%", "-100%"]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full bg-yellow-500"
        />
      </div>
    </motion.div>
    
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="text-gray-500 mt-8"
    >
      You&apos;ll be automatically redirected when approved
    </motion.p>
  </>
);

const RejectedState = () => {
  const router = useRouter();
  
  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          transition: { 
            duration: 0.8,
            times: [0, 0.8, 1]
          }
        }}
        className="inline-block mb-8"
      >
        <FiXCircle className="text-8xl text-red-500" />
      </motion.div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Not Approved</h1>
      <p className="text-xl text-gray-600 max-w-md mx-auto mb-8">
        Your administrator application was not approved. You can resubmit your application with additional documentation.
      </p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-lg text-gray-500 mb-6">
          Redirecting to verification page in 5 seconds...
        </p>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-1.5 bg-red-500 rounded-full"
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/verification')}
          className="mt-8 px-8 py-4 bg-red-500 text-white text-xl font-bold rounded-xl"
        >
          Resubmit Application Now
        </motion.button>
      </motion.div>
    </>
  );
};

const UnverifiedState = () => {
  const router = useRouter();
  
  return (
    <>
      <FiXCircle className="text-8xl text-gray-400 mx-auto mb-8" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Not Found</h1>
      <p className="text-xl text-gray-600 max-w-md mx-auto mb-8">
        We couldn&apos;t find your verification application. Please submit one to become a hostel administrator.
      </p>
      
      <p className="text-lg text-gray-500 mb-6">
        Redirecting to verification page in 5 seconds...
      </p>
      
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 5, ease: "linear" }}
        className="h-1.5 bg-blue-500 rounded-full mb-8"
      />
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/verification')}
        className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-xl"
      >
        Submit Application Now
      </motion.button>
    </>
  );
};