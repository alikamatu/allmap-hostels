import React from 'react';
import { Room, RoomStatus } from '@/types/room';
import { CheckCircle, Users, Settings, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const statusConfig = {
  [RoomStatus.AVAILABLE]: { color: 'bg-green-50 text-green-700', icon: CheckCircle, label: 'Available' },
  [RoomStatus.OCCUPIED]: { color: 'bg-blue-50 text-blue-700', icon: Users, label: 'Occupied' },
  [RoomStatus.MAINTENANCE]: { color: 'bg-yellow-50 text-yellow-700', icon: Settings, label: 'Maintenance' },
  [RoomStatus.RESERVED]: { color: 'bg-purple-50 text-purple-700', icon: Clock, label: 'Reserved' },
};

const RoomCard = ({
  room,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const StatusIcon = statusConfig[room.status]?.icon || Settings;

  const showDeleteConfirm = () => {
    Swal.fire({
      title: 'Delete Room?',
      text: `Are you sure you want to delete room ${room.roomNumber}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a73e8', // Google blue
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg font-medium text-gray-900',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 font-medium',
        cancelButton: 'px-4 py-2 font-medium',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
        Swal.fire({
          title: 'Deleted!',
          text: `Room ${room.roomNumber} has been deleted.`,
          icon: 'success',
          confirmButtonColor: '#1a73e8',
          confirmButtonText: 'OK',
          background: '#fff',
          customClass: {
            popup: 'rounded-xl shadow-lg',
            title: 'text-lg font-medium text-gray-900',
            htmlContainer: 'text-sm text-gray-600',
            confirmButton: 'px-4 py-2 font-medium',
          },
        });
      }
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border-2 transition-all duration-200 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className="p-5">
        {/* Room Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
              <p className="text-sm text-gray-500">{room.hostel?.name || 'Unknown Hostel'}</p>
            </div>
          </div>

          <div className="relative group">
            <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border py-1.5 hidden group-hover:block z-10 min-w-[120px]">
              <button
                onClick={onEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                Edit
              </button>
              <button
                onClick={showDeleteConfirm}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Room Status */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[room.status]?.color}`}
          >
            <StatusIcon className="h-4 w-4" />
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
            <span>Gender:</span>
            <span className="font-medium">{room.roomType?.gender || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span>Occupancy:</span>
            <span className="font-medium">
              {room.currentOccupancy}/{room.maxOccupancy}
            </span>
          </div>
          {room.notes && (
            <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-xs text-gray-600">
              {room.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;