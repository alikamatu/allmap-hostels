"use client";

import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            {/* Main 404 Text */}
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-8xl font-bold text-gray-900 mb-4"
            >
              4
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="inline-block text-[#FF6A00]"
              >
                0
              </motion.span>
              4
            </motion.h1>
            
            {/* Floating Elements */}
            <motion.div
              initial={{ x: -50, y: -50, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -top-4 -left-4"
            >
              <Building className="h-8 w-8 text-gray-400" />
            </motion.div>
            
            <motion.div
              initial={{ x: 50, y: -50, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-4 -right-4"
            >
              <Search className="h-8 w-8 text-gray-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Oops! The page you are looking for seems to have wandered off. 
            It might have been moved, deleted, or perhaps it never existed.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-150 border border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6A00] text-white text-sm font-medium hover:bg-[#E55E00] transition-colors duration-150"
          >
            <Home className="h-4 w-4" />
            Dashboard Home
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <p className="text-xs text-gray-500 mb-3">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard/manage-hostels"
              className="text-xs text-[#FF6A00] hover:text-[#E55E00] transition-colors duration-150"
            >
              Manage Hostels
            </Link>
            <Link
              href="/dashboard/rooms"
              className="text-xs text-[#FF6A00] hover:text-[#E55E00] transition-colors duration-150"
            >
              Room Management
            </Link>
            <Link
              href="/dashboard/reviews"
              className="text-xs text-[#FF6A00] hover:text-[#E55E00] transition-colors duration-150"
            >
              Reviews
            </Link>
            <Link
              href="/dashboard/bookings"
              className="text-xs text-[#FF6A00] hover:text-[#E55E00] transition-colors duration-150"
            >
              Bookings
            </Link>
          </div>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-6 p-3 bg-gray-50"
        >
          <p className="text-xs text-gray-600 mb-2">
            Can not find what you are looking for?
          </p>
          <div className="flex items-center justify-center gap-2">
            <Search className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Try using the search functionality
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}