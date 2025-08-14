import { Hostel } from "./hostel";

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved'
}

export enum RoomGender {
  MALE = 'male',
  FEMALE = 'female',
  MIXED = 'mixed'
}

export interface Room {
  id: string;
  hostelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number | null;
  status: RoomStatus;
  currentOccupancy: number;
  maxOccupancy: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  hostel?: Hostel;
  roomType?: RoomType;
}

export interface RoomType {
  id: string;
  hostelId: string;
  name: string;
  description: string;
  pricePerSemester: number;
  capacity: number;
  gender: RoomGender;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  images: string[];
}