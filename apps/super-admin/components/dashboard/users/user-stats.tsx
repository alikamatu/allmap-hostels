"use client";

import { Users, CheckCircle2, Clock, Activity } from "lucide-react";
import { UserStats as UserStatsType } from "@/types/user.types";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStatsProps {
  stats: UserStatsType | null;
  loading?: boolean;
}

export default function UserStats({ stats, loading = false }: UserStatsProps) {
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
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const verificationRate =
    stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  const cards = [
    {
      title: "Total Users",
      value: stats.total.toLocaleString(),
      subtitle: `${stats.students} students · ${stats.hostel_admins} admins`,
      icon: Users,
      iconBg: "bg-orange-50 text-[#ff7a00]",
    },
    {
      title: "Verified Accounts",
      value: stats.verified.toLocaleString(),
      subtitle: `${verificationRate}% verification rate`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Unverified",
      value: stats.unverified.toLocaleString(),
      subtitle: `${stats.with_school} linked to a school`,
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      title: "Active Today",
      value: stats.active_today.toLocaleString(),
      subtitle: `${stats.super_admins} super admin${stats.super_admins === 1 ? "" : "s"}`,
      icon: Activity,
      iconBg: "bg-blue-50 text-blue-600",
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
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
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
