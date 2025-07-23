'use client';

import { useState } from 'react';
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  LogOut 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';

interface NavbarProps {
  toggleSidenav: () => void;
  isCollapsed?: boolean;
}

export default function Navbar({ toggleSidenav, isCollapsed }: NavbarProps) {
  const [notifications] = useState(3);
  const schoolName = "University of Ghana";
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleSidenav}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:inline-flex"
            onClick={toggleSidenav}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="ml-4">
            <Badge variant="secondary" className="text-sm font-normal">
              {schoolName}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                {notifications}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/avatar.jpg" alt="Admin" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">Admin User</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}