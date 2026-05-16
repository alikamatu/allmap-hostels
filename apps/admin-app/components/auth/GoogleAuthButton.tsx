"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (r: GoogleCredentialResponse) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (n: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => Promise<void>;
  onError?: (error: string) => void;
  disabled?: boolean;
  label?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  disabled,
  label = 'Continue with Google',
}) => {
  const [busy, setBusy] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initialized = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const initGIS = useCallback(() => {
    if (!clientId || !window.google || initialized.current) return;
    initialized.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
      cancel_on_tap_outside: true,
      callback: async ({ credential }) => {
        setBusy(true);
        try {
          await onSuccess(credential);
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'Google sign-in failed');
        } finally {
          setBusy(false);
        }
      },
    });
    setScriptLoaded(true);
  }, [clientId, onSuccess, onError]);

  useEffect(() => {
    if (window.google) initGIS();
  }, [initGIS]);

  const handleClick = () => {
    if (disabled || busy) return;

    if (!clientId) {
      onError?.('Google Sign-In is not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID missing)');
      return;
    }

    if (!window.google) {
      onError?.('Google Sign-In script failed to load');
      return;
    }

    if (!initialized.current) initGIS();

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        onError?.(
          'Google Sign-In popup was blocked or dismissed. Please allow popups and try again.',
        );
      }
    });
  };

  const isLoading = busy;
  const isDisabled = disabled || busy;

  return (
    <>
      {clientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initGIS}
          onReady={() => setScriptLoaded(true)}
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label="Continue with Google"
        className={[
          'w-full flex items-center justify-center gap-3',
          'h-11 px-4 rounded-lg border text-sm font-medium',
          'transition-all duration-150 select-none',
          isDisabled
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]',
        ].join(' ')}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : (
          /* Google G logo */
          <svg
            className="w-4 h-4 flex-shrink-0"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{isLoading ? 'Signing in…' : label}</span>
      </button>
    </>
  );
};
