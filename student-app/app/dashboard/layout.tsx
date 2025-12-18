"use client";

import { Metadata } from 'next';
import { Countdown } from '@/_components/dashboard/countdown';
import { PaywallModal } from '@/_components/dashboard/paywall-modal';
import Footer from '@/_components/footer';
import Navbar from '@/_components/Navbar';
import { PaywallProvider, usePaywall } from '@/context/paywall-context';

// Note: Metadata can't be exported from a client component
// It should be in a separate server component or layout file
// This layout is a client component to use context

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
      <Footer />
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => {}}
      />
    </>
  );
}