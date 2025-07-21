'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
  const token = searchParams.get('token');
  console.log('Token:', token); // Add this line
  if (!token) {
    setStatus('error');
    setMessage('No verification token provided.');
    return;
  }

    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:1000/auth/verify/${token}`);
        if (res.status === 401) {
          setStatus('error');
          setMessage('Invalid or expired token.');
          return;
        }
        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been verified! You can now log in.');
        } else {
          const data = await res.json();
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Could not connect to server.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h2>Email Verification</h2>
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status !== 'verifying' && <p>{message}</p>}
    </div>
  );
}