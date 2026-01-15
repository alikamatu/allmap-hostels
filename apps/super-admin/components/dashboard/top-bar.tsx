'use client';

import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-14 bg-white border-b border-gray-100 sticky top-0 z-30"
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-13 font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-10 text-gray-500">Super Admin Panel</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-2 text-12 w-40 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#ff7a00]"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-50">
            <Bell size={16} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff7a00] rounded-full"></span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
              <span className="text-11 font-semibold text-gray-700">SA</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-12 font-medium text-gray-900">Super Admin</p>
              <p className="text-10 text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}