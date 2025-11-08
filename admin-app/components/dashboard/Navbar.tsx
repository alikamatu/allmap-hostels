'use client';

import { LogOut } from 'lucide-react';
import { IconButton } from './components/AnimatedDropdown';
import LocationIndicator from './components/LocationIndicator';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  toggleSidenav: () => void;
  isCollapsed?: boolean;
}

export default function Navbar({ toggleSidenav }: NavbarProps) {
  const { logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="ml-4">
            <LocationIndicator />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <IconButton onClick={logout}>
            <LogOut className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}