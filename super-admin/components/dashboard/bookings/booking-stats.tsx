'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  Home,
  Bed,
} from 'lucide-react';
import { BookingStats as BookingStatsType } from '@/types/booking.types';
import { formatCurrency } from '@/lib/formatters';

interface BookingStatsProps {
  stats: BookingStatsType;
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statCards = [
    {
      key: 'totalBookings',
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All bookings',
    },
    {
      key: 'activeBookings',
      title: 'Active',
      value: stats.activeBookings,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Confirmed & Checked-in',
    },
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'All-time revenue',
    },
    {
      key: 'occupancyRate',
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: Bed,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Room occupancy',
    },
    {
      key: 'collectedRevenue',
      title: 'Collected Revenue',
      value: formatCurrency(stats.collectedRevenue),
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Revenue collected',
    },
    {
      key: 'cancellationRate',
      title: 'Cancellation Rate',
      value: `${stats.cancellationRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Booking cancellations',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="bg-white p-4 rounded-lg verified_atborder border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 ${card.bgColor} rounded-lg`}>
              <card.icon size={16} className={card.color} />
            </div>
          </div>
          <div className="text-20 font-semibold text-gray-900">{card.value}</div>
          <div className="text-11 text-gray-500 mt-1">{card.title}</div>
          <div className="text-10 text-gray-400 mt-1">{card.description}</div>
        </motion.div>
      ))}
    </div>
  );
}