"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Calendar,
  LogOut,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { cn } from "@repo/ui";

export interface UserDropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  dividerAbove?: boolean;
  badge?: string;
}

export interface UserDropdownProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
    imageUrl?: string;
  };
  onLogout?: () => void;
  extraItems?: UserDropdownItem[];
  className?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  onLogout,
  extraItems = [],
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation (Escape closes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const initial = (user.name ? user.name.charAt(0) : "U").toUpperCase();

  const defaultItems: UserDropdownItem[] = [
    {
      label: "Profile & Account",
      href: "/dashboard/profile",
      icon: UserIcon,
    },
    {
      label: "My Bookings",
      href: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      label: "Help & Support",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
    ...extraItems,
    {
      label: "Log Out",
      onClick: onLogout,
      icon: LogOut,
      destructive: true,
      dividerAbove: true,
    },
  ];

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-2.5 py-1.5 px-2.5 rounded-full",
          "hover:bg-gray-100/90 transition-all duration-200 outline-none select-none",
          isOpen && "bg-gray-100 shadow-sm ring-1 ring-gray-200",
        )}
      >
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold tracking-tight shadow-sm flex-shrink-0">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight pr-0.5">
          <span className="text-sm font-semibold text-black truncate max-w-[120px]">
            {user.name || "Student"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180 text-black",
          )}
        />
      </button>

      {/* Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-2 w-64 z-50",
              "bg-white border border-gray-200/90 rounded-2xl",
              "shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2",
              "focus:outline-none",
            )}
          >
            {/* Header with user info */}
            <div className="px-3.5 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-black truncate">
                  {user.name || "Student User"}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user.email || "student@allmap.com"}
                </p>
              </div>
            </div>

            {/* Navigation links & Actions */}
            <div className="py-1">
              {defaultItems.map((item, idx) => {
                const Icon = item.icon;
                const isDestructive = item.destructive;

                const content = (
                  <div
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer select-none",
                      isDestructive
                        ? "text-red-600 hover:bg-red-50 active:bg-red-100"
                        : "text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/70",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isDestructive ? "text-red-600" : "text-gray-500",
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );

                return (
                  <React.Fragment key={idx}>
                    {item.dividerAbove && (
                      <div className="my-1 border-t border-gray-100" />
                    )}
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          item.onClick?.();
                        }}
                        className="w-full text-left"
                      >
                        {content}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
