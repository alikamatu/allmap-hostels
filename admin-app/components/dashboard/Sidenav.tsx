'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building, 
  Bed, 
  Calendar, 
  Star, 
  Bell, 
  Settings,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';

interface SidenavProps {
  isCollapsed: boolean;
  toggleSidenav: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Manage Hostels', href: '/admin/hostels', icon: Building },
  { name: 'Manage Rooms', href: '/admin/rooms', icon: Bed },
  { name: 'Bookings Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidenav({ isCollapsed, toggleSidenav }: SidenavProps) {
  const pathname = usePathname();
  
  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ 
        width: isCollapsed ? 80 : 256,
        transition: { duration: 0.3, ease: 'easeInOut' }
      }}
      className="hidden md:flex flex-col h-full bg-white border-r border-gray-200"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary">Admin</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidenav}
          className="ml-auto"
        >
          <ChevronLeft className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-6 h-6 min-w-[24px]" />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: isCollapsed ? 0 : 1,
                          transition: { delay: 0.1 }
                        }}
                        className="ml-3 truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="p-4 mt-auto border-t border-gray-200">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} HostelFinder
          </div>
        </div>
      )}
    </motion.aside>
  );
}