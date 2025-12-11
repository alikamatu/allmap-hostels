"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';

interface PaywallContextType {
  hasAccess: boolean;
  isPreview: boolean;
  previewTimeLeft: number;
  showPaywall: boolean;
  unlockAccess: () => void;
  checkAccess: () => Promise<boolean>;
  refreshAccess: () => Promise<void>;
  resetInitialCheck: () => void;
  hasUsedPreview: boolean;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

const PREVIEW_DURATION = 30; // seconds
const PREVIEW_USED_KEY = 'preview_used';

export const PaywallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [previewTimeLeft, setPreviewTimeLeft] = useState<number>(PREVIEW_DURATION);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [hasUsedPreview, setHasUsedPreview] = useState<boolean>(false);
  const initialCheckDone = useRef(false);

  const resetInitialCheck = () => {
    console.log('🔄 Resetting initial check flag');
    initialCheckDone.current = false;
  };

  // Function to get userId from localStorage
  const getUserId = useCallback((): string | null => {
    // Check for direct userId key
    let userId = localStorage.getItem('userId');
    
    // If not found, extract from user object
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id;
          // Store userId separately for future use
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        } catch (error) {
          console.error('Failed to parse user:', error);
        }
      }
    }

    // Also check sessionStorage
    if (!userId) {
      userId = sessionStorage.getItem('userId');
    }
    
    return userId;
  }, []);

  // Function to track preview usage in backend
  const trackPreviewUsage = useCallback(async (source: 'countdown_ended' | 'manual_unlock' | 'other'): Promise<boolean> => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error('No userId found for tracking preview usage');
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/track-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          source,
          metadata: {
            timestamp: new Date().toISOString(),
            previewDuration: PREVIEW_DURATION,
            timeLeftWhenUsed: previewTimeLeft,
          }
        }),
      });

      if (response.ok) {
        console.log('✅ Preview usage tracked in backend:', source);
        return true;
      } else {
        console.error('Failed to track preview usage in backend:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error tracking preview usage:', error);
      return false;
    }
  }, [getUserId, previewTimeLeft]);

  // Function to mark preview as used (frontend only)
  const markPreviewAsUsedFrontend = useCallback(() => {
    console.log('🔒 Marking preview as used in frontend');
    localStorage.setItem(PREVIEW_USED_KEY, 'true');
    setHasUsedPreview(true);
    setIsPreview(false);
    setPreviewTimeLeft(0);
    setShowPaywall(true);
  }, []);

  // Function to mark preview as used (both frontend and backend)
  const markPreviewAsUsed = useCallback(async (source: 'countdown_ended' | 'manual_unlock' | 'other' = 'other') => {
    console.log(`🔒 Marking preview as used (${source})`);
    
    // Update frontend state immediately
    markPreviewAsUsedFrontend();
    
    // Track in backend (async, don't wait for it)
    trackPreviewUsage(source);
  }, [markPreviewAsUsedFrontend, trackPreviewUsage]);

  const checkAccess = useCallback(async (): Promise<boolean> => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        console.log('No userId found in localStorage or sessionStorage');
        setHasAccess(false);
        setHasUsedPreview(false);
        return false;
      }

      console.log('Checking access for user:', userId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/access/check?userId=${userId}&_=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        }
      );
      
      if (!response.ok) {
        console.error('Failed to check access:', response.status);
        return false;
      }
      
      const data = await response.json();
      console.log('Access check response:', data);
      
      const isActive = data.active === true;
      const previewUsed = data.previewUsed === true;
      
      // Update local preview used state
      setHasUsedPreview(previewUsed);
      
      if (isActive) {
        console.log('✅ User has PAID access - clearing preview flags');
        setHasAccess(true);
        setIsPreview(false);
        setPreviewTimeLeft(0);
        setShowPaywall(false);
        localStorage.setItem('hasAccess', 'true');
        if (data.expiry) {
          localStorage.setItem('accessExpiry', data.expiry);
        }
        // Clear preview used flag since they have paid access
        localStorage.removeItem(PREVIEW_USED_KEY);
      } else {
        console.log('❌ User does NOT have paid access');
        setHasAccess(false);
        localStorage.removeItem('hasAccess');
        localStorage.removeItem('accessExpiry');
        
        // Sync preview used status with backend
        if (previewUsed && localStorage.getItem(PREVIEW_USED_KEY) !== 'true') {
          console.log('🔄 Backend says preview used, updating local storage');
          localStorage.setItem(PREVIEW_USED_KEY, 'true');
        }
      }
      
      return isActive;
    } catch (error) {
      console.error('Failed to check access:', error);
      return false;
    }
  }, [getUserId]);

  const refreshAccess = useCallback(async () => {
    console.log('Force refreshing access state');
    await checkAccess();
  }, [checkAccess]);

  // Add this useEffect to listen for payment success
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      console.log('💰 Payment success event received, refreshing access...');
      // Reset the initial check to force a fresh server check
      initialCheckDone.current = false;
      await checkAccess();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('paymentSuccess', handlePaymentSuccess);
      
      return () => {
        window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      };
    }
  }, [checkAccess]);

  const syncUserId = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id && !localStorage.getItem('userId')) {
          localStorage.setItem('userId', user.id);
          console.log('🔄 Synced userId from user object:', user.id);
        }
      } catch (error) {
        console.error('Failed to sync userId:', error);
      }
    }
  }, []);

  // Initial mount effect - check access before allowing preview
  useEffect(() => {
    syncUserId();

    const initializeAccess = async () => {
      console.log('🔄 Initializing access check...');

      if (!localStorage.getItem('userId')) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.id) {
              localStorage.setItem('userId', user.id);
              console.log('✅ Extracted userId from user object:', user.id);
            }
          } catch (error) {
            console.error('Failed to parse user object:', error);
          }
        }
      }
      
      // Check localStorage first for optimistic UI
      const storedHasAccess = localStorage.getItem('hasAccess') === 'true';
      const storedExpiry = localStorage.getItem('accessExpiry');
      
      if (storedHasAccess && storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        if (expiryDate > new Date()) {
          console.log('✅ Valid cached PAID access found - NO preview needed');
          setHasAccess(true);
          setIsPreview(false);
          setPreviewTimeLeft(0);
          setShowPaywall(false);
          initialCheckDone.current = true;
          
          // STILL verify with server to ensure sync
          await checkAccess();
          return;
        } else {
          console.log('🗑️ Cached access expired, clearing...');
          localStorage.removeItem('hasAccess');
          localStorage.removeItem('accessExpiry');
        }
      }

      // Check with server
      const hasServerAccess = await checkAccess();
      
      // Mark initial check as done
      initialCheckDone.current = true;
      
      if (hasServerAccess) {
        console.log('✅ Server confirmed PAID access - NO preview needed');
        setIsPreview(false);
        setShowPaywall(false);
      } else {
        // Check if user has already used their preview (from localStorage)
        const previewUsed = localStorage.getItem(PREVIEW_USED_KEY) === 'true';
        
        if (previewUsed) {
          console.log('🚫 Preview already used - showing paywall immediately');
          setIsPreview(false);
          setShowPaywall(true);
          setPreviewTimeLeft(0);
        } else {
          console.log('⏱️ No access - starting ONE-TIME preview countdown');
          setIsPreview(true);
          // DO NOT mark preview as used here - only when it actually ends or user clicks unlock
        }
      }
    };

    initializeAccess();
  }, [checkAccess, syncUserId]);

  // Countdown effect
  useEffect(() => {
    // Don't run countdown if:
    // 1. Initial check not done
    // 2. User has paid access
    // 3. Not in preview mode
    // 4. No time left
    if (!initialCheckDone.current || hasAccess || !isPreview || previewTimeLeft <= 0) {
      return;
    }

    console.log('⏱️ Countdown running:', previewTimeLeft, 'seconds left');

    const timer = setInterval(() => {
      setPreviewTimeLeft((prev) => {
        if (prev <= 1) {
          console.log('⏰ Preview ended - tracking usage and showing paywall');
          clearInterval(timer);
          
          // Mark preview as used when countdown ends
          markPreviewAsUsed('countdown_ended');
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isPreview, hasAccess, previewTimeLeft, initialCheckDone.current, markPreviewAsUsed]);

  // Watch for access changes and stop everything immediately
  useEffect(() => {
    if (hasAccess) {
      console.log('🛑 Paid access detected - stopping preview/paywall');
      setIsPreview(false);
      setPreviewTimeLeft(0);
      setShowPaywall(false);
    }
  }, [hasAccess]);

  const unlockAccess = () => {
    console.log('🔓 User clicked unlock - tracking usage and showing paywall');
    
    // Mark preview as used when user manually clicks unlock
    markPreviewAsUsed('manual_unlock');
  };

  return (
    <PaywallContext.Provider
      value={{
        hasAccess,
        isPreview,
        previewTimeLeft,
        showPaywall,
        unlockAccess,
        checkAccess,
        refreshAccess,
        resetInitialCheck,
        hasUsedPreview,
      }}
    >
      {children}
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};