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
      confirmButtonColor: '#FF6A00',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'shadow-lg',
        title: 'text-sm font-medium text-gray-900',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-3 py-1.5 text-xs font-medium',
        cancelButton: 'px-3 py-1.5 text-xs font-medium',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
        Swal.fire({
          title: 'Deleted!',
          text: `Room ${room.roomNumber} has been deleted.`,
          icon: 'success',
          confirmButtonColor: '#FF6A00',
          confirmButtonText: 'OK',
          background: '#fff',
          customClass: {
            popup: 'shadow-lg',
            title: 'text-sm font-medium text-gray-900',
            htmlContainer: 'text-xs text-gray-600',
            confirmButton: 'px-3 py-1.5 text-xs font-medium',
          },
        });
      }
    });
  };

  return (
    <div
      className={`bg-white border-t-4 border-t-[#FF6A00] p-3 transition-colors duration-150 ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Room Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-3 h-3 border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{room.roomNumber}</h3>
            <p className="text-xs text-gray-500">{room.hostel?.name || 'Unknown Hostel'}</p>
          </div>
        </div>

        <div className="relative group">
          <button className="p-1 hover:bg-gray-100 transition-colors duration-150">
            <MoreVertical className="h-3 w-3 text-gray-500" />
          </button>
          <div className="absolute right-0 top-6 bg-white border border-gray-200 py-1 hidden group-hover:block z-10 min-w-[100px]">
            <button
              onClick={onEdit}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors duration-150"
            >
              <Edit className="h-3 w-3 text-gray-500" />
              Edit
            </button>
            <button
              onClick={showDeleteConfirm}
              className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors duration-150"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Room Status */}
      <div className="flex items-center gap-1.5 mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${statusConfig[room.status]?.color}`}
        >
          <StatusIcon className="h-3 w-3" />
          {statusConfig[room.status]?.label}
        </span>
      </div>

      {/* Room Details */}
      <div className="space-y-1.5 text-xs text-gray-600">
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
          <div className="mt-2 p-2 bg-gray-50 text-xs text-gray-600">
            {room.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;