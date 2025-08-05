"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiPlus, FiEdit, FiTrash2, FiLoader, FiMapPin, 
  FiMail, FiPhone, FiWifi, FiCoffee, FiCamera, FiShield, 
  FiRefreshCw, FiChevronLeft, FiChevronRight, FiInfo
} from 'react-icons/fi';
import img from 'next/image';

interface LocationCoords {
  lng: number;
  lat: number;
}

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  SecondaryNumber: string;
  location: LocationCoords;
  images: string[];
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function HostelManagementPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, id: string | null}>({show: false, id: null});

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddHostel = () => {
    router.push('/dashboard/manage-hostels/add');
  };

  const handleEditHostel = (id: string) => {
    router.push(`/dashboard/hostels/edit/${id}`);
  };

  const handleDeleteHostel = async () => {
    if (!deleteConfirm.id) return;
    
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete hostel');
      }
      
      setHostels(hostels.filter(hostel => hostel.id !== deleteConfirm.id));
      setDeleteConfirm({show: false, id: null});
    } catch (err) {
      console.error('Error deleting hostel:', err);
      setError(err instanceof Error ? err.message : 'Deletion failed');
    }
  };

  const closeModal = () => {
    setDeleteConfirm({show: false, id: null});
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading hostels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Hostel Management</h1>
            <p className="text-gray-600">Manage your hostel properties ({hostels.length} total)</p>
          </div>
          
          <div className="flex gap-3">
            <RefreshButton onClick={fetchHostels} />
            <AddHostelButton onClick={handleAddHostel} />
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center justify-between"
          >
            <div className="flex items-start">
              <FiInfo className="flex-shrink-0 mr-2 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        )}

        {hostels.length === 0 ? (
          <EmptyState onAddHostel={handleAddHostel} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {hostels.map((hostel, index) => (
                <HostelCard 
                  key={hostel.id}
                  hostel={hostel}
                  index={index}
                  onEdit={handleEditHostel}
                  onDelete={(id) => setDeleteConfirm({show: true, id})}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className=" rounded-2xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FiTrash2 className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Hostel</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this hostel? This action cannot be undone.</p>
                
                <div className="flex justify-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteHostel}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RefreshButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
  >
    <FiRefreshCw className="mr-2" />
    <span>Refresh</span>
  </motion.button>
);

const AddHostelButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center px-5 py-2.5 bg-black text-white rounded-xl shadow-lg hover:opacity-90 transition-opacity"
  >
    <FiPlus className="mr-2" />
    <span>Add Hostel</span>
  </motion.button>
);

const AmenityIcon = ({ amenity, isActive }: { amenity: string; isActive: boolean }) => {
  const icons = {
    wifi: FiWifi,
    laundry: FiRefreshCw,
    cafeteria: FiCoffee,
    parking: FiCamera,
    security: FiShield,
  };
  
  const Icon = icons[amenity as keyof typeof icons] || FiHome;
  
  return (
    <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
      <Icon className="w-4 h-4" />
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
  onDelete: (id: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasImages = hostel.images && hostel.images.length > 0;
  const activeAmenities = Object.entries(hostel.amenities || {}).filter(([_, value]) => value);

  // Helper function to format location
  const formatLocation = (location: LocationCoords | unknown): string => {
    if (typeof location === 'string') return location;
  
    // Handle GeoJSON Point format
    if (
      location &&
      typeof location === 'object' &&
      (location as { type: string }).type === 'Point' &&
      Array.isArray((location as { coordinates: [number, number] }).coordinates)
    ) {
      return `Lat: ${((location as { coordinates: [number, number] }).coordinates[1]).toFixed(4)}, Lon: ${((location as { coordinates: [number, number] }).coordinates[0]).toFixed(4)}`;
    }
  
    // Handle LocationCoords format
    if (
      location &&
      typeof (location as { lat: number, lng: number }).lat === 'number' &&
      typeof (location as { lat: number, lng: number }).lng === 'number'
    ) {
      return `Lat: ${((location as { lat: number }).lat).toFixed(4)}, Lon: ${((location as { lng: number }).lng).toFixed(4)}`;
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
      whileHover={{ y: -5 }}
      className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 "
    >
      {/* img Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
        {hasImages && !imageError ? (
          <>
            <img
              src={hostel.images[currentImageIndex]}
              alt={`${hostel.name} - image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {hostel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <FiChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                  {currentImageIndex + 1}/{hostel.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FiHome className="text-white text-6xl opacity-30" />
          </div>
        )}
        
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{hostel.name}</h3>
          <div className="flex items-center mt-1">
            <FiMapPin className="text-white/80 mr-1 text-sm" />
            <span className="text-white/80 text-sm">{locationText}</span>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm min-h-[40px]">
          {hostel.description || 'No description provided'}
        </p>
        
        {/* Contact Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-start text-gray-700">
            <FiMapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="truncate">{hostel.address}</span>
          </div>
          <div className="flex items-start text-gray-700">
            <FiMail className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="truncate">{hostel.email || 'No email'}</span>
          </div>
          <div className="flex items-start text-gray-700">
            <FiPhone className="w-4 h-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span>{hostel.phone}</span>
              {hostel.SecondaryNumber && (
                <span className="text-xs text-gray-500">{hostel.SecondaryNumber}</span>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {activeAmenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">AMENITIES</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(hostel.amenities || {}).map(([amenity, isActive]) => (
                <AmenityIcon key={amenity} amenity={amenity} isActive={isActive} />
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
          <div>Created: {new Date(hostel.created_at).toLocaleDateString()}</div>
          {hostel.updated_at !== hostel.created_at && (
            <div>Updated: {new Date(hostel.updated_at).toLocaleDateString()}</div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between border-t border-gray-100 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(hostel.id)}
            className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            <FiEdit className="mr-1.5 w-4 h-4" /> Edit
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(hostel.id)}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <FiTrash2 className="mr-1.5 w-4 h-4" /> Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ onAddHostel }: { onAddHostel: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="text-center py-20"
  >
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl w-32 h-32 flex items-center justify-center mx-auto mb-6">
      <div className="relative">
        <FiHome className="text-indigo-400 text-5xl mx-auto" />
        <div className="absolute -top-1 -right-1 bg-indigo-500 rounded-full p-1">
          <FiPlus className="text-white text-xs" />
        </div>
      </div>
    </div>
    
    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Hostels Found</h2>
    <p className="text-gray-600 max-w-md mx-auto mb-8">
      You haven&apos;t added any hostels yet. Get started by adding your first hostel property to begin managing your accommodations.
    </p>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAddHostel}
      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center mx-auto hover:opacity-90 transition-opacity"
    >
      <FiPlus className="mr-2" />
      Add Your First Hostel
    </motion.button>
  </motion.div>
);