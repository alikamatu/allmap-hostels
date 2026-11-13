"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  User,
  Calendar,
  Building,
  CreditCard,
  UserPlus,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
  Activity,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getActivityIcon,
  getActivityColor,
} from "@/lib/formatters";
import { RecentActivity as RecentActivityType } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivityProps {
  activities: RecentActivityType[];
  isLoading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Calendar,
  Building,
  CreditCard,
  UserPlus,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
  Activity,
};

const ACTIVITY_LINKS: Record<string, string> = {
  user: "/dashboard/users",
  booking: "/dashboard/bookings",
  payment: "/dashboard/payments",
  hostel: "/dashboard/verify",
};

export default function RecentActivity({
  activities,
  isLoading,
}: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="px-4 sm:px-5 py-3.5 flex items-center gap-3"
            >
              <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-950">
            Recent Platform Activity
          </h3>
          <p className="text-xs text-gray-500">
            Latest registrations, bookings & payments
          </p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
          {activities.length} {activities.length === 1 ? "event" : "events"}
        </span>
      </div>

      {!activities.length ? (
        <div className="p-10 text-center">
          <Activity className="w-7 h-7 mx-auto text-gray-300 mb-2" />
          <p className="text-xs font-medium text-gray-500">
            No recent platform activity recorded.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activities.map((activity, index) => {
            const iconName = getActivityIcon(activity.type, activity.action);
            const Icon = iconMap[iconName] || Activity;
            const colorClass = getActivityColor(activity.type);
            const href = ACTIVITY_LINKS[activity.type] || "/dashboard";
            const exactTime = format(
              new Date(activity.timestamp),
              "MMM d, h:mm a",
            );

            return (
              <motion.div
                key={`${activity.type}-${activity.id}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  delay: Math.min(index * 0.02, 0.15),
                }}
              >
                <Link
                  href={href}
                  className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                        {activity.user && (
                          <span className="text-[11px] text-gray-500 truncate max-w-[220px] sm:max-w-none">
                            {activity.user.email}
                          </span>
                        )}
                        {activity.metadata?.amount !== undefined && (
                          <span className="text-[11px] font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded">
                            {formatCurrency(Number(activity.metadata.amount))}
                          </span>
                        )}
                        {activity.metadata?.status && (
                          <span
                            className={`text-[11px] font-medium px-1.5 py-0.5 rounded capitalize ${
                              activity.metadata.status === "confirmed" ||
                              activity.metadata.status === "checked_in"
                                ? "bg-emerald-50 text-emerald-700"
                                : activity.metadata.status === "pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {String(activity.metadata.status).replace(
                              /_/g,
                              " ",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] font-medium text-gray-600 whitespace-nowrap">
                      {formatDate(activity.timestamp)}
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap hidden sm:block">
                      {exactTime}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
