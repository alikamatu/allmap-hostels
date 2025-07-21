'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

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

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const token = searchParams.get('token');

    // Handle redirect from backend
    if (status) {
      if (status === 'success') {
        setVerification({
          status: 'success',
          message: 'Your email has been verified successfully! You can now log in.'
        });
      } else if (status === 'error') {
        const errorMessage = message ? decodeURIComponent(message) : 'Verification failed';
        const isExpired = errorMessage.toLowerCase().includes('expired');
        
        setVerification({
          status: isExpired ? 'expired' : 'error',
          message: errorMessage
        });
      }
      return;
    }

    // Handle direct token verification (fallback)
    if (token) {
      verifyToken(token);
    } else {
      setVerification({
        status: 'error',
        message: 'No verification token provided.'
      });
    }
  }, [searchParams]);

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
          message: 'Your email has been verified successfully! You can now log in.'
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
    const email = prompt('Please enter your email address to resend the verification email:');
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
        alert('Verification email sent successfully! Please check your inbox.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to send email: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Could not send verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verification.status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
      case 'expired':
        return '❌';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (verification.status) {
      case 'success':
        return '#22c55e';
      case 'error':
      case 'expired':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '2rem',
      textAlign: 'center',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {getStatusIcon()}
      </div>
      
      <h2 style={{ 
        color: '#1f2937', 
        marginBottom: '1rem',
        fontSize: '1.5rem'
      }}>
        Email Verification
      </h2>
      
      <p style={{ 
        color: getStatusColor(),
        marginBottom: '2rem',
        fontSize: '1rem',
        lineHeight: '1.5'
      }}>
        {verification.message}
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {verification.status === 'success' && (
          <button
            onClick={() => router.push('/login')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Go to Login
          </button>
        )}

        {(verification.status === 'error' || verification.status === 'expired') && (
          <>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              style={{
                backgroundColor: isResending ? '#9ca3af' : '#f59e0b',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: isResending ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={() => router.push('/register')}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Back to Registration
            </button>
          </>
        )}

        {verification.status === 'loading' && (
          <div style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div style={{ 
        maxWidth: '500px', 
        margin: '2rem auto', 
        textAlign: 'center',
        padding: '2rem'
      }}>
        <p>Loading verification page...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}