"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  BookingsOverview,
  HostelsOverview,
  RevenueOverview,
  UsersOverview,
} from "@/types/dashboard";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewBreakdownsProps {
  bookingsOverview: BookingsOverview | null;
  usersOverview: UsersOverview | null;
  hostelsOverview: HostelsOverview | null;
  revenueOverview: RevenueOverview | null;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  checked_in: "#059669",
  confirmed: "#2563eb",
  pending: "#f59e0b",
  checked_out: "#64748b",
  cancelled: "#e11d48",
  no_show: "#9f1239",
};

const formatLabel = (raw: string) =>
  raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function OverviewBreakdowns({
  bookingsOverview,
  usersOverview,
  hostelsOverview,
  revenueOverview,
  isLoading,
}: OverviewBreakdownsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4"
          >
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const bookingStatusData = Object.entries(bookingsOverview?.byStatus || {})
    .map(([status, count]) => ({
      status,
      label: formatLabel(status),
      count,
      color: STATUS_COLORS[status] || "#475569",
    }))
    .sort((a, b) => b.count - a.count);

  const userRoles = Object.entries(usersOverview?.byRole || {}).sort(
    (a, b) => b[1] - a[1],
  );

  const paymentMethods = Object.entries(revenueOverview?.byMethod || {}).sort(
    (a, b) => b[1] - a[1],
  );
  const totalMethodRevenue = paymentMethods.reduce(
    (sum, [, amt]) => sum + amt,
    0,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Bookings by Status */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-950">
              Bookings by Status
            </h3>
            <p className="text-xs text-gray-500">
              {formatNumber(bookingsOverview?.total ?? 0)} all-time bookings
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
            {formatNumber(bookingsOverview?.monthly ?? 0)} this mo
          </span>
        </div>

        {bookingStatusData.length === 0 ? (
          <div className="flex-1 min-h-[180px] flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No bookings recorded yet.
          </div>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingStatusData}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={90}
                  tick={{ fontSize: 11, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]
                      .payload as (typeof bookingStatusData)[number];
                    return (
                      <div className="bg-gray-950 text-white px-2.5 py-1.5 rounded-lg text-xs">
                        <span className="font-semibold">{row.label}:</span>{" "}
                        {formatNumber(row.count)}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {bookingStatusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Users & Hostels Health */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col justify-between gap-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                Hostel Verification
              </h3>
              <p className="text-xs text-gray-500">
                {formatNumber(hostelsOverview?.verified ?? 0)} of{" "}
                {formatNumber(hostelsOverview?.total ?? 0)} properties verified
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {(hostelsOverview?.verificationRate ?? 0).toFixed(1)}%
            </span>
          </div>

          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(hostelsOverview?.verificationRate ?? 0, 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
            <span>
              Accepting bookings:{" "}
              <strong className="text-gray-800">
                {formatNumber(hostelsOverview?.acceptingBookings ?? 0)}
              </strong>
            </span>
            <span>
              Unverified:{" "}
              <strong className="text-gray-800">
                {formatNumber(
                  hostelsOverview?.byVerificationStatus?.unverified ?? 0,
                )}
              </strong>
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Users by Role
            </h4>
            <span className="text-[11px] text-gray-500">
              +{formatNumber(usersOverview?.weekly ?? 0)} this week
            </span>
          </div>
          {userRoles.length === 0 ? (
            <p className="text-xs text-gray-400">
              No user breakdown available.
            </p>
          ) : (
            <div className="space-y-2">
              {userRoles.map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600">{formatLabel(role)}</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(count)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Monthly Revenue by Payment Method */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-950">
              Monthly Payment Methods
            </h3>
            <p className="text-xs text-gray-500">
              {formatCurrency(revenueOverview?.total ?? 0)} this month
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
            Prev: {formatCurrency(revenueOverview?.previous ?? 0)}
          </span>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="flex-1 min-h-[160px] flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No payments recorded this month.
          </div>
        ) : (
          <div className="space-y-3.5 my-auto">
            {paymentMethods.map(([method, amount]) => {
              const pct =
                totalMethodRevenue > 0
                  ? (amount / totalMethodRevenue) * 100
                  : 0;
              return (
                <div key={method}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">
                      {formatLabel(method)}
                    </span>
                    <span className="font-semibold text-gray-950">
                      {formatCurrency(amount)}{" "}
                      <span className="text-[11px] font-normal text-gray-400">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff7a00] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
