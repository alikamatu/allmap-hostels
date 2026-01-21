'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

// In your payment callback page (page.tsx)
useEffect(() => {
  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify?reference=${reference}`);
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('Payment successful! Access granted.');
        
        // CRITICAL: Force update paywall context
        try {
          // Clear localStorage access flags
          localStorage.removeItem('hasAccess');
          localStorage.removeItem('accessExpiry');
          localStorage.removeItem('preview_used');
          
          // Force a refresh of the access check
          if (typeof window !== 'undefined') {
            // Dispatch a custom event that paywall context can listen to
            window.dispatchEvent(new CustomEvent('paymentSuccess'));
            
            // Trigger a page reload to reset all contexts
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          }
        } catch (error) {
          console.error('Error updating access state:', error);
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Payment verification failed');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred during payment verification');
    }
  };

  verifyPayment();
}, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-black p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to hostels...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-900"
            >
              Back to Hostels
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}