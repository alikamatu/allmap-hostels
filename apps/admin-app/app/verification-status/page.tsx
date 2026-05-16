"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  Home,
  RefreshCw,
  Loader2,
} from 'lucide-react';

type Status = 'loading' | 'pending' | 'approved' | 'rejected' | 'unverified';

function VerificationStatusContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get('status') as Status | null;
  const [status, setStatus] = useState<Status>(
    initialStatus && initialStatus !== 'approved' ? initialStatus : 'loading',
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Status passed from login handler — skip API call
    if (initialStatus && initialStatus !== 'approved' && initialStatus !== 'loading') {
      return;
    }

    const fetchStatus = async () => {
      try {
        const token =
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('access_token');

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/admin/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        if (data.status === 'approved') {
          router.push('/dashboard');
          return;
        }

        setStatus(data.status);
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
      } catch {
        setStatus('unverified');
      }
    };

    fetchStatus();
  }, [user, router, initialStatus]);

  useEffect(() => {
    if (status === 'rejected' || status === 'unverified') {
      const t = setTimeout(() => router.push('/verification'), 5000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="h-1 bg-[#FF6A00]" />
        <div className="p-8 text-center">
          {status === 'loading' && <LoadingState />}
          {status === 'pending' && <PendingState lastUpdated={lastUpdated} />}
          {status === 'rejected' && <RejectedState />}
          {status === 'unverified' && <UnverifiedState />}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerificationStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <PageSpinner />
        </div>
      }
    >
      <VerificationStatusContent />
    </Suspense>
  );
}

// ─── Sub-states ────────────────────────────────────────────────────────────────

function PageSpinner() {
  return (
    <Loader2 className="w-7 h-7 animate-spin text-gray-400" strokeWidth={1.75} />
  );
}

function IconBox({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${className}`}>
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <IconBox className="bg-blue-50">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" strokeWidth={1.75} />
      </IconBox>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Checking Status</h2>
      <p className="text-sm text-gray-500">Verifying your administrator account…</p>
    </>
  );
}

function PendingState({ lastUpdated }: { lastUpdated: string | null }) {
  return (
    <>
      <IconBox className="bg-amber-50">
        <Clock className="w-7 h-7 text-amber-500" strokeWidth={1.75} />
      </IconBox>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h2>
      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
        Your administrator application is being reviewed. This typically takes 1–2 business days.
      </p>
      {lastUpdated && (
        <p className="text-xs text-gray-400 mb-4">
          Submitted: {new Date(lastUpdated).toLocaleDateString()}
        </p>
      )}

      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-[#FF6A00] rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        />
      </div>

      <p className="text-xs text-gray-400 mb-5">
        You&apos;ll be redirected automatically when approved
      </p>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
        Refresh status
      </button>
    </>
  );
}

function RejectedState() {
  const router = useRouter();

  return (
    <>
      <IconBox className="bg-red-50">
        <XCircle className="w-7 h-7 text-red-500" strokeWidth={1.75} />
      </IconBox>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
        Your application was not approved. Please resubmit with the required documentation or contact support.
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Redirecting to verification page in 5 seconds…
      </p>

      <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-[#FF6A00]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => router.push('/verification')}
          className="flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white text-sm font-semibold rounded-lg h-11 px-4 transition-colors"
        >
          Resubmit Application
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium rounded-lg h-11 px-4 transition-colors"
        >
          <Home className="w-4 h-4" strokeWidth={1.75} />
          Back to Home
        </button>
      </div>
    </>
  );
}

function UnverifiedState() {
  const router = useRouter();

  return (
    <>
      <IconBox className="bg-gray-100">
        <AlertCircle className="w-7 h-7 text-gray-500" strokeWidth={1.75} />
      </IconBox>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h2>
      <p className="text-sm text-gray-500 mb-3 leading-relaxed">
        We couldn&apos;t find your verification application. Please submit one to access your admin dashboard.
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Redirecting to verification page in 5 seconds…
      </p>

      <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-[#FF6A00]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ transformOrigin: 'left' }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => router.push('/verification')}
          className="flex items-center justify-center gap-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white text-sm font-semibold rounded-lg h-11 px-4 transition-colors"
        >
          Start Verification
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium rounded-lg h-11 px-4 transition-colors"
        >
          <Home className="w-4 h-4" strokeWidth={1.75} />
          Back to Home
        </button>
      </div>
    </>
  );
}
