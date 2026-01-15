// services/roomsService.ts
import { Room, RoomType, RoomStatus } from '../types/booking';

export interface RoomFilters {
  hostelId?: string;
  roomTypeId?: string;
  status?: RoomStatus;
  floor?: number;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RoomsResponse {
  rooms: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoomStatistics {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  reserved: number;
  occupancyRate: number;
  averageOccupancy: number;
}

class RoomsService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Get rooms with filtering
  async getRooms(filters: RoomFilters = {}): Promise<RoomsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest<RoomsResponse>(`/rooms?${params}`);
  }

  // Get room by ID
  async getRoomById(roomId: string): Promise<Room> {
    return this.makeRequest<Room>(`/rooms/${roomId}`);
  }

  // Get rooms by hostel
  async getRoomsByHostel(hostelId: string, filters: Partial<RoomFilters> = {}): Promise<Room[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest<Room[]>(`/rooms/hostel/${hostelId}?${params}`);
  }

  // Get available rooms for a hostel
  async getAvailableRooms(hostelId: string, roomTypeId?: string): Promise<Room[]> {
    const params = roomTypeId ? `?roomTypeId=${roomTypeId}` : '';
    return this.makeRequest<Room[]>(`/rooms/available/${hostelId}${params}`);
  }

  // Get room statistics
  async getRoomStatistics(hostelId: string): Promise<RoomStatistics> {
    return this.makeRequest<RoomStatistics>(`/rooms/statistics/${hostelId}`);
  }

  // Search rooms
  async searchRooms(searchTerm: string, filters: RoomFilters = {}): Promise<Room[]> {
    const params = new URLSearchParams({ searchTerm });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.makeRequest<Room[]>(`/rooms/search?${params}`);
  }

  // Get room types by hostel
  async getRoomTypesByHostel(hostelId: string): Promise<RoomType[]> {
    return this.makeRequest<RoomType[]>(`/hostels/${hostelId}/room-types`);
  }

  // Get room type by ID
  async getRoomTypeById(hostelId: string, roomTypeId: string): Promise<RoomType> {
    return this.makeRequest<RoomType>(`/hostels/${hostelId}/room-types/${roomTypeId}`);
  }

  // Get floors for a hostel
  async getHostelFloors(hostelId: string): Promise<number[]> {
    return this.makeRequest<number[]>(`/rooms/hostel/${hostelId}/floors`);
  }

  // Get room numbers for a hostel
  async getHostelRoomNumbers(hostelId: string): Promise<string[]> {
    return this.makeRequest<string[]>(`/rooms/hostel/${hostelId}/room-numbers`);
  }

  // Update room occupancy (for internal use)
  async updateRoomOccupancy(roomId: string, occupancy: number): Promise<Room> {
    return this.makeRequest<Room>(`/rooms/${roomId}/occupancy`, {
      method: 'PATCH',
      body: JSON.stringify({ occupancy }),
    });
  }

  // Change room status
  async changeRoomStatus(roomId: string, status: RoomStatus): Promise<Room> {
    return this.makeRequest<Room>(`/rooms/${roomId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Utility functions
  isRoomAvailable(room: Room): boolean {
    return room.status === RoomStatus.AVAILABLE && room.currentOccupancy < room.maxOccupancy;
  }

  getRoomOccupancyPercentage(room: Room): number {
    return room.maxOccupancy > 0 ? (room.currentOccupancy / room.maxOccupancy) * 100 : 0;
  }

  getRemainingCapacity(room: Room): number {
    return Math.max(0, room.maxOccupancy - room.currentOccupancy);
  }

  getStatusColor(status: RoomStatus): string {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case RoomStatus.OCCUPIED:
        return 'bg-blue-100 text-blue-800';
      case RoomStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      case RoomStatus.RESERVED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: RoomStatus): string {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return '✓';
      case RoomStatus.OCCUPIED:
        return '👥';
      case RoomStatus.MAINTENANCE:
        return '🔧';
      case RoomStatus.RESERVED:
        return '🔒';
      default:
        return '?';
    }
  }

  // Filter and sort utilities
  filterRoomsByStatus(rooms: Room[], status: RoomStatus): Room[] {
    return rooms.filter(room => room.status === status);
  }

  filterAvailableRooms(rooms: Room[]): Room[] {
    return rooms.filter(room => this.isRoomAvailable(room));
  }

  sortRoomsByNumber(rooms: Room[]): Room[] {
    return [...rooms].sort((a, b) => {
      // Try to sort numerically if room numbers are numeric
      const aNum = parseInt(a.roomNumber);
      const bNum = parseInt(b.roomNumber);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Fall back to string comparison
      return a.roomNumber.localeCompare(b.roomNumber);
    });
  }

  sortRoomsByFloor(rooms: Room[]): Room[] {
    return [...rooms].sort((a, b) => {
      if (a.floor === null && b.floor === null) return 0;
      if (a.floor === null) return 1;
      if (b.floor === null) return -1;
      return a.floor - b.floor;
    });
  }

  sortRoomsByOccupancy(rooms: Room[], ascending: boolean = true): Room[] {
    return [...rooms].sort((a, b) => {
      const aOccupancy = this.getRoomOccupancyPercentage(a);
      const bOccupancy = this.getRoomOccupancyPercentage(b);
      return ascending ? aOccupancy - bOccupancy : bOccupancy - aOccupancy;
    });
  }

  // Group rooms by different criteria
  groupRoomsByFloor(rooms: Room[]): Record<number | string, Room[]> {
    const grouped: Record<number | string, Room[]> = {};
    
    rooms.forEach(room => {
      const floor = room.floor !== null ? room.floor : 'No Floor';
      if (!grouped[floor]) {
        grouped[floor] = [];
      }
      grouped[floor].push(room);
    });
    
    return grouped;
  }

  groupRoomsByType(rooms: Room[]): Record<string, Room[]> {
    const grouped: Record<string, Room[]> = {};
    
    rooms.forEach(room => {
      const typeName = room.roomType?.name || 'Unknown Type';
      if (!grouped[typeName]) {
        grouped[typeName] = [];
      }
      grouped[typeName].push(room);
    });
    
    return grouped;
  }

  groupRoomsByStatus(rooms: Room[]): Record<RoomStatus, Room[]> {
    const grouped: Record<RoomStatus, Room[]> = {
      [RoomStatus.AVAILABLE]: [],
      [RoomStatus.OCCUPIED]: [],
      [RoomStatus.MAINTENANCE]: [],
      [RoomStatus.RESERVED]: [],
    };
    
    rooms.forEach(room => {
      grouped[room.status].push(room);
    });
    
    return grouped;
  }

  // Calculate statistics
  calculateOccupancyRate(rooms: Room[]): number {
    if (rooms.length === 0) return 0;
    
    const totalCapacity = rooms.reduce((sum, room) => sum + room.maxOccupancy, 0);
    const currentOccupancy = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
    
    return totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0;
  }

  calculateAverageOccupancy(rooms: Room[]): number {
    if (rooms.length === 0) return 0;
    
    const totalOccupancy = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
    return totalOccupancy / rooms.length;
  }

  getRoomDistribution(rooms: Room[]): Record<RoomStatus, number> {
    const distribution = {
      [RoomStatus.AVAILABLE]: 0,
      [RoomStatus.OCCUPIED]: 0,
      [RoomStatus.MAINTENANCE]: 0,
      [RoomStatus.RESERVED]: 0,
    };
    
    rooms.forEach(room => {
      distribution[room.status]++;
    });
    
    return distribution;
  }
}

export const roomsService = new RoomsService();