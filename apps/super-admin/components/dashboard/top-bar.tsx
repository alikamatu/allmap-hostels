"use client";

import { usePathname } from "next/navigation";
import { Menu, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Platform Overview",
    subtitle: "Live analytics & operations",
  },
  "/dashboard/users": {
    title: "User Management",
    subtitle: "Students, hostel admins & staff",
  },
  "/dashboard/bookings": {
    title: "Bookings",
    subtitle: "Reservations & check-ins",
  },
  "/dashboard/verify": {
    title: "Verifications",
    subtitle: "Hostel & admin review queue",
  },
  "/dashboard/payments": {
    title: "Payments & Access",
    subtitle: "Transactions & preview access",
  },
  "/dashboard/payouts": {
    title: "Agent Payouts",
    subtitle: "Commissions & disbursements",
  },
  "/dashboard/feedback": {
    title: "Support & Feedback",
    subtitle: "Student inquiries & reports",
  },
};

export default function TopBar({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}: TopBarProps) {
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const { user } = useAuth();

  const matched = ROUTE_TITLES[pathname] ||
    Object.entries(ROUTE_TITLES).find(
      ([path]) => path !== "/dashboard" && pathname.startsWith(path),
    )?.[1] || { title: "Super Admin", subtitle: "AllMap Hostels" };

  const displayTitle = title || matched.title;
  const displaySubtitle = subtitle || matched.subtitle;
  const todayLabel = format(new Date(), "EEE, MMM d, yyyy");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-30 flex-shrink-0">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden p-2 -ml-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-950 truncate">
              {displayTitle}
            </h1>
            <p className="text-[11px] text-gray-500 truncate">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Right: Real Date, Optional Refresh, Admin Badge */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-medium text-gray-600">
            {todayLabel}
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#ff7a00]" : ""}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing" : "Refresh"}
              </span>
            </button>
          )}

          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-tight">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight">
                {user?.email || "Administrator"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
