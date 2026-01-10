'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Building, 
  GraduationCap,
  TrendingUp,
  Home,
  School,
  Clock
} from 'lucide-react';
import { UserStats as UserStatsType } from '@/types/user.types';
import { formatNumber, formatPercentage } from '@/lib/formatters';

interface UserStatsProps {
  stats: UserStatsType;
}

const statCards = [
  {
    key: 'total',
    title: 'Total Users',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    key: 'verified',
    title: 'Verified Users',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    key: 'unverified',
    title: 'Unverified Users',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    key: 'students',
    title: 'Students',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    key: 'hostel_admins',
    title: 'Hostel Admins',
    icon: Building,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    key: 'super_admins',
    title: 'Super Admins',
    icon: Shield,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    key: 'with_school',
    title: 'With School',
    icon: School,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    key: 'active_today',
    title: 'Active Today',
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
];

export default function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="bg-white p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 ${card.bgColor} rounded`}>
              <card.icon size={16} className={card.color} />
            </div>
            {card.key === 'active_today' && stats.growth_30d !== undefined && (
              <span className={`text-10 font-medium ${stats.growth_30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(stats.growth_30d)}
              </span>
            )}
          </div>
          <div className="text-20 font-semibold text-gray-900">
            {formatNumber(stats[card.key as keyof UserStatsType] as number)}
          </div>
          <div className="text-10 text-gray-500">{card.title}</div>
        </motion.div>
      ))}
    </div>
  );
}