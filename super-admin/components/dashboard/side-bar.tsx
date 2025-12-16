'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Users,
  Building,
  Calendar,
  CreditCard,
  Star,
  MessageSquare,
  Shield,
  Settings,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'overview', icon: Home, label: 'Overview' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'hostels', icon: Building, label: 'Hostels' },
  { id: 'bookings', icon: Calendar, label: 'Bookings' },
  { id: 'payments', icon: CreditCard, label: 'Payments' },
  { id: 'reviews', icon: Star, label: 'Reviews' },
  { id: 'support', icon: MessageSquare, label: 'Support' },
  { id: 'admins', icon: Shield, label: 'Admins' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarVariants = {
    open: { width: 240 },
    closed: { width: isMobile ? 0 : 60 },
  };

  const itemVariants = {
    hover: { x: 4 },
    tap: { x: 0 },
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'closed' : 'open'}
        variants={sidebarVariants}
        transition={{ duration: 0.2 }}
        className="h-screen bg-white flex-shrink-0 overflow-hidden relative"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center"
          >
            <div className="w-6 h-6 bg-[#ff7a00] mr-3"></div>
            <span className="text-13 font-semibold text-gray-900">ALLMAP ADMIN</span>
          </motion.div>
          <motion.div
            animate={{ opacity: isCollapsed ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <div className="w-6 h-6 bg-[#ff7a00]"></div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="py-6 px-3">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.id);
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={`/dashboard/${item.id}`}
                  className={`flex items-center h-10 px-3 mb-1 relative ${
                    isActive ? 'text-[#ff7a00]' : 'text-gray-600'
                  } hover:text-gray-900`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-[2px] h-full bg-[#ff7a00]"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <item.icon size={16} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="ml-3 text-12 font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100">
          <div className="h-16 flex items-center justify-between px-3">
            {!isCollapsed ? (
              <>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-11 font-semibold text-gray-700">SA</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-12 font-medium text-gray-900">Super Admin</p>
                    <p className="text-10 text-gray-500">admin@allmap.com</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-900">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
                  <span className="text-11 font-semibold text-gray-700">SA</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={12} />
          </motion.div>
        </button>
      </motion.aside>
    </>
  );
}