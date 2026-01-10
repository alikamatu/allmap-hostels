"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Clock, CheckCircle, 
  DollarSign, CreditCard, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  checkedOut: number;
  cancelled: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  occupancyRate: number;
}

interface BookingStatsCardsProps {
  stats: BookingStats | null | undefined;
  loading: boolean;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'orange';
  subtitle?: string;
}

const getDefaultStats = (): BookingStats => ({
  total: 0,
  pending: 0,
  confirmed: 0,
  checkedIn: 0,
  checkedOut: 0,
  cancelled: 0,
  totalRevenue: 0,
  paidRevenue: 0,
  pendingRevenue: 0,
  occupancyRate: 0,
});

const BookingStatsCards: React.FC<BookingStatsCardsProps> = ({ stats, loading }) => {
  const safeStats = stats || getDefaultStats();

  if (!loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-full bg-yellow-50 border border-yellow-200 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800 text-xs font-medium">
              Unable to load booking statistics. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Bookings',
      value: safeStats.total,
      icon: <Users className="h-3 w-3" />,
      color: 'orange',
      subtitle: 'All time bookings',
    },
    {
      title: 'Pending',
      value: safeStats.pending,
      icon: <Clock className="h-3 w-3" />,
      color: 'yellow',
      subtitle: 'Awaiting confirmation',
    },
    {
      title: 'Active',
      value: safeStats.checkedIn,
      icon: <CheckCircle className="h-3 w-3" />,
      color: 'green',
      subtitle: 'Currently staying',
    },
    {
      title: 'Revenue',
      value: formatCurrency(safeStats.paidRevenue),
      icon: <DollarSign className="h-3 w-3" />,
      color: 'blue',
      subtitle: `Total: ${formatCurrency(safeStats.totalRevenue)}`,
    },
  ];

  const getColorClasses = (color: StatCard['color']) => {
    const colorMap = {
      orange: {
        bg: 'bg-orange-600',
        light: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
      },
      blue: {
        bg: 'bg-blue-600',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-600',
        light: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
      },
      yellow: {
        bg: 'bg-yellow-600',
        light: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
      },
      red: {
        bg: 'bg-red-600',
        light: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
      },
      purple: {
        bg: 'bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
      },
      indigo: {
        bg: 'bg-indigo-600',
        light: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
      },
    };
    return colorMap[color];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 p-3">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 bg-gray-200"></div>
                <div className="w-10 h-3 bg-gray-200"></div>
              </div>
              <div className="w-16 h-5 bg-gray-200 mb-1"></div>
              <div className="w-20 h-2 bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((card, index) => {
        const colors = getColorClasses(card.color);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={`bg-white border ${colors.border} p-3 hover:border-gray-300 transition-colors duration-150`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 ${colors.light}`}>
                <div className={colors.text}>{card.icon}</div>
              </div>
              {card.trend && (
                <div className={`flex items-center text-xs font-medium ${
                  card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-2.5 w-2.5 mr-1 ${
                    !card.trend.isPositive ? 'transform rotate-180' : ''
                  }`} />
                  {Math.abs(card.trend.value)}%
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{card.title}</h3>
              <p className="text-base font-semibold text-gray-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
            </div>

            {card.title === 'Revenue' && safeStats.totalRevenue > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Collection Rate</span>
                  <span className="font-medium">
                    {((safeStats.paidRevenue / safeStats.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {card.title === 'Total Bookings' && safeStats.occupancyRate > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Occupancy Rate</span>
                  <span className="font-medium">{safeStats.occupancyRate}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(safeStats.occupancyRate, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-1 ${colors.bg}`}
                  ></motion.div>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BookingStatsCards;