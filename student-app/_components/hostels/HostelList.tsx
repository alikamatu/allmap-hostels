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
        <p className="text-gray-500 text-lg">No hostels match your filters</p>
        <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {hostels.map((hostel) => (
        <Link
          key={hostel.id}
          href={`/hostels/${hostel.id}`}
          className="block overflow-hidden hover:scale-101 transition-all duration-500"
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
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          <div className="pt-2">
            <h2 className="text-lg font-semibold truncate">{hostel.name}</h2>
            <p className="text-md font-thin truncate">{hostel.address}</p>
            <div className="flex justify-between mt-1">
              <span className="text-sm font-medium text-blue-600">
                ₦{hostel.lowestPrice.toLocaleString()}
                {hostel.lowestPrice !== hostel.highestPrice && 
                 ` - ₦${hostel.highestPrice.toLocaleString()}`}
              </span>
              {hostel.distance !== null && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {hostel.distance.toFixed(1)} km
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};