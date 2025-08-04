"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiPlus, FiEdit, FiTrash2, FiLoader } from 'react-icons/fi';

interface Hostel {
  id: string;
  name: string;
  description: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

export default function HostelManagementPage() {
  const router = useRouter();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');


  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/fetch`, {
          method: 'GET',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch hostels');
        }
        
        const data = await response.json();
        setHostels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const handleAddHostel = () => {
    router.push('/dashboard/manage-hostels/add');
  };

  const handleEditHostel = (id: string) => {
    router.push(`/dashboard/hostels/edit/${id}`);
  };

  const handleDeleteHostel = async (id: string) => {
    if (confirm('Are you sure you want to delete this hostel?')) {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/hostels/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete hostel');
        }
        
        setHostels(hostels.filter(hostel => hostel.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Deletion failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <FiLoader className="animate-spin text-4xl text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Hostel Management</h1>
            <p className="text-gray-600">Manage your hostel properties</p>
          </div>
          
          <AddHostelButton onClick={handleAddHostel} />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-700 p-4 rounded-lg mb-6"
          >
            {error}
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
                  onDelete={handleDeleteHostel}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const AddHostelButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center px-6 py-3 bg-black text-white rounded-full shadow-lg"
  >
    <FiPlus className="mr-2" />
    <span>Add Hostel</span>
  </motion.button>
);

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
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="bg-gray-800 h-40 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-70"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <FiHome className="text-white text-5xl opacity-30" />
      </div>
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-bold text-white">{hostel.name}</h3>
      </div>
    </div>
    
    <div className="p-5">
      <p className="text-gray-600 mb-4 line-clamp-2">{hostel.description || 'No description provided'}</p>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center text-gray-700">
          <span className="font-medium w-24">Address:</span>
          <span className="flex-1">{hostel.address}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium w-24">Email:</span>
          <span className="flex-1 truncate">{hostel.contact_email}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium w-24">Phone:</span>
          <span>{hostel.contact_phone}</span>
        </div>
      </div>
      
      <div className="flex justify-between border-t border-gray-100 pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(hostel.id)}
          className="flex items-center text-gray-700 hover:text-black"
        >
          <FiEdit className="mr-1.5" /> Edit
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(hostel.id)}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <FiTrash2 className="mr-1.5" /> Delete
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const EmptyState = ({ onAddHostel }: { onAddHostel: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="text-center py-20"
  >
    <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
      <FiHome className="text-gray-400 text-4xl" />
    </div>
    
    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Hostels Found</h2>
    <p className="text-gray-600 max-w-md mx-auto mb-8">
      You haven&apos;t added any hostels yet. Get started by adding your first hostel property.
    </p>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onAddHostel}
      className="px-8 py-3 bg-black text-white rounded-full flex items-center mx-auto"
    >
      <FiPlus className="mr-2" />
      Add Your First Hostel
    </motion.button>
  </motion.div>
);