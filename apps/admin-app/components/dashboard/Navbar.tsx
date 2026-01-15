'use client';

import { LogOut, Search, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface NavbarProps {
  toggleSidenav: () => void;
  isCollapsed?: boolean;
}

export default function Navbar({}: NavbarProps) {
  const { logout, user } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section - Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hostels, bookings..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 text-sm focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Profile */}
          <motion.button
            whileHover={{ backgroundColor: '#f8f9fa' }}
            className="flex items-center space-x-2 p-2"
          >
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">{user?.name || 'Admin'}</span>
          </motion.button>

          {/* Logout */}
          <motion.button
            whileHover={{ backgroundColor: '#f8f9fa' }}
            onClick={logout}
            className="p-2"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}