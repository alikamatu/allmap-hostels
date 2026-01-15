"use client";

import { PaywallModal } from '@/_components/dashboard/paywall-modal';
import Footer from '@/_components/footer';
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
  const { isPaywallModalOpen, closePaywallModal } = usePaywall(); // Use isPaywallModalOpen instead of showPaywall

  return (
    <>
    <div className="flex mb-6">
    <Navbar />
    </div>
      {children}
      <Footer />
      
      <PaywallModal
        isOpen={isPaywallModalOpen} // Changed from showPaywall to isPaywallModalOpen
        onClose={closePaywallModal} // Simplified
      />
    </>
  );
}