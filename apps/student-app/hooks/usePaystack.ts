import { useState, useEffect } from 'react';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    } | undefined;
  }
}

export function usePaystack() {
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    setLoading(true);
    setError(null);

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      setPaystackLoaded(true);
      setLoading(false);
    };
    
    script.onerror = () => {
      setError('Failed to load Paystack payment system');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Clean up if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return {
    paystackLoaded,
    loading,
    error,
    PaystackPop: window.PaystackPop,
  };
}