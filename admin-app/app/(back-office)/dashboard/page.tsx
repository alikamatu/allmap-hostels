"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building, 
  Bed, 
  Calendar, 
  Star, 
  Settings,
  ChevronLeft,
  Timer,
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  Plus
} from 'lucide-react';
import { int } from 'zod';
import { Booking } from '@/types/booking';

// Mock API functions - replace with actual API calls
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
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`w-4 h-4 mr-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-${color}-50`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </motion.div>
);

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  color: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, onClick, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer group"
  >
    <div className="flex items-start space-x-4">
      <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </motion.div>
);

const RecentBookingRow = ({ booking }: { booking: Booking }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{booking.studentName}</p>
        <p className="text-sm text-gray-500">Room {booking.room?.roomNumber}</p>
      </div>
    </div>
    <div className="text-right">
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        booking.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        GHS {booking.totalAmount}
      </p>
    </div>
  </motion.div>
);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch hostels first to get hostel IDs
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

        // Fetch booking statistics
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
            
            // Get recent bookings (limit to 5 most recent)
            interface RecentBooking extends Booking {
              createdAt: string;
            }

            const recent: RecentBooking[] = (hostelBookings as RecentBooking[])
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5);
            recentBookings.push(...recent);
          } catch (hostelError) {
            console.warn(`Failed to fetch bookings for hostel ${hostel.id}:`, hostelError);
          }
        }

        // Sort all recent bookings and take top 10
        recentBookings = recentBookings
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        // Calculate room statistics
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
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-gray-200 rounded-2xl"></div>
            <div className="h-80 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your hostels today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={dashboardData.stats.totalBookings}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Active Bookings"
            value={dashboardData.stats.activeBookings}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`GHS ${dashboardData.stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${dashboardData.stats.occupancyRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dashboardData.recentBookings.length > 0 ? (
                <div className="space-y-2">
                  {dashboardData.recentBookings.map((booking, index) => (
                    <RecentBookingRow key={booking.id || index} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent bookings found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <QuickActionCard
                  title="Add New Hostel"
                  description="Register a new hostel property"
                  icon={Building}
                  color="blue"
                  onClick={() => {}}
                />
                <QuickActionCard
                  title="Create Booking"
                  description="Make a new booking for a student"
                  icon={Plus}
                  color="green"
                  onClick={() => {}}
                />
                <QuickActionCard
                  title="Manage Rooms"
                  description="Update room availability and status"
                  icon={Bed}
                  color="purple"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Room Statistics */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Rooms</span>
                  <span className="font-semibold">{dashboardData.stats.totalRooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-green-600">{dashboardData.stats.availableRooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-semibold text-blue-600">
                    {dashboardData.stats.totalRooms - dashboardData.stats.availableRooms}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hostels Overview
        {dashboardData.hostels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Hostels</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.hostels.map((hostel, index) => (
                  <motion.div
                    key={hostel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{hostel.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hostel.address}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hostel.is_active && hostel.accepting_bookings
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hostel.is_active && hostel.accepting_bookings ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium">GHS {hostel.base_price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{hostel.rating || 0}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      <span>{hostel.phone}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )} */}
      </motion.div>
    </div>
  );
};

const HostelAdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleSidenav = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default HostelAdminDashboard;