"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { BarChart3, TrendingUp } from "lucide-react";
import { AnalyticsTimeseries } from "@/types/dashboard";
import { AnalyticsDays } from "@/hooks/useDashboardOverview";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsChartProps {
  timeseries: AnalyticsTimeseries | null;
  days: AnalyticsDays;
  onDaysChange: (days: AnalyticsDays) => void;
  isLoading: boolean;
  isChartLoading: boolean;
}

type MetricKey = "revenue" | "bookings" | "users";

const PERIOD_OPTIONS: { value: AnalyticsDays; label: string }[] = [
  { value: 7, label: "7D" },
  { value: 14, label: "14D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

const METRIC_META: Record<
  MetricKey,
  { label: string; color: string; gradientId: string }
> = {
  revenue: {
    label: "Revenue",
    color: "#ff7a00",
    gradientId: "revenueGradient",
  },
  bookings: {
    label: "Bookings",
    color: "#2563eb",
    gradientId: "bookingsGradient",
  },
  users: {
    label: "New Users",
    color: "#059669",
    gradientId: "usersGradient",
  },
};

export default function AnalyticsChart({
  timeseries,
  days,
  onDaysChange,
  isLoading,
  isChartLoading,
}: AnalyticsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("revenue");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const chartData = useMemo(() => {
    if (!timeseries?.series) return [];
    return timeseries.series.map((point) => {
      const parsed = parseISO(point.date);
      return {
        ...point,
        shortDate: format(parsed, "MMM d"),
        fullDate: format(parsed, "EEE, MMM d, yyyy"),
      };
    });
  }, [timeseries]);

  const dateRangeLabel = useMemo(() => {
    if (!timeseries?.startDate || !timeseries?.endDate) return "";
    return `${format(parseISO(timeseries.startDate), "MMM d, yyyy")} – ${format(
      parseISO(timeseries.endDate),
      "MMM d, yyyy",
    )}`;
  }, [timeseries]);

  const periodTotal = useMemo(() => {
    if (!timeseries?.totals) return 0;
    return timeseries.totals[selectedMetric];
  }, [timeseries, selectedMetric]);

  const meta = METRIC_META[selectedMetric];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-36 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-64 sm:h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-gray-950">
              {meta.label} Over Time
            </h2>
            {dateRangeLabel && (
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {dateRangeLabel}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              {selectedMetric === "revenue"
                ? formatCurrency(periodTotal)
                : formatNumber(periodTotal)}
            </span>
            <span className="text-xs text-gray-500">
              {selectedMetric === "revenue"
                ? `collected in last ${days} days`
                : selectedMetric === "bookings"
                  ? `bookings in last ${days} days`
                  : `registrations in last ${days} days`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Switcher */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            {(["revenue", "bookings", "users"] as MetricKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedMetric === key
                    ? "bg-white text-gray-950 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {METRIC_META[key].label}
              </button>
            ))}
          </div>

          {/* Days Selector */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDaysChange(opt.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  days === opt.value
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg transition-all ${
                chartType === "area"
                  ? "bg-white text-gray-950 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Area chart"
              aria-label="Area chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg transition-all ${
                chartType === "bar"
                  ? "bg-white text-gray-950 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Bar chart"
              aria-label="Bar chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div
        className={`h-64 sm:h-72 w-full transition-opacity ${isChartLoading ? "opacity-50" : "opacity-100"}`}
      >
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No data recorded for this date range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={meta.gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={meta.color}
                      stopOpacity={0.22}
                    />
                    <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={(val) =>
                    selectedMetric === "revenue"
                      ? val >= 1000
                        ? `₵${(val / 1000).toFixed(1)}k`
                        : `₵${val}`
                      : String(val)
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]
                      .payload as (typeof chartData)[number];
                    const val = item[selectedMetric];
                    return (
                      <div className="bg-gray-950 text-white px-3 py-2 rounded-xl shadow-lg text-xs">
                        <div className="text-gray-300 font-medium mb-0.5">
                          {item.fullDate}
                        </div>
                        <div className="font-bold text-sm">
                          {selectedMetric === "revenue"
                            ? formatCurrency(val)
                            : `${formatNumber(val)} ${
                                selectedMetric === "bookings"
                                  ? "bookings"
                                  : "users"
                              }`}
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={meta.color}
                  strokeWidth={2.2}
                  fill={`url(#${meta.gradientId})`}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={(val) =>
                    selectedMetric === "revenue"
                      ? val >= 1000
                        ? `₵${(val / 1000).toFixed(1)}k`
                        : `₵${val}`
                      : String(val)
                  }
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]
                      .payload as (typeof chartData)[number];
                    const val = item[selectedMetric];
                    return (
                      <div className="bg-gray-950 text-white px-3 py-2 rounded-xl shadow-lg text-xs">
                        <div className="text-gray-300 font-medium mb-0.5">
                          {item.fullDate}
                        </div>
                        <div className="font-bold text-sm">
                          {selectedMetric === "revenue"
                            ? formatCurrency(val)
                            : `${formatNumber(val)} ${
                                selectedMetric === "bookings"
                                  ? "bookings"
                                  : "users"
                              }`}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey={selectedMetric}
                  fill={meta.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
