"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import TopBar from "./top-bar";
import StatCard from "./stat-card";
import AnalyticsChart from "./analytics-chart";
import OverviewBreakdowns from "./overview-breakdowns";
import AgentPayoutsSummary from "./agent-payouts-summary";
import RecentActivity from "./recent-activity";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardContent() {
  const {
    stats,
    timeseries,
    usersOverview,
    bookingsOverview,
    hostelsOverview,
    revenueOverview,
    activities,
    days,
    setDays,
    isLoading,
    isChartLoading,
    isRefreshing,
    error,
    refetch,
  } = useDashboardOverview(30);

  const statCards = stats
    ? [
        {
          title: "Total Users",
          value: stats.totalUsers,
          change: stats.userGrowth,
          description: "Registered accounts",
          icon: "Users",
          format: "number" as const,
        },
        {
          title: "Verified Hostels",
          value: stats.verifiedHostels,
          description: `of ${stats.totalHostels} total properties`,
          icon: "Building",
          format: "number" as const,
        },
        {
          title: "Active Bookings",
          value: stats.activeBookings,
          change: stats.bookingGrowth,
          description: "Confirmed & checked in",
          icon: "Calendar",
          format: "number" as const,
        },
        {
          title: "Monthly Revenue",
          value: stats.revenueThisMonth,
          change: stats.revenueGrowth,
          description: `All-time: ₵${stats.totalRevenue.toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}`,
          icon: "DollarSign",
          format: "currency" as const,
        },
        {
          title: "New Users Today",
          value: stats.newUsersToday,
          description: "Registered today",
          icon: "UserPlus",
          format: "number" as const,
        },
        {
          title: "Total Hostels",
          value: stats.totalHostels,
          description: "Listed properties",
          icon: "Home",
          format: "number" as const,
        },
        {
          title: "Total Bookings",
          value: stats.totalBookings,
          description: "All-time reservations",
          icon: "Clock",
          format: "number" as const,
        },
        {
          title: "Completed Payments",
          value: stats.completedPayments ?? 0,
          description: `${stats.pendingPayments ?? 0} pending payment`,
          icon: "CreditCard",
          format: "number" as const,
        },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onRefresh={refetch} isRefreshing={isRefreshing} />

      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6 sm:space-y-8"
      >
        {error && !stats ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Failed to load overview metrics
                </p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : null}

        {/* KPI Cards */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Platform Metrics
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                  </div>
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((card, index) => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  change={card.change}
                  description={card.description}
                  index={index}
                  icon={card.icon}
                  format={card.format}
                />
              ))}
            </div>
          )}
        </section>

        {/* Real Time-Series Analytics Chart */}
        <section>
          <AnalyticsChart
            timeseries={timeseries}
            days={days}
            onDaysChange={setDays}
            isLoading={isLoading}
            isChartLoading={isChartLoading}
          />
        </section>

        {/* Real Operational Breakdowns */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Operational Breakdown
            </h2>
          </div>
          <OverviewBreakdowns
            bookingsOverview={bookingsOverview}
            usersOverview={usersOverview}
            hostelsOverview={hostelsOverview}
            revenueOverview={revenueOverview}
            isLoading={isLoading}
          />
        </section>

        {/* Agent Payouts Summary */}
        <AgentPayoutsSummary />

        {/* Recent Activity */}
        <section className="pb-4">
          <RecentActivity activities={activities} isLoading={isLoading} />
        </section>
      </motion.main>
    </div>
  );
}
