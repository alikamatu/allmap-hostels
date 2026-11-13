"use client";

import { CalendarCheck2, Users, CreditCard, BedDouble } from "lucide-react";
import { BookingStats as BookingStatsType } from "@/types/booking.types";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingStatsProps {
  stats: BookingStatsType | null;
  loading?: boolean;
}

export default function BookingStats({
  stats,
  loading = false,
}: BookingStatsProps) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      subtitle: `${stats.pendingBookings} pending · ${stats.cancelledBookings} cancelled`,
      icon: CalendarCheck2,
      iconBg: "bg-orange-50 text-[#ff7a00]",
    },
    {
      title: "Active Stays",
      value: stats.activeBookings.toLocaleString(),
      subtitle: `${stats.confirmedBookings} confirmed · ${stats.checkedInBookings} checked in`,
      icon: Users,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Collected Revenue",
      value: formatCurrency(stats.collectedRevenue),
      subtitle: `${formatCurrency(stats.pendingRevenue)} pending`,
      icon: CreditCard,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate.toFixed(1)}%`,
      subtitle: `${stats.cancellationRate.toFixed(1)}% cancellation rate`,
      icon: BedDouble,
      iconBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-gray-300/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <span className="text-xs font-medium text-gray-500 leading-tight">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
              {card.value}
            </div>
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
