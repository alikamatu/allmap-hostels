"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiMenu,
  FiUserCheck,
  FiUser,
  FiHome,
  FiMail,
  FiBarChart,
  FiSun,
  FiMoon,
  FiMonitor,
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/ThemeProvider';

const SidebarItem = ({
  icon,
  text,
  isOpen,
  isActive,
  href,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
  isActive: boolean;
  href: string;
  onClick: () => void;
  badge?: string;
}) => {
  const ItemContent = (
    <motion.div
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-4 cursor-pointer rounded-xl flex items-center relative transition-all duration-200
        ${isActive 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'hover:bg-accent hover:text-accent-foreground'
        }
        ${!isOpen ? 'justify-center' : ''}
      `}
    >
      <div className="text-2xl flex-shrink-0">
        {icon}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 flex items-center justify-between flex-1"
          >
            <span className="text-sm font-semibold whitespace-nowrap">
              {text}
            </span>
            {badge && (
              <Badge 
                variant={isActive ? "secondary" : "default"}
                className="ml-2 text-xs"
              >
                {badge}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && badge && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
      )}
    </motion.div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} passHref className="block">
            {ItemContent}
          </Link>
        </TooltipTrigger>
        {!isOpen && (
          <TooltipContent side="left">
            <p>{text}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const ThemeToggle = ({ isOpen }: { isOpen: boolean }) => {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <FiSun className="h-4 w-4" />;
      case 'dark': return <FiMoon className="h-4 w-4" />;
      case 'system': return <FiMonitor className="h-4 w-4" />;
      default: return <FiSun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'Light';
    }
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-12 p-0 hover:bg-accent"
                >
                  {getThemeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="left">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <FiSun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <FiMoon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <FiMonitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Theme: {getThemeLabel()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start h-12 px-4 hover:bg-accent"
        >
          {getThemeIcon()}
          <span className="ml-3 text-sm font-medium">{getThemeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">        
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <FiSun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <FiMoon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <FiMonitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { id: 'Home', icon: <FiBarChart />, href: '/dashboard', badge: undefined },
    { id: 'Verify', icon: <FiUserCheck />, href: '/dashboard/verify', badge: '3' },
    { id: 'Users', icon: <FiUser />, href: '/dashboard/users' },
    { id: 'Agency', icon: <FiHome />, href: '/agency' },
    { id: 'Contact', icon: <FiMail />, href: '/contact' },
  ];

  if (!mounted) {
    return (
      <div className="h-screen w-[100px] bg-sidebar border-r border-border flex flex-col order-last">
        <div className="animate-pulse p-6">
          <div className="w-12 h-8 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 320 : 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-screen bg-sidebar border-r border-border flex flex-col order-last relative overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center relative z-10">
        <AnimatePresence>
          {isOpen ? (
            <motion.h1
              key="full-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-3xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text"
            >
              ALLMAP
            </motion.h1>
          ) : (
            <motion.h1
              key="short-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
            >
              AM
            </motion.h1>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </motion.div>
        </Button>
      </div>

      <Separator className="mx-4" />

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            text={item.id}
            isOpen={isOpen}
            isActive={pathname === item.href}
            href={item.href}
            onClick={() => {}}
            badge={item.badge}
          />
        ))}
      </div>

      <Separator className="mx-4" />

      {/* Theme Toggle */}
      <div className="p-4">
        <ThemeToggle isOpen={isOpen} />
      </div>

      {/* Footer */}
      <motion.div
        className="p-4 text-center text-sm text-muted-foreground"
        animate={{ opacity: isOpen ? 1 : 0.7 }}
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="full-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              © {new Date().getFullYear()} ALLMAP
              <br />
              <span className="text-xs">Student Housing Platform</span>
            </motion.div>
          ) : (
            <motion.div
              key="short-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
            >
              {new Date().getFullYear()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};