export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum BookingType {
  SEMESTER = 'semester',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  OVERDUE = 'overdue',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Room {
  id: string;
  hostelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  currentOccupancy: number;
  maxOccupancy: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  roomType?: RoomType;
}

export interface RoomType {
  id: string;
  hostelId: string;
  name: string;
  description: string;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
  capacity: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  createdAt: string;
  updatedAt: string;
  allowedGenders?: string[]; // Added this missing property
}

// API Response type that matches what your backend returns
export interface ApiRoom {
  id: string;
  roomNumber: string;
  floor: number;
  maxOccupancy: number;
  currentOccupancy: number;
  status: string;
  hostelId?: string; // Optional since it might not always be included
  roomTypeId?: string; // Optional since it might not always be included
  createdAt?: string; // Optional since it might not always be included
  updatedAt?: string; // Optional since it might not always be included
  notes?: string;
  roomType: {
    id: string;
    name: string;
    pricePerSemester: number;
    pricePerMonth: number;
    pricePerWeek?: number;
    capacity: number;
    amenities: string[];
    allowedGenders?: string[];
    hostelId?: string;
    description?: string;
    totalRooms?: number;
    availableRooms?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Helper function to convert ApiRoom to Room
export function apiRoomToRoom(apiRoom: ApiRoom): Room {
  return {
    id: apiRoom.id,
    hostelId: apiRoom.hostelId || '',
    roomTypeId: apiRoom.roomType.id,
    roomNumber: apiRoom.roomNumber,
    floor: apiRoom.floor,
    status: apiRoom.status as RoomStatus,
    currentOccupancy: apiRoom.currentOccupancy,
    maxOccupancy: apiRoom.maxOccupancy,
    notes: apiRoom.notes,
    createdAt: apiRoom.createdAt || new Date().toISOString(),
    updatedAt: apiRoom.updatedAt || new Date().toISOString(),
    roomType: {
      id: apiRoom.roomType.id,
      hostelId: apiRoom.roomType.hostelId || apiRoom.hostelId || '',
      name: apiRoom.roomType.name,
      description: apiRoom.roomType.description || '',
      pricePerSemester: apiRoom.roomType.pricePerSemester,
      pricePerMonth: apiRoom.roomType.pricePerMonth,
      pricePerWeek: apiRoom.roomType.pricePerWeek,
      capacity: apiRoom.roomType.capacity,
      amenities: apiRoom.roomType.amenities,
      allowedGenders: apiRoom.roomType.allowedGenders,
      totalRooms: apiRoom.roomType.totalRooms || 0,
      availableRooms: apiRoom.roomType.availableRooms || 0,
      createdAt: apiRoom.roomType.createdAt || new Date().toISOString(),
      updatedAt: apiRoom.roomType.updatedAt || new Date().toISOString(),
    }
  };
}

export interface Booking {
  id: string;
  hostelId: string;
  roomId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  bookingType: BookingType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentDueDate?: string;
  specialRequests?: string;
  notes?: string;
  emergencyContacts?: EmergencyContact[];
  confirmedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  hostel?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType?: RoomType;
  };
}

export interface BookingFormData {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  checkInDate: string;
  checkOutDate: string;
  bookingType: BookingType;
  specialRequests?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface BookingCalculation {
  duration: number;
  totalAmount: number;
  priceBreakdown: {
    basePrice: number;
    bookingType: BookingType;
    quantity: number;
  };
}

// UI Component Props
export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: RoomType;
  hostel: {
    id: string;
    name: string;
    address: string;
  };
  availableRooms: Room[];
}

export interface BookingConfirmationProps {
  booking: Booking;
  onClose: () => void;
}

export interface RoomCardProps {
  roomType: RoomType;
  hostelId: string;
  onBook: (roomType: RoomType) => void;
  className?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookingListResponse extends PaginatedResponse<Booking> {}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

// Form Validation
export interface BookingFormErrors {
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  bookingType?: string;
  specialRequests?: string;
  emergencyContacts?: string;
  general?: string;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    bookingId: string;
    status: BookingStatus;
    studentName: string;
    roomNumber: string;
  };
}

export interface BookingCalendarData {
  month: string;
  calendar: Record<string, Array<{
    id: string;
    studentName: string;
    roomNumber: string;
    status: BookingStatus;
    checkOutDate: string;
  }>>;
  totalBookings: number;
}