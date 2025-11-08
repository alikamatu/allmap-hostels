"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Clock, CheckCircle, 
  DollarSign, CreditCard, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import Swal from 'sweetalert2';

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
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
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
  React.useEffect(() => {
  }, [stats, loading]);

  const safeStats = stats || getDefaultStats();

  const handleActionClick = (title: string) => {
    Swal.fire({
      title: `${title} Action`,
      text: `Would you like to proceed to ${title.toLowerCase()} management?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#1a73e8',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Proceed',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 font-medium',
        cancelButton: 'px-4 py-2 font-medium',
      },
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };

  if (!loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-yellow-50 border border-yellow-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800 text-sm font-medium">
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
      icon: <Users className="h-6 w-6" />,
      color: 'blue',
      subtitle: 'All time bookings',
    },
    {
      title: 'Pending',
      value: safeStats.pending,
      icon: <Clock className="h-6 w-6" />,
      color: 'yellow',
      subtitle: 'Awaiting confirmation',
      action: safeStats.pending > 0 ? {
        label: 'Review Pending →',
        onClick: () => handleActionClick('Pending'),
      } : undefined,
    },
    {
      title: 'Active (Checked In)',
      value: safeStats.checkedIn,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green',
      subtitle: 'Currently staying',
    },
    {
      title: 'Completed',
      value: safeStats.checkedOut,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'indigo',
      subtitle: 'Successfully completed',
    },
  ];

  const getColorClasses = (color: StatCard['color']) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-600',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
      },
      green: {
        bg: 'bg-green-600',
        light: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-100',
      },
      yellow: {
        bg: 'bg-yellow-600',
        light: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-100',
      },
      red: {
        bg: 'bg-red-600',
        light: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-100',
      },
      purple: {
        bg: 'bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-100',
      },
      indigo: {
        bg: 'bg-indigo-600',
        light: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-100',
      },
    };
    return colorMap[color];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const colors = getColorClasses(card.color);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-sm p-6 border ${colors.border} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colors.light}`}>
                <div className={colors.text}>{card.icon}</div>
              </div>
              {card.trend && (
                <div className={`flex items-center text-sm font-medium ${
                  card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-4 w-4 mr-1 ${
                    !card.trend.isPositive ? 'transform rotate-180' : ''
                  }`} />
                  {Math.abs(card.trend.value)}%
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
            </div>

            {card.title.includes('Revenue') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Collection Rate</span>
                  <span className="font-medium">
                    {safeStats.totalRevenue > 0 
                      ? ((safeStats.paidRevenue / safeStats.totalRevenue) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            )}

            {card.title === 'Occupancy Rate' && safeStats.occupancyRate > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(safeStats.occupancyRate, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-2.5 rounded-full ${colors.bg}`}
                  ></motion.div>
                </div>
              </div>
            )}

            {card.action && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={card.action.onClick}
                  className={`text-xs font-medium ${colors.text} hover:${colors.text.replace('600', '700')} transition-colors`}
                >
                  {card.action.label}
                </button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default BookingStatsCards;