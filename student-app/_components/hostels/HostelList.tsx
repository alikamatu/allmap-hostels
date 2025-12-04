import React from 'react';
import Link from 'next/link';
import { HostelCard } from '@/types/hostels';

interface HostelListProps {
  hostels: HostelCard[];
}

export const HostelList: React.FC<HostelListProps> = ({ hostels }) => {
  if (hostels.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-800 text-lg">No hostels match your filters</p>
        <p className="text-gray-700 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {hostels.map((hostel) => {
        // Debug logging to see what price data we have
        console.log(`Hostel ${hostel.name}:`, {
          lowestPrice: hostel.lowestPrice,
          highestPrice: hostel.highestPrice,
          base_price: hostel.base_price
        });

        return (
          <Link
            key={hostel.id}
            href={`/dashboard/hostels/${hostel.id}`}
            className="block overflow-hidden hover:scale-101 transition-all duration-800"
          >
            <div className="relative aspect-square">
              {hostel.imageUrl ? (
                <img
                  src={hostel.imageUrl}
                  alt={hostel.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                  <span className="text-gray-800">No image</span>
                </div>
              )}
              {!hostel.accepting_bookings && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Not Accepting Bookings
                </span>
              )}

              {!hostel.is_verified && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Listed
                </span>
              )}
            </div>
            <div className="pt-2">
              <h2 className="text-lg text-gray-800 truncate">{hostel.name}</h2>
              <p className="text-md font-thin text-gray-800 truncate">{hostel.address}</p>
              <div className="flex justify-between mt-1">
                <span className="text-sm font-medium text-red-600">
                  {hostel.base_price !== null ? `GHC${hostel.base_price.toLocaleString()}` : 'Price not available'}
                </span>
                {/* Always show distance if available */}
                {hostel.distance !== null && (
                  <span className="text-xs bg-gray-100 px-2 py-1 text-red-600 rounded-full">
                    {hostel.distance.toFixed(1)} km
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};