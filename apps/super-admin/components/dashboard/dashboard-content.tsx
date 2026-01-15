'use client';

import { motion } from 'framer-motion';
import StatCard from './stat-card';
import RecentActivity from './recent-activity';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import AnalyticsChart from './analytics-chart';

export default function DashboardContent() {
  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { activities, isLoading: activitiesLoading } = useRecentActivities(10);

  if (statsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-11 font-medium text-red-600">Error loading dashboard data</p>
          <p className="text-10 text-red-500 mt-1">{statsError}</p>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: stats.userGrowth,
      description: 'Registered users',
      icon: 'Users',
      format: 'number' as const,
    },
    {
      title: 'Verified Hostels',
      value: stats.verifiedHostels,
      description: 'Active properties',
      icon: 'Building',
      format: 'number' as const,
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      change: stats.bookingGrowth,
      description: 'Current stays',
      icon: 'Calendar',
      format: 'number' as const,
    },
    {
      title: 'Monthly Revenue',
      value: stats.revenueThisMonth,
      change: stats.revenueGrowth,
      description: 'This month',
      icon: 'DollarSign',
      format: 'currency' as const,
    },
    {
      title: 'New Users Today',
      value: stats.newUsersToday,
      description: 'Recent registrations',
      icon: 'UserPlus',
      format: 'number' as const,
    },
    {
      title: 'Total Hostels',
      value: stats.totalHostels,
      description: 'All properties',
      icon: 'Home',
      format: 'number' as const,
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      description: 'All-time bookings',
      icon: 'Clock',
      format: 'number' as const,
    },
    {
      title: 'Completed Payments',
      value: stats.completedPayments,
      description: 'Successful transactions',
      icon: 'CreditCard',
      format: 'number' as const,
    },
  ] : [];

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 overflow-y-auto"
    >
      <div className="p-6">
        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-12 font-semibold text-gray-700 mb-4">PLATFORM OVERVIEW</h2>
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>

        {/* Analytics Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-12 font-semibold text-gray-700">REVENUE ANALYTICS</h2>
            <span className="text-10 text-gray-500">Last 30 days</span>
          </div>
          <AnalyticsChart />
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-12 font-semibold text-gray-700 mb-4">RECENT ACTIVITY</h2>
          <RecentActivity activities={activities} isLoading={activitiesLoading} />
        </div>
      </div>
    </motion.main>
  );
}