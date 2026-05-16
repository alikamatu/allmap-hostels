'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidenav from '@/components/dashboard/Sidenav';
import MobileMenu from '@/components/dashboard/MobileMenu';
import Navbar from '@/components/dashboard/Navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidenav = useCallback(() => {
    if (window.innerWidth >= 768) {
      setSidebarCollapsed(prev => !prev);
    } else {
      setMobileOpen(prev => !prev);
    }
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidenav isCollapsed={sidebarCollapsed} toggleSidenav={toggleSidenav} />
      </div>

      {/* Mobile drawer */}
      <MobileMenu isOpen={mobileOpen} toggleMenu={() => setMobileOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar toggleSidenav={toggleSidenav} isCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-y-auto p-3 md:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
