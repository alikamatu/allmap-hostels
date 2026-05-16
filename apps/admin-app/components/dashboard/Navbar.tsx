'use client';

import { LogOut, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface NavbarProps {
  toggleSidenav: () => void;
  isCollapsed?: boolean;
}

export default function Navbar({ toggleSidenav }: NavbarProps) {
  const { logout, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14">
      <div className="flex items-center h-full px-3 gap-2">

        {/* Hamburger — mobile: opens drawer; desktop: collapses sidebar */}
        <button
          onClick={toggleSidenav}
          aria-label="Toggle navigation"
          className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search — full on md+, icon-toggle on mobile */}
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                placeholder="Search hostels, bookings…"
                className="w-full h-9 pl-9 pr-3 bg-gray-50 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/20 transition"
              />
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Desktop search bar */}
            <div className="hidden md:flex flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search hostels, bookings…"
                  className="w-full h-9 pl-9 pr-3 bg-gray-50 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/20 transition"
                />
              </div>
            </div>

            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Spacer */}
            <div className="flex-1 md:flex-none" />
          </>
        )}

        {/* Right section */}
        {!searchOpen && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{user?.name || 'Admin'}</span>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
