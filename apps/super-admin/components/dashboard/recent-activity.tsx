'use client';

import { motion } from 'framer-motion';
import { 
  User,
  Calendar,
  Building,
  CreditCard,
  UserPlus,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
  Activity
} from 'lucide-react';
import { formatDate, getActivityIcon, getActivityColor } from '@/lib/formatters';
import { RecentActivity as RecentActivityType } from '@/types/dashboard';

interface RecentActivityProps {
  activities: RecentActivityType[];
  isLoading?: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  User,
  Calendar,
  Building,
  CreditCard,
  UserPlus,
  CheckCircle,
  LogIn,
  LogOut,
  XCircle,
  Activity,
};

export default function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const recentActivities = activities.slice(0, 6);

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-12 font-semibold text-gray-900">RECENT ACTIVITY</h3>
          <span className="text-10 text-gray-500">Loading...</span>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-12 font-semibold text-gray-900">RECENT ACTIVITY</h3>
          <span className="text-10 text-gray-500">0 items</span>
        </div>
        <div className="p-8 text-center">
          <Activity size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-11 text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-12 font-semibold text-gray-900">RECENT ACTIVITY</h3>
        <span className="text-10 text-gray-500">{recentActivities.length} items</span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {recentActivities.map((activity, index) => {
          const iconName = getActivityIcon(activity.type, activity.action);
          const Icon = iconMap[iconName] || Activity;
          const colorClass = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex items-center justify-between py-3 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-shrink-0 mr-3">
                  <Icon size={14} className={colorClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span className="text-11 font-medium text-gray-900 truncate">
                      {activity.description}
                    </span>
                    {activity.user && (
                      <span className="text-10 text-gray-500 mt-0.5">
                        By: {activity.user.name} ({activity.user.email})
                      </span>
                    )}
                    {activity.metadata && (
                      <div className="flex items-center gap-2 mt-1">
                        {activity.metadata.amount && (
                          <span className="text-10 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            ₵{activity.metadata.amount}
                          </span>
                        )}
                        {activity.metadata.status && (
                          <span className={`text-10 px-1.5 py-0.5 rounded ${
                            activity.metadata.status === 'completed' ? 'bg-green-100 text-green-600' :
                            activity.metadata.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.metadata.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-3">
                <span className="text-10 text-gray-400 whitespace-nowrap">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 border-t border-gray-100"
      >
        <button className="w-full text-center">
          <span className="text-11 font-medium text-[#ff7a00] hover:text-orange-700">
            VIEW ALL ACTIVITY →
          </span>
        </button>
      </motion.div>
    </div>
  );
}