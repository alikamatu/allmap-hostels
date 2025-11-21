import React from 'react';
import { Room } from '@/types/room';
import { Building, CheckCircle, Users, Settings } from 'lucide-react';

const StatsOverview = ({ rooms }: { rooms: Room[] }) => {
  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter(room => room.status === 'available').length || 0,
    occupied: rooms?.filter(room => room.status === 'occupied').length || 0,
    maintenance: rooms?.filter(room => room.status === 'maintenance').length || 0
  };

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Rooms */}
      <div className="bg-white border-t-4 border-t-[#FF6A00] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">Total Rooms</p>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-2 bg-gray-100">
            <Building className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Available */}
      <div className="bg-white border-t-4 border-t-green-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">Available</p>
            <p className="text-lg font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="p-2 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </div>

      {/* Occupied */}
      <div className="bg-white border-t-4 border-t-blue-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">Occupied</p>
            <p className="text-lg font-bold text-blue-600">{stats.occupied}</p>
          </div>
          <div className="p-2 bg-blue-50">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white border-t-4 border-t-yellow-500 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">Maintenance</p>
            <p className="text-lg font-bold text-yellow-600">{stats.maintenance}</p>
          </div>
          <div className="p-2 bg-yellow-50">
            <Settings className="h-4 w-4 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;