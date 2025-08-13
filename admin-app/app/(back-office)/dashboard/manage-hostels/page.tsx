"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Plus, Edit, Trash2, Loader2, MapPin, Mail, Phone, Wifi, Shirt, 
  Coffee, Car, Shield, RefreshCw, ChevronLeft, ChevronRight, Info, Hotel,
  Star, MoreVertical, Check, X, Users, Bed
} from 'lucide-react';
import img from 'next/image';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface LocationCoords {
  lng: number;
  lat: number;
}

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  SecondaryNumber: string;
  location: LocationCoords | GeoJSONPoint | string;
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
  created_at: string;
  updated_at: string;
}

export default function HostelManagementPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'wifi' | 'parking' | 'security'>('all');

  const fetchHostels = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/fetch`, {
        method: 'GET',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch hostels: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setHostels(data);
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching hostels');
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to fetch hostels',
        confirmButtonColor: '#4F46E5',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  const filteredHostels = hostels.filter(hostel => {
    // Search filter
    const matchesSearch = hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         hostel.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Amenity filter
    let matchesFilter = true;
    if (filter === 'wifi') matchesFilter = hostel.amenities?.wifi;
    if (filter === 'parking') matchesFilter = hostel.amenities?.parking;
    if (filter === 'security') matchesFilter = hostel.amenities?.security;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddHostel = () => {
    router.push('/dashboard/manage-hostels/add');
  };

  const handleEditHostel = (id: string) => {
    router.push(`/dashboard/hostels/edit/${id}`);
  };

  const handleDeleteHostel = async (id: string, name: string) => {
    const result = await MySwal.fire({
      title: 'Delete Hostel',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 font-medium',
        cancelButton: 'px-4 py-2 font-medium',
      },
    });

    if (result.isConfirmed) {
      try {
        const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${id}`, {
          method: 'DELETE',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
        if (!response.ok) {
          throw new Error('Failed to delete hostel');
        }
        setHostels(hostels.filter(hostel => hostel.id !== id));
        MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${name} has been deleted.`,
          confirmButtonColor: '#4F46E5',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Error deleting hostel:', err);
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: err instanceof Error ? err.message : 'Deletion failed',
          confirmButtonColor: '#4F46E5',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin text-4xl mx-auto mb-4 text-indigo-600" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading hostels...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              Hostel Management
            </h1>
            <div className="flex items-center">
              <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
                <Hotel className="mr-1.5 h-4 w-4" />
                {hostels.length} {hostels.length === 1 ? 'property' : 'properties'}
              </span>
              <p className="ml-3 text-gray-600 text-sm hidden sm:block">
                Manage your hostel accommodations
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <RefreshButton onClick={fetchHostels} />
            <AddHostelButton onClick={handleAddHostel} />
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search hostels by name or address..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 text-sm whitespace-nowrap">Filter by:</span>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Hostels</option>
                <option value="wifi">With Wi-Fi</option>
                <option value="parking">With Parking</option>
                <option value="security">With Security</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 flex items-start"
          >
            <Info className="flex-shrink-0 mr-3 mt-0.5 text-red-500" size={20} />
            <div className="flex-1">
              <span className="font-medium">Error loading data:</span> {error}
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 font-medium ml-4"
            >
              ×
            </button>
          </motion.div>
        )}

        {filteredHostels.length === 0 ? (
          <EmptyState onAddHostel={handleAddHostel} hasSearchQuery={!!searchQuery || filter !== 'all'} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredHostels.map((hostel, index) => (
                <HostelCard
                  key={hostel.id}
                  hostel={hostel}
                  index={index}
                  onEdit={handleEditHostel}
                  onDelete={() => handleDeleteHostel(hostel.id, hostel.name)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const RefreshButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl shadow-sm hover:bg-gray-100 transition-colors font-medium group"
    aria-label="Refresh hostels"
  >
    <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
    <span>Refresh</span>
  </motion.button>
);

const AddHostelButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ 
      scale: 1.05,
      boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
    }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
  >
    <Plus className="mr-2 h-4 w-4" />
    <span>Add Hostel</span>
  </motion.button>
);

const AmenityIcon = ({ amenity, isActive }: { amenity: string; isActive: boolean }) => {
  const icons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    wifi: Wifi,
    laundry: Shirt,
    cafeteria: Coffee,
    parking: Car,
    security: Shield,
  };

  const Icon = icons[amenity] || Home;
  const amenityNames: Record<string, string> = {
    wifi: 'Wi-Fi',
    laundry: 'Laundry',
    cafeteria: 'Cafeteria',
    parking: 'Parking',
    security: '24/7 Security',
  };

  return (
    <div 
      className={`relative group p-2 rounded-lg ${
        isActive 
          ? 'bg-indigo-100 text-indigo-600 shadow-inner' 
          : 'bg-gray-100 text-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" size={16} />
      {isActive && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
          {amenityNames[amenity] || amenity}
          <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

const HostelCard = ({
  hostel,
  index,
  onEdit,
  onDelete
}: {
  hostel: Hostel;
  index: number;
  onEdit: (id: string) => void;
  onDelete: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const hasImages = hostel.images && hostel.images.length > 0;

  const formatLocation = (location: Hostel['location']): string => {
    if (typeof location === 'string') return location;
    if (
      location &&
      typeof location === 'object' &&
      'type' in location &&
      location.type === 'Point' &&
      'coordinates' in location &&
      Array.isArray(location.coordinates)
    ) {
      const geoLocation = location as GeoJSONPoint;
      return `Lat: ${geoLocation.coordinates[1].toFixed(4)}, Lon: ${geoLocation.coordinates[0].toFixed(4)}`;
    }
    if (
      location &&
      typeof location === 'object' &&
      'lat' in location &&
      'lng' in location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number'
    ) {
      const coordLocation = location as LocationCoords;
      return `Lat: ${coordLocation.lat.toFixed(4)}, Lon: ${coordLocation.lng.toFixed(4)}`;
    }
    return 'Unknown location';
  };

  const locationText = formatLocation(hostel.location);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -5, 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all duration-300 shadow-md hover:shadow-xl relative"
    >
      {/* Status badge */}
      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10 flex items-center">
        <Check className="h-3 w-3 mr-1" /> Active
      </div>

      {/* Dropdown menu */}
      <div className="absolute top-3 right-3 z-10">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1.5 rounded-full bg-white/90 text-gray-500 hover:bg-gray-100 transition-colors shadow-sm"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
            <button 
              onClick={() => {
                onEdit(hostel.id);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </button>
            <button 
              onClick={() => {
                onDelete();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* img section */}
      <div className="relative h-52 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
        {hasImages && !imageError ? (
          <>
            <img
              src={hostel.images[currentImageIndex]}
              alt={`${hostel.name} - image ${currentImageIndex + 1}`}
              className="object-cover transition-opacity duration-300"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {hostel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {currentImageIndex + 1}/{hostel.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <Hotel className="text-white text-5xl opacity-50" />
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md truncate">{hostel.name}</h3>
          <div className="flex items-center mt-1">
            <MapPin className="text-white/90 mr-1.5 h-4 w-4" />
            <span className="text-white/90 text-sm truncate">{locationText}</span>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{hostel.name}</h3>
          {hostel.rating && (
            <div className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-sm">
              <Star className="h-3.5 w-3.5 mr-1 fill-current" />
              {hostel.rating.toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1.5 text-gray-500 flex-shrink-0" />
          <span className="truncate text-sm">{hostel.address}</span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 text-sm min-h-[40px] leading-relaxed">
          {hostel.description || 'No description provided'}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          {hostel.capacity && (
            <div className="flex items-center text-gray-700 text-sm">
              <Users className="h-4 w-4 mr-1.5 text-indigo-500" />
              {hostel.capacity} guests
            </div>
          )}
          {hostel.rooms && (
            <div className="flex items-center text-gray-700 text-sm">
              <Bed className="h-4 w-4 mr-1.5 text-indigo-500" />
              {hostel.rooms} rooms
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-3 mb-4 text-sm">
          <div className="flex items-start text-gray-700">
            <Mail className="w-4 h-4 mr-2.5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span className="truncate">{hostel.email || 'No email'}</span>
          </div>
          <div className="flex items-start text-gray-700">
            <Phone className="w-4 h-4 mr-2.5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span>{hostel.phone}</span>
              {hostel.SecondaryNumber && (
                <span className="text-xs text-gray-500 mt-0.5">{hostel.SecondaryNumber}</span>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {Object.entries(hostel.amenities || {}).some(([, value]) => value) && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(hostel.amenities || {}).map(([amenity, isActive]) => (
                <AmenityIcon key={amenity} amenity={amenity} isActive={isActive} />
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3 flex justify-between">
          <span>Created: {new Date(hostel.created_at).toLocaleDateString()}</span>
          {hostel.updated_at !== hostel.created_at && (
            <span>Updated: {new Date(hostel.updated_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between border-t border-gray-100 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(hostel.id)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 font-medium"
            aria-label={`Edit ${hostel.name}`}
          >
            <Edit className="mr-1.5 h-4 w-4" /> Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="flex items-center text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium"
            aria-label={`Delete ${hostel.name}`}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onAddHostel, hasSearchQuery }: { onAddHostel: () => void; hasSearchQuery: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="text-center py-16 px-4 max-w-md mx-auto"
  >
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-inner">
      <div className="relative">
        {hasSearchQuery ? (
          <X className="text-red-500 text-5xl" />
        ) : (
          <>
            <Hotel className="text-indigo-500 text-5xl" />
            <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1.5 shadow-md">
              <Plus className="text-white h-4 w-4" />
            </div>
          </>
        )}
      </div>
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-3">
      {hasSearchQuery ? 'No Matching Hostels Found' : 'No Hostels Found'}
    </h2>
    <p className="text-gray-600 mb-8 leading-relaxed">
      {hasSearchQuery 
        ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
        : 'You haven\'t added any hostels yet. Start by creating your first property to manage accommodations.'}
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAddHostel}
      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center mx-auto hover:shadow-lg transition-all font-medium shadow-md"
    >
      <Plus className="mr-2 h-4 w-4" />
      {hasSearchQuery ? 'Add New Hostel' : 'Add Your First Hostel'}
    </motion.button>
  </motion.div>
);