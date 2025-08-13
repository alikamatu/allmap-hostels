import { BookingStatus, BookingType, PaymentStatus } from '@/types/booking';

export interface CreateBookingRequest {
  hostelId: string;
  roomId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  checkInDate: string;
  checkOutDate: string;
  bookingType: BookingType;
  specialRequests?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
}

export interface BookingResponse {
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
  paymentDueDate: string;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  hostel?: {
    id: string;
    name: string;
    address: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType: {
      id: string;
      name: string;
      pricePerSemester: number;
      pricePerMonth: number;
      pricePerWeek?: number;
    };
  };
}

export interface RoomAvailabilityResponse {
  checkInDate: string;
  checkOutDate: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  rooms: Array<{
    id: string;
    roomNumber: string;
    floor: number;
    maxOccupancy: number;
    currentOccupancy: number;
    roomType: {
      id: string;
      name: string;
      pricePerSemester: number;
      pricePerMonth: number;
      pricePerWeek?: number;
      capacity: number;
      amenities: string[];
    };
  }>;
}

class BookingService {
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

  // Create a new booking
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    return this.makeRequest<BookingResponse>('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Check room availability for specific dates
  async checkRoomAvailability(
    hostelId: string,
    checkIn: string,
    checkOut: string,
    roomTypeId?: string
  ): Promise<RoomAvailabilityResponse> {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      ...(roomTypeId && { roomTypeId }),
    });

    return this.makeRequest<RoomAvailabilityResponse>(
      `/bookings/hostel/${hostelId}/availability?${params}`
    );
  }

  // Get user's bookings
  async getUserBookings(studentId: string): Promise<BookingResponse[]> {
    return this.makeRequest<BookingResponse[]>(`/bookings/student/${studentId}`);
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<BookingResponse> {
    return this.makeRequest<BookingResponse>(`/bookings/${bookingId}`);
  }

  // Update booking
  async updateBooking(
    bookingId: string,
    updateData: Partial<CreateBookingRequest>
  ): Promise<BookingResponse> {
    return this.makeRequest<BookingResponse>(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Cancel booking
  async cancelBooking(
    bookingId: string,
    reason: string,
    notes?: string
  ): Promise<BookingResponse> {
    return this.makeRequest<BookingResponse>(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason, notes }),
    });
  }

  // Extend booking
  async extendBooking(
    bookingId: string,
    newCheckOutDate: string,
    reason?: string
  ): Promise<BookingResponse> {
    return this.makeRequest<BookingResponse>(`/bookings/${bookingId}/extend`, {
      method: 'PATCH',
      body: JSON.stringify({ newCheckOutDate, reason }),
    });
  }

  // Get booking calendar for a hostel
  async getBookingCalendar(hostelId: string, month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.makeRequest(`/bookings/hostel/${hostelId}/calendar${params}`);
  }

  // Calculate booking price
  calculateBookingPrice(
    pricePerSemester: number,
    pricePerMonth: number,
    pricePerWeek: number | undefined,
    bookingType: BookingType,
    checkIn: Date,
    checkOut: Date
  ): number {
    const duration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (bookingType) {
      case BookingType.SEMESTER:
        return pricePerSemester;
      case BookingType.MONTHLY:
        const months = Math.ceil(duration / 30);
        return pricePerMonth * months;
      case BookingType.WEEKLY:
        const weeks = Math.ceil(duration / 7);
        return pricePerWeek ? pricePerWeek * weeks : (pricePerMonth * weeks) / 4;
      default:
        return 0;
    }
  }

  // Format currency
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(price);
  }

  // Validate booking dates
  validateBookingDates(checkIn: Date, checkOut: Date): string | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return 'Check-in date cannot be in the past';
    }

    if (checkOut <= checkIn) {
      return 'Check-out date must be after check-in date';
    }

    // Check if booking is too far in advance (e.g., 1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (checkIn > oneYearFromNow) {
      return 'Check-in date cannot be more than one year in advance';
    }

    return null;
  }

  // Get duration in days
  getDurationInDays(checkIn: Date, checkOut: Date): number {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const bookingService = new BookingService();