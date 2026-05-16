'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bed,
  Building,
  Calendar,
  LayoutDashboard,
  LucideTimer,
  Settings,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const navItems = [
  { name: 'Dashboard',  href: '/dashboard',                    icon: LayoutDashboard },
  { name: 'Bookings',   href: '/dashboard/booking-management', icon: Calendar },
  { name: 'Hostels',    href: '/dashboard/manage-hostels',     icon: Building },
  { name: 'Rooms',      href: '/dashboard/manage-room',        icon: Bed },
  { name: 'Earnings',   href: '/dashboard/earnings',           icon: Wallet },
  { name: 'History',    href: '/dashboard/booking-history',    icon: LucideTimer },
  { name: 'Reviews',    href: '/dashboard/reviews',            icon: Star },
  { name: 'Settings',   href: '/dashboard/settings',           icon: Settings },
];

export default function MobileMenu({ isOpen, toggleMenu }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={toggleMenu}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#FF6A00] rounded-lg flex items-center justify-center">
                  <Image src="/logo/logo.png" width={16} height={16} alt="" className="object-contain" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Allmap Hostels</span>
              </div>
              <button
                onClick={toggleMenu}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 overflow-y-auto px-2">
              <ul className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={toggleMenu}
                        className={[
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative transition-colors duration-150',
                          isActive
                            ? 'bg-orange-50 text-[#FF6A00]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        ].join(' ')}
                      >
                        {isActive && (
                          <span className="absolute left-0 inset-y-1.5 w-0.5 bg-[#FF6A00] rounded-full" />
                        )}
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
