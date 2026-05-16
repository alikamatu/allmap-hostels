'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Bed,
  Building,
  Calendar,
  ChevronLeft,
  LayoutDashboard,
  LucideTimer,
  Settings,
  Star,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidenavProps {
  isCollapsed: boolean;
  toggleSidenav: () => void;
}

const navItems = [
  { name: 'Dashboard',  href: '/dashboard',                    icon: LayoutDashboard },
  { name: 'Bookings',   href: '/dashboard/booking-management', icon: Calendar },
  { name: 'Hostels',    href: '/dashboard/manage-hostels',     icon: Building },
  { name: 'Rooms',      href: '/dashboard/manage-room',        icon: Bed },
  { name: 'History',    href: '/dashboard/booking-history',    icon: LucideTimer },
  { name: 'Earnings',   href: '/dashboard/earnings',           icon: Wallet },
  { name: 'Reviews',    href: '/dashboard/reviews',            icon: Star },
  { name: 'Settings',   href: '/dashboard/settings',           icon: Settings },
];

export default function Sidenav({ isCollapsed, toggleSidenav }: SidenavProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 56 : 220 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      className="flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-200 overflow-hidden"
    >
      {/* Logo / header */}
      <div className="flex items-center h-14 border-b border-gray-200 px-2 gap-2 flex-shrink-0">
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 flex-1 overflow-hidden"
            >
              <Image width={22} height={22} src="/logo/logo.png" className="w-5 h-5 object-contain flex-shrink-0" alt="" />
              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">Allmap Hostels</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidenav}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={[
                    'flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors duration-150 relative group',
                    isActive
                      ? 'bg-orange-50 text-[#FF6A00]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeBar"
                      className="absolute left-0 inset-y-1 w-0.5 bg-[#FF6A00] rounded-full"
                    />
                  )}

                  <Icon className="w-4 h-4 flex-shrink-0" />

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.12 }}
                        className="ml-2.5 whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Floating tooltip when collapsed */}
                  {isCollapsed && (
                    <span className="pointer-events-none absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}
