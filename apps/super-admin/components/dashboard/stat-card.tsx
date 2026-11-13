"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Calendar,
  DollarSign,
  UserPlus,
  Home,
  Clock,
  CreditCard,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/lib/formatters";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  description: string;
  index?: number;
  icon?: string;
  format?: "currency" | "number" | "text";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Building,
  Calendar,
  DollarSign,
  UserPlus,
  Home,
  Clock,
  CreditCard,
};

const toneMap: Record<string, { bg: string; text: string }> = {
  Users: { bg: "bg-blue-50", text: "text-blue-600" },
  UserPlus: { bg: "bg-indigo-50", text: "text-indigo-600" },
  Building: { bg: "bg-emerald-50", text: "text-emerald-600" },
  Home: { bg: "bg-teal-50", text: "text-teal-600" },
  Calendar: { bg: "bg-purple-50", text: "text-purple-600" },
  Clock: { bg: "bg-amber-50", text: "text-amber-600" },
  DollarSign: { bg: "bg-orange-50", text: "text-[#ff7a00]" },
  CreditCard: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

export default function StatCard({
  title,
  value,
  change,
  description,
  index = 0,
  icon = "Users",
  format = "text",
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;
  const Icon = iconMap[icon] || Users;
  const tone = toneMap[icon] || { bg: "bg-gray-100", text: "text-gray-700" };

  let formattedValue = value;
  if (typeof value === "number") {
    if (format === "currency") {
      formattedValue = formatCurrency(value);
    } else if (format === "number") {
      formattedValue = formatNumber(value);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
      className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs hover:border-gray-300 transition-colors flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tone.bg}`}
        >
          <Icon className={`w-4 h-4 ${tone.text}`} />
        </div>
      </div>

      <div>
        <div className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight truncate">
          {formattedValue}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-xs text-gray-500 truncate">{description}</span>
          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {formatPercentage(change)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
