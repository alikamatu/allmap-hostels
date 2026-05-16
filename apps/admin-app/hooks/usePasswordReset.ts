import { useState, useRef, useCallback } from 'react';
import { ResetStatus } from '@/types/auth';

export const usePasswordReset = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<ResetStatus>('idle');
  const [resetError, setResetError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleResetRequest = useCallback(async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setResetError('Please enter your email address');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmed)) {
      setResetError('Please enter a valid email address');
      return;
    }

    try {
      setResetStatus('loading');
      setResetError('');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/auth/admin/request-reset`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send reset email');
      }

      setResetStatus('success');
    } catch (err) {
      setResetStatus('error');
      setResetError(
        err instanceof Error ? err.message : 'Failed to send reset email',
      );
    }
  }, []);

  const closeModal = useCallback(() => {
    setShowResetModal(false);
    setResetStatus('idle');
    setResetError('');
    setResetEmail('');
  }, []);

  return {
    showResetModal,
    setShowResetModal,
    resetEmail,
    setResetEmail,
    resetStatus,
    resetError,
    modalRef,
    handleResetRequest,
    closeModal,
  };
};
