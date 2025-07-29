'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { motion } from 'framer-motion';
import Sidenav from '@/components/dashboard/Sidenav';
import MobileMenu from '@/components/dashboard/MobileMenu';
import Navbar from '@/components/dashboard/Navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  useEffect(() => {
    if (!isDesktop) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
      setIsMobileOpen(false);
    }
  }, [isDesktop]);

  const toggleSidenav = () => {
    if (isDesktop) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isDesktop && (
        <Sidenav 
          isCollapsed={isCollapsed} 
          toggleSidenav={toggleSidenav} 
        />
      )}
      
      <MobileMenu 
        isOpen={isMobileOpen} 
        toggleMenu={toggleSidenav} 
      />

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar 
          toggleSidenav={toggleSidenav} 
          isCollapsed={isCollapsed}
        />
        
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-6 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}