import React from 'react';
import { Room, RoomStatus } from '@/types/room';
import { CheckCircle, Users, Settings, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';

const statusConfig = {
  [RoomStatus.AVAILABLE]: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Available' },
  [RoomStatus.OCCUPIED]: { color: 'bg-blue-100 text-blue-800', icon: Users, label: 'Occupied' },
  [RoomStatus.MAINTENANCE]: { color: 'bg-yellow-100 text-yellow-800', icon: Settings, label: 'Maintenance' },
  [RoomStatus.RESERVED]: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Reserved' }
};

const RoomCard = ({ 
  room, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: { 
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const StatusIcon = statusConfig[room.status]?.icon || Settings;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
      isSelected ? 'border-black' : 'border-transparent hover:border-gray-200'
    }`}>
      <div className="p-6">
        {/* Room Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
              <p className="text-sm text-gray-500">{room.hostel?.name || 'Unknown Hostel'}</p>
            </div>
          </div>
          
          <div className="relative group">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 hidden group-hover:block z-10">
              <button
                onClick={onEdit}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Room Status */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[room.status]?.color}`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig[room.status]?.label}
          </span>
        </div>

        {/* Room Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Floor:</span>
            <span className="font-medium">{room.floor || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium">{room.roomType?.name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span>Occupancy:</span>
            <span className="font-medium">
              {room.currentOccupancy}/{room.maxOccupancy}
            </span>
          </div>
          {room.notes && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              {room.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;