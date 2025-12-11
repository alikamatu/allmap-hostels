"use client";

import { Countdown } from '@/_components/dashboard/countdown';
import { PaywallModal } from '@/_components/dashboard/paywall-modal';
import Navbar from '@/_components/Navbar';
import { PaywallProvider, usePaywall } from '@/context/paywall-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaywallProvider>
      <PaywallContent>{children}</PaywallContent>
    </PaywallProvider>
  );
}

function PaywallContent({ children }: { children: React.ReactNode }) {
  const { previewTimeLeft, showPaywall, hasAccess } = usePaywall();

  return (
    <>
    <div className="flex mb-6">
    <Navbar />
    </div>
      {hasAccess && <Countdown timeLeft={previewTimeLeft} />}
      
      {children}
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => {}}
      />
    </>
  );
}