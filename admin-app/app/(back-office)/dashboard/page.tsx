"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Bed, 
  Calendar, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  MapPin,
  Star,
  ArrowRight,
  Settings,
  History
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiCallOptions extends RequestInit {
    headers?: Record<string, string>;
}

const apiCall = async <T = any>(endpoint: string, options: ApiCallOptions = {}): Promise<T> => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
};

// Dashboard Components
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    onClick={onClick}
    className={`bg-white p-4 border border-gray-200 hover:border-[#FF6A00] transition-all duration-150 ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center mt-1">
            <TrendingUp className={`w-3 h-3 mr-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className="p-2 bg-gray-50">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
    </div>
  </motion.div>
);

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="bg-white p-4 border border-gray-200 hover:border-[#FF6A00] transition-all duration-150 cursor-pointer group"
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-50 group-hover:bg-[#FF6A00] group-hover:text-white transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FF6A00] transition-colors" />
    </div>
  </motion.div>
);

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ title, description, icon: Icon, href, isActive }) => {
  const router = useRouter();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(href)}
      className={`p-4 border transition-all duration-150 cursor-pointer ${
        isActive 
          ? 'border-[#FF6A00] bg-[#FF6A00] text-white' 
          : 'border-gray-200 bg-white hover:border-[#FF6A00]'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 ${
          isActive ? 'bg-white text-[#FF6A00]' : 'bg-gray-50 text-gray-600'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-xs ${isActive ? 'text-white' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const RecentBookingRow = ({ booking }: { booking: Booking }) => {
  const router = useRouter();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => router.push(`/dashboard/booking-management`)}
      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center group-hover:bg-[#FF6A00] group-hover:text-white transition-colors">
          <Users className="w-3 h-3" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 group-hover:text-[#FF6A00] transition-colors">
            {booking.studentName}
          </p>
          <p className="text-xs text-gray-500">Room {booking.room?.roomNumber}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`inline-flex items-center px-2 py-1 text-xs font-medium ${
          booking.status === 'confirmed' ? 'bg-green-50 text-green-700' :
          booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
          booking.status === 'checked_in' ? 'bg-blue-50 text-blue-700' :
          'bg-gray-50 text-gray-700'
        }`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          GHS {booking.totalAmount}
        </p>
      </div>
    </motion.div>
  );
};

interface Hostel {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
  accepting_bookings: boolean;
  base_price: number;
  rating?: number;
  phone?: string;
}

interface RecentBooking extends Booking {
  createdAt: string;
}

interface DashboardData {
  stats: {
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    totalRooms: number;
    availableRooms: number;
  };
  recentBookings: RecentBooking[];
  hostels: Hostel[];
}

const Dashboard = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalBookings: 0,
      activeBookings: 0,
      totalRevenue: 0,
      occupancyRate: 0,
      totalRooms: 0,
      availableRooms: 0
    },
    recentBookings: [],
    hostels: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const navigationItems = [
    { 
      title: 'Bookings', 
      description: 'Manage all bookings', 
      icon: Calendar, 
      href: '/dashboard/booking-management',
      isActive: true
    },
    { 
      title: 'Hostels', 
      description: 'Manage your properties', 
      icon: Building, 
      href: '/dashboard/manage-hostels' 
    },
    { 
      title: 'Rooms', 
      description: 'Room configuration', 
      icon: Bed, 
      href: '/dashboard/manage-room' 
    },
    { 
      title: 'History', 
      description: 'Booking history', 
      icon: History, 
      href: '/dashboard/booking-history' 
    },
    { 
      title: 'Settings', 
      description: 'Account settings', 
      icon: Settings, 
      href: '/dashboard/settings' 
    },
  ];

  const quickActions = [
    {
      title: "Add New Hostel",
      description: "Register a new hostel property",
      icon: Building,
      onClick: () => router.push('/dashboard/manage-hostels?action=create')
    },
    {
      title: "Create Booking",
      description: "Make a new booking for a student",
      icon: Plus,
      onClick: () => router.push('/dashboard/booking-management?action=create')
    },
    {
      title: "Manage Rooms",
      description: "Update room availability and status",
      icon: Bed,
      onClick: () => router.push('/dashboard/manage-room')
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const hostelsResponse = await apiCall('/hostels/fetch');
        const hostels = hostelsResponse || [];
        
        if (hostels.length === 0) {
          setDashboardData({
            stats: {
              totalBookings: 0,
              activeBookings: 0,
              totalRevenue: 0,
              occupancyRate: 0,
              totalRooms: 0,
              availableRooms: 0
            },
            recentBookings: [],
            hostels: []
          });
          setLoading(false);
          return;
        }

        let totalBookings = 0;
        let activeBookings = 0;
        let totalRevenue = 0;
        let recentBookings = [];

        for (const hostel of hostels) {
          try {
            const bookingsResponse = await apiCall(`/bookings/hostel/${hostel.id}`);
            const hostelBookings = bookingsResponse || [];
            
            totalBookings += hostelBookings.length;
            activeBookings += hostelBookings.filter((b: Booking) =>
              ['confirmed', 'checked_in'].includes(b.status)
            ).length;
            totalRevenue += hostelBookings.reduce(
              (sum: number, b: Booking) => sum + parseFloat(String(b.totalAmount ?? "0")), 
              0
            );
            
            const recent: RecentBooking[] = (hostelBookings as RecentBooking[])
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5);
            recentBookings.push(...recent);
          } catch (hostelError) {
            console.warn(`Failed to fetch bookings for hostel ${hostel.id}:`, hostelError);
          }
        }

        recentBookings = recentBookings
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        let totalRooms = 0;
        let availableRooms = 0;

        for (const hostel of hostels) {
          try {
            const roomsResponse = await apiCall(`/rooms/hostel/${hostel.id}`);
            const hostelRooms = roomsResponse || [];
            
            totalRooms += hostelRooms.length;
            availableRooms += hostelRooms.filter((r: { status: string }) => r.status === 'available').length;
          } catch (roomError) {
            console.warn(`Failed to fetch rooms for hostel ${hostel.id}:`, roomError);
          }
        }

        const occupancyRate = totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0;

        setDashboardData({
          stats: {
            totalBookings,
            activeBookings,
            totalRevenue,
            occupancyRate,
            totalRooms,
            availableRooms
          },
          recentBookings,
          hostels
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-gray-200"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-80 bg-gray-200"></div>
              <div className="h-80 bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-xs text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-[#FF6A00] text-white text-sm hover:bg-[#E55E00] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Dashboard Overview</h1>
              <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your hostels today.</p>
            </div>
            </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavigationCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={Icon}
                href={item.href}
                isActive={item.isActive}
              />
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Bookings"
            value={dashboardData.stats.totalBookings}
            icon={Calendar}
            onClick={() => router.push('/dashboard/booking-management')}
          />
          <StatCard
            title="Active Bookings"
            value={dashboardData.stats.activeBookings}
            icon={CheckCircle}
            onClick={() => router.push('/dashboard/booking-management?filter=active')}
          />
          <StatCard
            title="Occupancy Rate"
            value={`${dashboardData.stats.occupancyRate.toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Recent Bookings & Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recent Bookings */}
            <div className="bg-white border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Recent Bookings</h2>
                  <button 
                    onClick={() => router.push('/dashboard/booking-management')}
                    className="text-[#FF6A00] text-xs font-medium hover:text-[#E55E00] transition-colors"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-4">
                {dashboardData.recentBookings.length > 0 ? (
                  <div>
                    {dashboardData.recentBookings.map((booking, index) => (
                      <RecentBookingRow key={booking.id || index} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => router.push('/dashboard/booking-management?action=create')}
                    className="text-center py-8 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No recent bookings found</p>
                    <p className="text-xs text-[#FF6A00] mt-1">Create your first booking</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Quick Actions</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <QuickActionCard
                      key={action.title}
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      onClick={action.onClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Room Statistics */}
            <div className="bg-white border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Room Overview</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Total Rooms</span>
                    <span className="text-sm font-semibold">{dashboardData.stats.totalRooms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Available</span>
                    <span className="text-sm font-semibold text-green-600">{dashboardData.stats.availableRooms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Occupied</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {dashboardData.stats.totalRooms - dashboardData.stats.availableRooms}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/dashboard/manage-room')}
                  className="w-full mt-4 py-2 bg-gray-50 hover:bg-[#FF6A00] hover:text-white text-xs font-medium transition-colors"
                >
                  Manage All Rooms
                </button>
              </div>
            </div>

            {/* Your Hostels Summary */}
            <div className="bg-white border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Your Hostels</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {dashboardData.hostels.slice(0, 3).map((hostel) => (
                    <div 
                      key={hostel.id}
                      onClick={() => router.push(`/dashboard/manage-hostels?id=${hostel.id}`)}
                      className="p-3 border border-gray-200 hover:border-[#FF6A00] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#FF6A00] transition-colors">
                          {hostel.name}
                        </h3>
                        <div className={`px-2 py-1 text-xs font-medium ${
                          hostel.is_active && hostel.accepting_bookings
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {hostel.is_active && hostel.accepting_bookings ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {hostel.address}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>GHS {hostel.base_price}</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span>{hostel.rating || 0}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {dashboardData.hostels.length > 3 && (
                  <button 
                    onClick={() => router.push('/dashboard/manage-hostels')}
                    className="w-full mt-3 py-2 bg-gray-50 hover:bg-[#FF6A00] hover:text-white text-xs font-medium transition-colors"
                  >
                    View All {dashboardData.hostels.length} Hostels
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;