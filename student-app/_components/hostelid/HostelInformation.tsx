"use client";

import { motion } from 'framer-motion';
import { Hostel } from '@/types/hostels';
import { formatPrice } from '@/utils/formatters';

interface HostelInformationProps {
  hostel: Hostel;
  onShowMap: () => void;
}

export const HostelInformation = ({ hostel, onShowMap }: HostelInformationProps) => {
  const totalAvailableRooms = hostel.roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0);
  const minPrice = Math.min(...hostel.roomTypes.map(rt => rt.pricePerMonth));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="md:col-span-1 lg:sticky lg:top-4"
    >
      <h2 className="text-xl font-bold text-black mb-4">Hostel Information</h2>
      <hr className="border-t border-gray-200 mb-4" />
      <div className="space-y-6">
        {hostel.contact && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
            {hostel.contact.admin && <p className="text-gray-800 mb-1">Admin: {hostel.contact.admin}</p>}
            {hostel.contact.phone && <p className="text-gray-800 mb-1">Phone: {hostel.contact.phone}</p>}
            {hostel.contact.email && <p className="text-gray-800">Email: {hostel.contact.email}</p>}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
          <p className="text-gray-800 mb-2">{hostel.address}</p>
          <button 
            onClick={onShowMap}
            className="text-black hover:underline text-sm font-medium"
          >
            View on map →
          </button>
        </div>
        
        {/* Quick Stats */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Room Types</span>
              <span className="font-medium">{hostel.roomTypes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Rooms</span>
              <span className="font-medium text-green-600">
                {totalAvailableRooms}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Starting From</span>
              <span className="font-medium">
                {formatPrice(minPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};