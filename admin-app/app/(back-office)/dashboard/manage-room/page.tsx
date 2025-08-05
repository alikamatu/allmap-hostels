"use client";

import React, { useState, useEffect, useCallback } from 'react';

import { 
  Plus, Search, Trash2,
  Building,
  Copy
} from 'lucide-react';
import { Room, RoomStatus, RoomType } from '@/types/room';
import { Hostel } from '@/types/hostel';
import RoomCard from '@/components/dashboard/components/rooms/RoomCard';
import CreateRoomModal from '@/components/dashboard/components/rooms/CreateRoomModal';
import BulkCreateModal from '@/components/dashboard/components/rooms/BulkCreateModal';
import UpdateRoomModal from '@/components/dashboard/components/rooms/UpdateRoomModal';
import QuickActionsBar from '@/components/dashboard/components/rooms/QuickActionsBar';
import StatsOverview from '@/components/dashboard/components/rooms/StatsOverview';
import CreateRoomTypeModal from '@/components/dashboard/components/rooms/room-types/CreateRoomTypeModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

// Type definitions for form data
interface CreateRoomFormData {
  hostelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: string;
  maxOccupancy: string;
  notes: string;
}

interface BulkCreateFormData {
  hostelId: string;
  roomTypeId: string;
  floor: string;
  maxOccupancy: string;
  roomNumbers: string;
  notes: string;
}

interface UpdateRoomFormData {
  roomNumber: string;
  floor: string;
  status: RoomStatus;
  maxOccupancy: string;
  currentOccupancy: string;
  notes: string;
}

interface CreateRoomTypeFormData {
  hostelId: string;
  name: string;
  description?: string;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
  capacity: number;
  amenities?: string[];
}

const RoomManagementPage = () => {
  const [selectedHostel, setSelectedHostel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState({
    rooms: true,
    hostels: true,
    roomTypes: true,
    action: false
  });
  const [showCreateRoomTypeModal, setShowCreateRoomTypeModal] = useState(false);

  // Form state
  const [createFormData, setCreateFormData] = useState<CreateRoomFormData>({
    hostelId: '',
    roomTypeId: '',
    roomNumber: '',
    floor: '',
    maxOccupancy: '',
    notes: ''
  });

  const [bulkFormData, setBulkFormData] = useState<BulkCreateFormData>({
    hostelId: '',
    roomTypeId: '',
    floor: '',
    maxOccupancy: '',
    roomNumbers: '',
    notes: ''
  });

  const [updateFormData, setUpdateFormData] = useState<UpdateRoomFormData>({
    roomNumber: '',
    floor: '',
    status: RoomStatus.AVAILABLE,
    maxOccupancy: '',
    currentOccupancy: '',
    notes: ''
  });

  // Fetch room types function
  const fetchRoomTypes = useCallback(async (hostelId: string) => {
    if (!hostelId) {
      setRoomTypes([]);
      return;
    }

    setLoading(prev => ({ ...prev, roomTypes: true }));
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error('No authentication token found');
        setRoomTypes([]);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/hostels/${hostelId}/room-types`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Authentication failed for room types');
          setRoomTypes([]);
          return;
        }
        throw new Error('Failed to fetch room types');
      }
      
      const data = await res.json();
      setRoomTypes(data);
    } catch (error) {
      console.error('Error fetching room types:', error);
      setRoomTypes([]);
    } finally {
      setLoading(prev => ({ ...prev, roomTypes: false }));
    }
  }, []);

  // Fetch rooms function
  const fetchRooms = useCallback(async (page: number = 1) => {
    setLoading(prev => ({ ...prev, rooms: true }));
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      if (!accessToken) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const params = new URLSearchParams();
      params.append('limit', '20');
      params.append('page', page.toString());
      
      if (selectedHostel && selectedHostel.trim()) {
        params.append('hostelId', selectedHostel);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (floorFilter && floorFilter !== 'all') {
        const floorNumber = parseInt(floorFilter);
        if (!isNaN(floorNumber)) {
          params.append('floor', floorNumber.toString());
        }
      }
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const url = `${API_BASE_URL}/rooms?${params.toString()}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (res.status === 400) {
          throw new Error(`Bad Request: ${errorData.message || 'Invalid request parameters'}`);
        }
        
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch rooms`);
      }
      
      const data = await res.json();
      
      if (data.rooms && data.pagination) {
        setRooms(data.rooms);
        // Note: pagination data is available but not currently used in the UI
        // const { page, totalPages, total } = data.pagination;
      } else if (Array.isArray(data)) {
        setRooms(data);
      } else {
        setRooms([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      alert((error as Error).message || 'Failed to load rooms');
      setRooms([]);
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  }, [selectedHostel, statusFilter, floorFilter, searchTerm]);

  // Initial data fetch - only runs once on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

      if (!accessToken) {
        alert('You are not authenticated. Please log in.');
        return;
      }

      try {
        setLoading({
          rooms: true,
          hostels: true,
          roomTypes: false,
          action: false
        });

        // Fetch hostels
        const hostelsRes = await fetch(`${API_BASE_URL}/hostels/fetch`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!hostelsRes.ok) {
          if (hostelsRes.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }
          throw new Error('Failed to fetch hostels');
        }
        
        const hostelsData = await hostelsRes.json();
        setHostels(hostelsData);
        
        // Fetch rooms
        await fetchRooms();
        
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        alert((error as Error).message || 'Failed to load data');
      } finally {
        setLoading(prev => ({
          ...prev,
          rooms: false,
          hostels: false
        }));
      }
    };
    
    fetchInitialData();
  }, [fetchRooms]); // Include fetchRooms dependency

  // Handle hostel selection changes - fetch room types when hostel changes
  useEffect(() => {
    if (selectedHostel) {
      fetchRoomTypes(selectedHostel);
    } else {
      setRoomTypes([]);
      setLoading(prev => ({ ...prev, roomTypes: false }));
    }
  }, [selectedHostel, fetchRoomTypes]);

  // Handle filter changes - refetch rooms when filters change
  useEffect(() => {
    fetchRooms(1); // Reset to page 1 when filters change
  }, [fetchRooms]);

  // Reset create form when modal opens
  useEffect(() => {
    if (showCreateModal) {
      setCreateFormData({
        hostelId: selectedHostel || '', // Pre-select current hostel if available
        roomTypeId: '',
        roomNumber: '',
        floor: '',
        maxOccupancy: '',
        notes: ''
      });
    }
  }, [showCreateModal, selectedHostel]);

  const handleCreateRoom = async (formData: CreateRoomFormData) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    try {
      // Prepare data exactly as the CreateRoomDto expects
      const createRoomData = {
        hostelId: formData.hostelId,
        roomTypeId: formData.roomTypeId,
        roomNumber: formData.roomNumber,
        maxOccupancy: parseInt(formData.maxOccupancy), // Ensure it's a number
        ...(formData.floor && { floor: parseInt(formData.floor) }), // Only include if provided
        ...(formData.notes && { notes: formData.notes }) // Only include if provided
      };

      console.log('Creating room with data:', createRoomData);

      const res = await fetch(`${API_BASE_URL}/rooms/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createRoomData)
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const responseText = await res.text();
        console.log('Error response:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }

        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (res.status === 400) {
          // Handle validation errors
          const message = errorData.message || responseText;
          if (Array.isArray(errorData.message)) {
            throw new Error(`Validation Error: ${errorData.message.join(', ')}`);
          }
          throw new Error(`Bad Request: ${message}`);
        } else if (res.status === 409) {
          throw new Error(`Conflict: ${errorData.message || 'Room number already exists in this hostel'}`);
        } else if (res.status === 404) {
          throw new Error(`Not Found: ${errorData.message || 'Hostel or Room Type not found'}`);
        }
        
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to create room`);
      }
      
      const result = await res.json();
      console.log('Room created successfully:', result);
      
      await fetchRooms();
      setShowCreateModal(false);
      
      // Reset form data
      setCreateFormData({
        hostelId: selectedHostel || '',
        roomTypeId: '',
        roomNumber: '',
        floor: '',
        maxOccupancy: '',
        notes: ''
      });
      
      alert('Room created successfully!');
      
    } catch (error) {
      console.error('Error creating room:', error);
      alert((error as Error).message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleBulkCreate = async (formData: BulkCreateFormData) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          roomNumbers: formData.roomNumbers.split(',').map((num: string) => num.trim())
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create rooms');
      }
      
      await fetchRooms();
      setShowBulkModal(false);
    } catch (error) {
      console.error('Error creating rooms:', error);
      alert((error as Error).message || 'Failed to create rooms. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleUpdateRoom = async (roomId: string, formData: UpdateRoomFormData) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update room');
      }
      
      await fetchRooms();
      setShowUpdateModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error updating room:', error);
      alert((error as Error).message || 'Failed to update room. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }
    
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete room');
      }
      
      await fetchRooms();
      setSelectedRooms(prev => prev.filter(id => id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      alert((error as Error).message || 'Failed to delete room. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleBulkDelete = async () => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }

    if (selectedRooms.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedRooms.length} room(s)?`)) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/bulk/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedRooms })
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete rooms');
      }
      
      await fetchRooms();
      setSelectedRooms([]);
    } catch (error) {
      console.error('Error deleting rooms:', error);
      alert((error as Error).message || 'Failed to delete rooms. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleBulkStatusUpdate = async (status: RoomStatus) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }

    if (selectedRooms.length === 0) return;
    
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await Promise.all(selectedRooms.map(async (roomId) => {
        const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        
        if (!res.ok && res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
      }));
      
      await fetchRooms();
    } catch (error) {
      console.error('Error updating room statuses:', error);
      alert((error as Error).message || 'Failed to update room statuses. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const openUpdateModal = (room: Room) => {
    setSelectedRoom(room);
    setUpdateFormData({
      roomNumber: room.roomNumber,
      floor: room.floor?.toString() || '',
      status: room.status,
      maxOccupancy: room.maxOccupancy.toString(),
      currentOccupancy: room.currentOccupancy.toString(),
      notes: room.notes || ''
    });
    setShowUpdateModal(true);
  };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleCreateRoomType = async (formData: CreateRoomTypeFormData) => {
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!accessToken) {
      alert('You are not authenticated. Please log in again.');
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const payload = {
        hostelId: formData.hostelId,
        name: formData.name,
        description: formData.description || '',
        pricePerSemester: formData.pricePerSemester,
        pricePerMonth: formData.pricePerMonth,
        ...(formData.pricePerWeek && { pricePerWeek: formData.pricePerWeek }),
        capacity: formData.capacity,
        amenities: formData.amenities || [],
        images: []
      };

      const res = await fetch(`${API_BASE_URL}/rooms/create-room-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        if (res.status === 401) {
          alert('Authentication failed. Please log in again.');
          return;
        }
        
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to create room type`);
      }

      // Refresh room types for the created hostel
      await fetchRoomTypes(formData.hostelId);
      
      // If the created room type's hostel is currently selected, refresh the room types
      if (formData.hostelId === selectedHostel) {
        await fetchRoomTypes(selectedHostel);
      }
      
      setShowCreateRoomTypeModal(false);
      alert('Room type created successfully!');
      
    } catch (error) {
      console.error('Error creating room type:', error);
      alert((error as Error).message || 'Failed to create room type. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
          <p className="text-gray-600">Manage rooms across all your hostels</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                disabled={loading.hostels}
              >
                <option value="">All Hostels</option>
                {hostels.map(hostel => (
                  <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="all">All Status</option>
                <option value={RoomStatus.AVAILABLE}>Available</option>
                <option value={RoomStatus.OCCUPIED}>Occupied</option>
                <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
                <option value={RoomStatus.RESERVED}>Reserved</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="all">All Floors</option>
                {rooms && [...new Set(rooms.map(room => room.floor))]
                  .filter((floor): floor is number => floor !== null)
                  .sort((a, b) => a - b)
                  .map(floor => (
                    <option key={floor} value={floor}>Floor {floor}</option>
                  ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {selectedRooms.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={loading.action}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedRooms.length})
                </button>
              )}

              <button
                onClick={() => setShowCreateRoomTypeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Room Type
              </button>
              
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Bulk Create
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Room
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading.rooms ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rooms...</p>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new room.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={selectedRooms.includes(room.id)}
                onSelect={() => toggleRoomSelection(room.id)}
                onEdit={() => openUpdateModal(room)}
                onDelete={() => handleDeleteRoom(room.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        hostels={hostels}
        roomTypes={roomTypes}
        formData={createFormData}
        setFormData={setCreateFormData}
        onSubmit={handleCreateRoom}
        loading={loading.action}
        onHostelSelect={fetchRoomTypes}
      />

      {/* Bulk Create Modal */}
      <BulkCreateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        hostels={hostels}
        roomTypes={roomTypes}
        formData={bulkFormData}
        setFormData={setBulkFormData}
        onSubmit={handleBulkCreate}
        loading={loading.action}
      />

      {/* Create Room Type Modal */}
      <CreateRoomTypeModal
        isOpen={showCreateRoomTypeModal}
        onClose={() => setShowCreateRoomTypeModal(false)}
        hostels={hostels}
        onSubmit={handleCreateRoomType}
        loading={loading.action}
      />

      {/* Update Room Modal */}
      {selectedRoom && (
        <UpdateRoomModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          room={selectedRoom}
          formData={updateFormData}
          setFormData={setUpdateFormData}
          onSubmit={() => handleUpdateRoom(selectedRoom.id, updateFormData)}
          loading={loading.action}
        />
      )}

      {/* Quick Actions Bar */}
      {selectedRooms.length > 0 && (
        <QuickActionsBar
          selectedCount={selectedRooms.length}
          onMarkAvailable={() => handleBulkStatusUpdate(RoomStatus.AVAILABLE)}
          onMarkMaintenance={() => handleBulkStatusUpdate(RoomStatus.MAINTENANCE)}
          onDeleteAll={handleBulkDelete}
          onClearSelection={() => setSelectedRooms([])}
        />
      )}

      {/* Statistics Overview */}
      <StatsOverview rooms={rooms} />
    </div>
  );
};

export default RoomManagementPage;