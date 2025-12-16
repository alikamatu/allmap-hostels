'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { AccessStats as AccessStatsType } from '@/types/access.types';
import { formatNumber, formatCurrency } from '@/lib/formatters';

interface AccessStatsProps {
  stats: AccessStatsType;
}

export default function AccessStats({ stats }: AccessStatsProps) {
  const statCards = [
    {
      key: 'activeAccess',
      title: 'Active Access',
      value: stats.activeAccess,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Currently active subscriptions',
    },
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue, 'USD'),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Estimated total revenue',
    },
    {
      key: 'usersWithAccess',
      title: 'Users with Access',
      value: stats.usersWithAccess,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Users who have active access',
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'User conversion rate',
    },
    {
      key: 'upcomingExpiry',
      title: 'Expiring Soon',
      value: stats.upcomingExpiry,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Access expiring in 30 days',
    },
    {
      key: 'estimatedMonthlyRecurringRevenue',
      title: 'Monthly MRR',
      value: formatCurrency(stats.estimatedMonthlyRecurringRevenue, 'USD'),
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Estimated monthly recurring',
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
          className="bg-white p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 ${card.bgColor} rounded`}>
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