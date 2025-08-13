import React from 'react';
import { 
  Users, Clock, CheckCircle, XCircle, 
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
  stats: BookingStats;
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
}

const BookingStatsCards: React.FC<BookingStatsCardsProps> = ({ stats, loading }) => {
  const statCards: StatCard[] = [
    {
      title: 'Total Bookings',
      value: stats.total,
      icon: <Users className="h-6 w-6" />,
      color: 'blue',
      subtitle: 'All time bookings'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock className="h-6 w-6" />,
      color: 'yellow',
      subtitle: 'Awaiting confirmation'
    },
    {
      title: 'Active (Checked In)',
      value: stats.checkedIn,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green',
      subtitle: 'Currently staying'
    },
    {
      title: 'Completed',
      value: stats.checkedOut,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'indigo',
      subtitle: 'Successfully completed'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green',
      subtitle: 'All bookings combined'
    },
    {
      title: 'Collected',
      value: formatCurrency(stats.paidRevenue),
      icon: <CreditCard className="h-6 w-6" />,
      color: 'blue',
      subtitle: 'Successfully collected'
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.pendingRevenue),
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'red',
      subtitle: 'Pending payments'
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple',
      subtitle: 'Current occupancy'
    }
  ];

  const getColorClasses = (color: StatCard['color']) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-500',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-500',
        light: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      yellow: {
        bg: 'bg-yellow-500',
        light: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      red: {
        bg: 'bg-red-500',
        light: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200'
      },
      purple: {
        bg: 'bg-purple-500',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200'
      },
      indigo: {
        bg: 'bg-indigo-500',
        light: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200'
      }
    };
    return colorMap[color];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
          <div
            key={index}
            className={`bg-white rounded-lg shadow-sm p-6 border ${colors.border} hover:shadow-md transition-shadow`}
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

            {/* Additional context for revenue cards */}
            {card.title.includes('Revenue') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Collection Rate</span>
                  <span className="font-medium">
                    {stats.totalRevenue > 0 
                      ? ((stats.paidRevenue / stats.totalRevenue) * 100).toFixed(1)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            )}

            {/* Additional context for occupancy */}
            {card.title === 'Occupancy Rate' && stats.occupancyRate > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className={`w-full bg-gray-200 rounded-full h-2`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Quick actions for certain cards */}
            {(card.title === 'Pending' && stats.pending > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Review Pending →
                </button>
              </div>
            )}

            {(card.title === 'Outstanding' && stats.pendingRevenue > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-xs text-red-600 hover:text-red-700 font-medium">
                  Follow Up →
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookingStatsCards;