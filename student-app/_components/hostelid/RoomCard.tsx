"use client";

import { memo } from 'react';
import { motion } from 'framer-motion';
import { RoomType } from '@/types/hostels';
import { formatPrice } from '@/utils/formatters';

interface RoomCardProps {
  roomType: RoomType;
  onBook: (roomType: RoomType) => void;
  onViewRoom: (roomTypeId: string) => void;
  onCheckAvailability: (roomType: RoomType) => void; // Add this prop
  acceptingBookings: boolean;
  IsVerified: boolean;
}

export const RoomCard = memo(({ 
  roomType, 
  onBook, 
  onViewRoom,
  onCheckAvailability, // Add this prop
  IsVerified,
  acceptingBookings 
}: RoomCardProps) => {
  return (
    <motion.div
      className="bg-white border border-gray-200 overflow-hidden shadow-sm"
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-black">{roomType.name}</h3>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${
              roomType.availableRooms > 3 
                ? 'bg-green-100 text-green-800' 
                : roomType.availableRooms > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {roomType.availableRooms > 0 ? `${roomType.availableRooms} available` : 'Fully booked'}
          </span>
        </div>
        
        <p className="text-gray-800 text-sm mb-6 line-clamp-2 leading-relaxed">
          {roomType.description || 'Comfortable living space with essential amenities'}
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg font-bold text-black">{formatPrice(roomType.pricePerSemester)}</p>
            <p className="text-xs text-gray-800">per semester</p>
            <p className='text-sm uppercase py-1 rounded-full font-medium w-contain text-red-800'>
              {roomType.allowedGenders}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-800 mb-3">
            <span>Capacity</span>
            <span className="font-medium">{roomType.capacity} person(s)</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black rounded-full" 
              style={{ width: `${Math.min((roomType.capacity / 6) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 mb-6">
          <h4 className="font-medium text-black mb-3">Room Features</h4>
          <div className="flex flex-wrap gap-2">
            {roomType.amenities.slice(0, 4).map((amenity, idx) => (
              <span 
                key={idx} 
                className="text-gray-800 text-xs px-3 py-1.5 bg-gray-100 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {roomType.amenities.length > 4 && (
              <span className="text-gray-800 text-xs px-3 py-1.5 bg-gray-100 rounded-full">
                +{roomType.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        {!IsVerified && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCheckAvailability(roomType)} // Call the new function
            className="w-full py-3 px-4 font-medium rounded-lg transition bg-black text-white hover:bg-gray-800"
          >
            Check Availability
          </motion.button>
        )}

        {IsVerified && (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gray-100 text-black py-3 px-4 font-medium rounded-lg transition hover:bg-gray-200"
              onClick={() => onViewRoom(roomType.id)}
              disabled={!acceptingBookings}
            >
              View Details
            </motion.button>

            {!acceptingBookings ? (
              <motion.button
                className="flex-1 bg-red-100 text-red-800 py-3 px-4 font-medium rounded-lg transition cursor-not-allowed"
                disabled={true}
              >
                Unavailable
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 px-4 font-medium rounded-lg transition ${
                  roomType.availableRooms > 0
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => roomType.availableRooms > 0 && onBook(roomType)}
                disabled={roomType.availableRooms === 0}
              >
                {roomType.availableRooms > 0 ? 'Book Now' : 'Fully Booked'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

RoomCard.displayName = "RoomCard";