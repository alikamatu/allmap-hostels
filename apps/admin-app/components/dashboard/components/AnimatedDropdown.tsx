'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut } from 'lucide-react';

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-transparent p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-medium">A</span>
        </div>
        <span className="hidden md:inline">Admin User</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50"
          >
            <div className="py-1">
              <div className="px-4 py-2 text-sm font-semibold">My Account</div>
              <div className="h-px bg-gray-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Settings
              </button>
              <div className="h-px bg-gray-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IconButton({ 
  children,
  onClick,
  badge
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button 
      onClick={onClick}
      className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      {children}
      {badge && badge > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}