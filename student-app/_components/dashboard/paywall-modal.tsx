"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Check, Shield, AlertCircle } from 'lucide-react';
import { usePaywall } from '@/context/paywall-context';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ 
  isOpen, 
  onClose, 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAccess, hasAccess } = usePaywall();

  const handleUnlock = async () => {
    setError(null);
    setLoading(true);
    try {
      await refreshAccess();
      if (hasAccess) {
        setError('You already have active access! Closing modal...');
        setTimeout(() => onClose(), 2000);
        setLoading(false);
        return;
      }
      const userId = localStorage.getItem('userId') || localStorage.getItem('user_id') || sessionStorage.getItem('userId') || sessionStorage.getItem('user_id');
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || sessionStorage.getItem('userEmail') || sessionStorage.getItem('email');
      let userFromStorage = null;
      try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) userFromStorage = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user from storage:', e);
      }
      const finalUserId = userId || userFromStorage?.id;
      const finalUserEmail = userEmail || userFromStorage?.email;
      if (!finalUserId || !finalUserEmail) throw new Error('Please login to proceed with payment. User data not found.');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ userId: finalUserId, email: finalUserEmail, amount: 3800 }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.already_has_access) {
          setError('You already have active access! Your access expires: ' + new Date(data.expires_at).toLocaleDateString());
          await refreshAccess();
          setLoading(false);
          return;
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      if (data.authorization_url) {
        localStorage.setItem('pending_payment_reference', data.reference);
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL received from server');
      }
    } catch (error: any) {
      console.error('Failed to initiate payment:', error);
      setError(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const features = [
    '200+ hostels with verified details',
    'Exact distance from your school (with map)',
    'No walking under the sun to check hostels',
    'Contact numbers + directions included',
    'See prices BEFORE visiting',
    'Save time: compare all hostels in one place',
    '30 days unlimited access'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 flex items-center justify-center p-4 text-black"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lock size={24} />
                Unlock All Hostels — 30 Days
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-yellow-50 flex items-start gap-2">
                  <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-yellow-700 text-sm">{error}</span>
                </div>
              )}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">38 GHS</div>
                <div className="text-black">One-time payment for 30 days access</div>
              </div>
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Check size={18} />
                  What you get:
                </h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-black" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50">
                <Shield size={18} />
                <span className="text-sm">Secure payment by Paystack</span>
              </div>
              <button
                onClick={handleUnlock}
                disabled={loading || hasAccess}
                className="w-full bg-black text-white py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900"
              >
                {loading ? 'Processing...' : hasAccess ? 'Access Already Active' : 'Unlock Access (38 GHS)'}
              </button>
              <p className="text-center text-black text-sm mt-4">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};