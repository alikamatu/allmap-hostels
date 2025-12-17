"use client";

import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Building, Navigation, Compass, Globe, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Header Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8 left-0 right-0 px-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
            >
              ← Return Home
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="h-3 w-3" />
              <span>404 Error</span>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <div className="text-center w-full">
          {/* Animated Numbers */}
          <div className="relative mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              <div className="flex justify-center">
                {['4', '0', '4'].map((digit, index) => (
                  <motion.span
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.8,
                      type: "spring",
                      stiffness: 200
                    }}
                    className="text-[9rem] font-black tracking-tighter text-gray-900 relative"
                  >
                    {digit}
                    {index === 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
                      >
                        <div className="h-[3px] w-24 bg-black" />
                      </motion.div>
                    )}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Floating Geometric Elements */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute -top-6 -left-6 h-12 w-12 border border-gray-300"
            />
            <motion.div
              initial={{ rotate: 180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="absolute -bottom-6 -right-6 h-8 w-8 border border-gray-300 rotate-45"
            />
          </div>

          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">
              Lost in Navigation
            </h1>
            <div className="h-px w-24 bg-gray-300 mx-auto mb-6" />
            <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
              The coordinates you seek have drifted beyond our current map. 
              This digital expanse remains uncharted—for now.
            </p>
          </motion.div>

          {/* Stats Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-6 text-xs text-gray-500">
              <div className="text-center">
                <div className="text-lg font-medium text-black mb-1">404</div>
                <div className="text-[10px] uppercase tracking-wider">Error Code</div>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-lg font-medium text-black mb-1">∞</div>
                <div className="text-[10px] uppercase tracking-wider">Possibilities</div>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-lg font-medium text-black mb-1">1</div>
                <div className="text-[10px] uppercase tracking-wider">Current Location</div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <button
              onClick={() => router.back()}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-medium hover:bg-gray-50 hover:text-white transition-all duration-300 border border-gray-300 relative overflow-hidden"
            >
              <motion.span
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Previous Page
              </motion.span>
              <div className="absolute inset-0 bg-black transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
            </button>
            
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-sm font-medium hover:bg-gray-900 transition-all duration-300 relative overflow-hidden"
            >
              <motion.span
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 flex items-center gap-2"
              >
                <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
                Return to Dashboard
              </motion.span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
          </motion.div>

          {/* Navigation Assistance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Navigation className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Suggested Navigation
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {[
                { href: '/dashboard', label: 'Hostels', icon: Building },
                { href: '/dashboard/feedback', label: 'Report', icon: MessageCircle },
                { href: '/dashboard/bookings', label: 'Bookings', icon: Navigation },
                { href: '/dashboard/help', label: 'Help', icon: Compass }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="flex flex-col items-center p-4 text-gray-600 hover:text-black hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <item.icon className="h-5 w-5 mb-2 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="relative"
          >
            <div className="max-w-md mx-auto px-6 py-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  Can not locate your destination?
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Global Search Available
                </span>
                <button className="text-xs text-black hover:underline transition-colors duration-200">
                  Search Portal →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-100"
          >
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
              ALLMAP HOSTELS
            </div>
            <div className="text-[9px] text-gray-400">
              Coordinates not found • Error 404 • Return to known territory
            </div>
          </motion.div>
        </div>

        {/* Decorative Lines */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="flex justify-between items-center">
            <div className="h-px w-16 bg-gray-300" />
            <div className="text-[8px] text-gray-400 uppercase tracking-widest">
              Page Not Found
            </div>
            <div className="h-px w-16 bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}