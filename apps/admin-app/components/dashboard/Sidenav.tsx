'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building, 
  Bed, 
  Calendar, 
  Star, 
  Settings,
  ChevronLeft,
  LucideTimer,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidenavProps {
  isCollapsed: boolean;
  toggleSidenav: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/booking-management', icon: Calendar },
  { name: 'Hostels', href: '/dashboard/manage-hostels', icon: Building },
  { name: 'Rooms', href: '/dashboard/manage-room', icon: Bed },
  { name: 'History', href: '/dashboard/booking-history', icon: LucideTimer },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidenav({ isCollapsed, toggleSidenav }: SidenavProps) {
  const pathname = usePathname();
  
  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ 
        width: isCollapsed ? 64 : 240,
        transition: { duration: 0.2, ease: 'easeInOut' }
      }}
      className="flex flex-col h-full bg-white border-r border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Image width={24} height={24} src="/logo/logo.png" className='w-6 h-6 object-contain' alt="" />
              <span className="text-sm font-semibold text-gray-900">Allmap Hostels</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={toggleSidenav}
          className="p-1 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ backgroundColor: '#f8f9fa' }}
                    className={`flex items-center p-3 relative ${
                      isActive ? 'text-[#FF6A00]' : 'text-gray-600'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6A00]"
                        layoutId="activeIndicator"
                      />
                    )}
                    <Icon className="w-4 h-4 min-w-[16px]" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3 text-sm font-medium truncate"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}