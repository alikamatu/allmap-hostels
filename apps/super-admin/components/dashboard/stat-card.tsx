'use client';

import { motion } from 'framer-motion';
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
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  description: string;
  index?: number;
  icon?: string;
  format?: 'currency' | 'number' | 'text';
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Users,
  Building,
  Calendar,
  DollarSign,
  UserPlus,
  Home,
  Clock,
  CreditCard,
};

export default function StatCard({ 
  title, 
  value, 
  change,
  description, 
  index = 0,
  icon = 'Users',
  format = 'text'
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;
  const Icon = iconMap[icon] || Users;

  let formattedValue = value;
  if (typeof value === 'number') {
    if (format === 'currency') {
      formattedValue = formatCurrency(value);
    } else if (format === 'number') {
      formattedValue = formatNumber(value);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ opacity: 0.9 }}
      className="bg-white p-5"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-11 font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </h3>
          <div className="flex items-baseline">
            <span className="text-24 font-semibold text-gray-900 mr-2">
              {formattedValue}
            </span>
            {change !== undefined && (
              <div className="flex items-center">
                {isPositive ? (
                  <TrendingUp size={12} className="text-green-600 mr-1" />
                ) : (
                  <TrendingDown size={12} className="text-red-600 mr-1" />
                )}
                <span className={`text-11 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(change)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-2 ${getBackgroundColor(title)}`}>
          <Icon className={getIconColor(title)} />
        </div>
      </div>
      <p className="text-10 text-gray-400">{description}</p>
    </motion.div>
  );
}

function getBackgroundColor(title: string) {
  const colors: Record<string, string> = {
    'Total Users': 'bg-blue-50',
    'New Users Today': 'bg-indigo-50',
    'Verified Hostels': 'bg-green-50',
    'Total Hostels': 'bg-teal-50',
    'Active Bookings': 'bg-purple-50',
    'Total Bookings': 'bg-violet-50',
    'Monthly Revenue': 'bg-orange-50',
    'Total Revenue': 'bg-amber-50',
    'Pending Payments': 'bg-red-50',
    'Completed Payments': 'bg-emerald-50',
  };
  return colors[title] || 'bg-gray-50';
}

function getIconColor(title: string) {
  const colors: Record<string, string> = {
    'Total Users': 'text-blue-600',
    'New Users Today': 'text-indigo-600',
    'Verified Hostels': 'text-green-600',
    'Total Hostels': 'text-teal-600',
    'Active Bookings': 'text-purple-600',
    'Total Bookings': 'text-violet-600',
    'Monthly Revenue': 'text-orange-600',
    'Total Revenue': 'text-amber-600',
    'Pending Payments': 'text-red-600',
    'Completed Payments': 'text-emerald-600',
  };
  return colors[title] || 'text-gray-600';
}