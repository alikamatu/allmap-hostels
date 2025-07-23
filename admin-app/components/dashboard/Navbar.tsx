'use client';

import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { DropdownMenu, IconButton } from './components/AnimatedDropdown';
import LocationIndicator from './components/LocationIndicator';

interface NavbarProps {
  toggleSidenav: () => void;
  isCollapsed?: boolean;
}

export default function Navbar({ toggleSidenav }: NavbarProps) {
  const [notifications] = useState(3);
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="md:hidden">
            <IconButton onClick={toggleSidenav}>
              <Menu className="w-5 h-5" />
            </IconButton>
          </div>
          <div className="hidden md:inline-flex">
          <IconButton onClick={toggleSidenav}>
            <Menu className="w-5 h-5" />
          </IconButton>
          </div>
          
          <div className="ml-4">
            <LocationIndicator />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <IconButton badge={notifications}>
            <Bell className="w-5 h-5" />
          </IconButton>

          <DropdownMenu />
        </div>
      </div>
    </header>
  );
}