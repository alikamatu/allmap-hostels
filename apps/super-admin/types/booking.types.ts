export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue';

export type BookingType = 
  | 'semester'
  | 'monthly'
  | 'weekly'
  | 'daily';

export interface BookingRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  student?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    school_id: string;
  } | null;
  hostelId: string;
  hostel: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  roomId: string;
  room: {
    id: string;
    roomNumber: string;
    floor: string;
    maxOccupancy: number;
    currentOccupancy: number;
    roomTypeId: string;
    roomType?: {
      id: string;
      name: string;
      pricePerSemester: number;
      pricePerMonth: number;
      pricePerWeek: number;
    };
  };
  bookingType: BookingType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  bookingFee: number;
  bookingFeePaid: boolean;
  paymentReference?: string;
  specialRequests?: string;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  notes?: string;
  createdAt: Date | string;
  confirmedAt?: Date | string;
  checkedInAt?: Date | string;
  checkedOutAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  duration: number;
  isOverdue: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canCancel: boolean;
  paymentProgress: number;
  paymentDueDate?: Date | string;
}

export interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  collectedRevenue: number;
  bookingFeesCollected: number;
  byBookingType: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  occupancyRate: number;
  averageStayDuration: number;
  cancellationRate: number;
  growthRate: number;
}

export interface BookingFilters {
  hostelId?: string;
  roomId?: string;
  studentId?: string;
  status?: BookingStatus | BookingStatus[];
  paymentStatus?: PaymentStatus;
  bookingType?: BookingType;
  checkInFrom?: string;
  checkInTo?: string;
  search?: string;
  overdueOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}