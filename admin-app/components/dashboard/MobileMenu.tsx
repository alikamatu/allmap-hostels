'use client';

import { Sheet, SheetContent } from '../ui/sheet';
import { 
  LayoutDashboard, 
  Building, 
  Bed, 
  Calendar, 
  Star, 
  Bell, 
  Settings,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
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

export default function MobileMenu({ isOpen, toggleMenu }: MobileMenuProps) {
  const pathname = usePathname();
  
  return (
    <Sheet open={isOpen} onOpenChange={toggleMenu}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">HostelFinder Admin</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link href={item.href} onClick={toggleMenu}>
                    <div
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-6 h-6 min-w-[24px]" />
                      <span className="ml-3">{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}