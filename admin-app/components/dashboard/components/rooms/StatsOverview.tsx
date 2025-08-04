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
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Occupied</p>
            <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Settings className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;