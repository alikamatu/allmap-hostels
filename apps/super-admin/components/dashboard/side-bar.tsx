"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  Wallet,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/users", icon: Users, label: "Users" },
  { href: "/dashboard/bookings", icon: CalendarCheck, label: "Bookings" },
  { href: "/dashboard/verify", icon: ClipboardCheck, label: "Verifications" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Payments" },
  { href: "/dashboard/payouts", icon: Wallet, label: "Agent Payouts" },
  { href: "/dashboard/feedback", icon: MessageSquare, label: "Support" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, isCollapsed, toggleCollapsed } =
    useSidebar();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  const renderNavLinks = (isMobileDrawer: boolean) => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobileDrawer) setMobileOpen(false);
            }}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-[#ff7a00]/10 text-[#ff7a00]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } ${!isMobileDrawer && isCollapsed ? "justify-center px-2" : ""}`}
            title={!isMobileDrawer && isCollapsed ? item.label : undefined}
          >
            <item.icon
              className={`w-4 h-4 flex-shrink-0 ${
                isActive
                  ? "text-[#ff7a00]"
                  : "text-gray-500 group-hover:text-gray-900"
              }`}
            />
            {(isMobileDrawer || !isCollapsed) && (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderUserFooter = (isMobileDrawer: boolean) => (
    <div className="border-t border-gray-100 p-3">
      <div
        className={`flex items-center ${
          !isMobileDrawer && isCollapsed
            ? "justify-center"
            : "justify-between gap-2"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          {(isMobileDrawer || !isCollapsed) && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {user?.email || "Admin Session"}
              </p>
            </div>
          )}
        </div>
        {(isMobileDrawer || !isCollapsed) && (
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-gray-200/80 transition-all duration-200 flex-shrink-0 ${
          isCollapsed ? "w-[70px]" : "w-60"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#ff7a00] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              A
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold tracking-tight text-gray-900 truncate">
                ALLMAP ADMIN
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {renderNavLinks(false)}
        {renderUserFooter(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 flex flex-col shadow-xl lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#ff7a00] flex items-center justify-center text-white font-bold text-xs">
                    A
                  </div>
                  <span className="text-sm font-bold tracking-tight text-gray-900">
                    ALLMAP ADMIN
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavLinks(true)}
              {renderUserFooter(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
