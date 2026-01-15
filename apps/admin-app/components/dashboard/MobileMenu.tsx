'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building, 
  Bed, 
  Calendar, 
  Star, 
  Settings,
  X,
  LucideTimer,
  Wallet,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/booking-management', icon: Calendar },
  { name: 'Hostels', href: '/dashboard/manage-hostels', icon: Building },
  { name: 'Rooms', href: '/dashboard/manage-room', icon: Bed },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'History', href: '/dashboard/booking-history', icon: LucideTimer },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function MobileMenu({ isOpen, toggleMenu }: MobileMenuProps) {
  const pathname = usePathname();
  
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-[#FF6A00] mr-2"></div>
          <span className="text-sm font-semibold text-gray-900">HostelHub</span>
        </div>
        <button 
          onClick={toggleMenu}
          className="p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href} onClick={toggleMenu}>
                  <div
                    className={`flex items-center p-3 relative ${
                      isActive ? 'text-[#FF6A00]' : 'text-gray-600'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6A00]"></div>
                    )}
                    <Icon className="w-4 h-4 min-w-[16px]" />
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.div>
  );
}