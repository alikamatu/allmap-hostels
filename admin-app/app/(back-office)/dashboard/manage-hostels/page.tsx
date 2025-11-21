"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, MapPin, Mail, Phone, Wifi, Shirt, 
  Coffee, Car, Shield, RefreshCw, Info, Hotel,
  Star, MoreVertical, Check, X, Users, Bed, Calendar, CalendarOff, Crown,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  SecondaryNumber: string;
  location: any;
  images: string[];
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
  };
  rating?: number;
  capacity?: number;
  rooms?: number;
  accepting_bookings?: boolean;
  admin_id?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  role: 'student' | 'hostel_admin' | 'super_admin';
  name?: string;
  email?: string;
}

export default function HostelManagementPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'wifi' | 'parking' | 'security' | 'accepting' | 'not-accepting'>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user-profile`, {
        method: 'GET',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  const fetchHostels = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    try {
      setLoading(true);
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/hostels/fetch`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (response.ok) {
        const data = await response.json();
        setHostels(data);
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      fetchHostels();
    }
  }, [fetchHostels, userProfile]);

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         hostel.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'wifi') matchesFilter = hostel.amenities?.wifi;
    if (filter === 'parking') matchesFilter = hostel.amenities?.parking;
    if (filter === 'security') matchesFilter = hostel.amenities?.security;
    if (filter === 'accepting') matchesFilter = hostel.accepting_bookings === true;
    if (filter === 'not-accepting') matchesFilter = hostel.accepting_bookings === false;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddHostel = () => {
    router.push('/dashboard/manage-hostels/add');
  };

  const handleEditHostel = (id: string) => {
    router.push(`/dashboard/hostels/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 w-96 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-80 bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-7xl mx-auto space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Hostel Management</h1>
            <p className="text-xs text-gray-600">
              {hostels.length} {hostels.length === 1 ? 'property' : 'properties'} • {hostels.filter(h => h.accepting_bookings).length} accepting bookings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchHostels}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-150"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ backgroundColor: '#e55e00' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddHostel}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150"
            >
              <Plus className="h-3 w-3" />
              Add Hostel
            </motion.button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search hostels..."
                className="w-full pl-8 pr-4 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150 appearance-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Hostels</option>
              <option value="accepting">Accepting Bookings</option>
              <option value="not-accepting">Not Accepting</option>
              <option value="wifi">With Wi-Fi</option>
              <option value="parking">With Parking</option>
              <option value="security">With Security</option>
            </select>
          </div>
        </div>

        {/* Hostels Grid */}
        {filteredHostels.length === 0 ? (
          <div className="text-center py-12">
            <Hotel className="text-gray-300 h-8 w-8 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {searchQuery || filter !== 'all' ? 'No matching hostels found' : 'No hostels available'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredHostels.map((hostel, index) => (
                <HostelCard
                  key={hostel.id}
                  hostel={hostel}
                  index={index}
                  onEdit={handleEditHostel}
                  onDelete={() => {}}
                  onToggleBooking={() => {}}
                  userProfile={userProfile}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

const HostelCard = ({
  hostel,
  index,
  onEdit,
  userProfile,
}: {
  hostel: Hostel;
  index: number;
  onEdit: (id: string) => void;
  onDelete: () => void;
  onToggleBooking: (currentStatus: boolean) => void;
  userProfile: UserProfile | null;
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const hasImages = hostel.images && hostel.images.length > 0;
  const acceptingBookings = hostel.accepting_bookings ?? true;

  const amenities = [
    { key: 'wifi', icon: Wifi, label: 'Wi-Fi', active: hostel.amenities?.wifi },
    { key: 'laundry', icon: Shirt, label: 'Laundry', active: hostel.amenities?.laundry },
    { key: 'cafeteria', icon: Coffee, label: 'Cafeteria', active: hostel.amenities?.cafeteria },
    { key: 'parking', icon: Car, label: 'Parking', active: hostel.amenities?.parking },
    { key: 'security', icon: Shield, label: 'Security', active: hostel.amenities?.security },
  ];

  const nextImage = useCallback(() => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length);
    }
  }, [hasImages, hostel.images.length]);

  const prevImage = useCallback(() => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + hostel.images.length) % hostel.images.length);
    }
  }, [hasImages, hostel.images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -2 }}
      className="bg-white border-0 border-t-4 border-t-[#FF6A00] hover:bg-gray-50 transition-all duration-150"
    >
      {/* Image Section */}
      <div className="relative h-[30vh] bg-gray-900 overflow-hidden">
        {hasImages && !imageError ? (
          <>
            <img
              src={hostel.images[currentImageIndex]}
              alt={`${hostel.name} - image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Image Navigation */}
            {hostel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-1 hover:bg-black/80 transition-colors duration-150"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-1 hover:bg-black/80 transition-colors duration-150"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1.5 py-0.5 text-xs font-medium">
                  {currentImageIndex + 1}/{hostel.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Hotel className="text-white h-8 w-8 opacity-50" />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{hostel.name}</h3>
            <div className="flex items-center mt-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{hostel.address}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {hostel.rating && (
              <div className="flex items-center text-xs text-gray-600">
                <Star className="h-3 w-3 mr-0.5 text-[#FF6A00] fill-current" />
                {hostel.rating.toFixed(1)}
              </div>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                <MoreVertical className="h-3 w-3" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-6 bg-white border border-gray-100 py-1 z-10">
                  <button 
                    onClick={() => {
                      onEdit(hostel.id);
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`px-3 py-1.5 text-xs font-medium ${
        acceptingBookings ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {acceptingBookings ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Accepting bookings
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Not accepting bookings
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {hostel.capacity && (
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {hostel.capacity}
              </span>
            )}
            {hostel.rooms && (
              <span className="flex items-center">
                <Bed className="h-3 w-3 mr-1" />
                {hostel.rooms}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {hostel.description || 'No description provided'}
        </p>

        {/* Contact */}
        <div className="space-y-1.5 mb-3 text-xs">
          <div className="flex items-center text-gray-600">
            <Mail className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{hostel.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
            <span>{hostel.phone}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2">AMENITIES</p>
          <div className="flex gap-1">
            {amenities.map(({ key, icon: Icon, label, active }) => (
              active && (
                <div
                  key={key}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs"
                  title={label}
                >
                  <Icon className="h-3 w-3" />
                </div>
              )
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Updated {new Date(hostel.updated_at).toLocaleDateString()}
          </div>
          <motion.button
            whileHover={{ color: '#FF6A00' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(hostel.id)}
            className="text-xs font-medium text-gray-600 hover:text-[#FF6A00] transition-colors duration-150"
          >
            Manage
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};