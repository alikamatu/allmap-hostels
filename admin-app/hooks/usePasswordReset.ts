import { useState, useRef, useCallback } from 'react';
import { ResetStatus } from '@/types/auth';

export const usePasswordReset = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<ResetStatus>('idle');
  const [resetError, setResetError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleResetRequest = useCallback(async (email: string) => {
    if (!email) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetStatus('loading');
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetStatus('success');
    } catch (err) {
      setResetStatus('error');
      setResetError('Failed to send reset email');
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
    closeModal
  };
};