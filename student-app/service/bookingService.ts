import { BookingStatus, BookingType, PaymentStatus } from '@/types/booking';

export interface CreateBookingRequest {
  hostelId: string;
  roomId: string;
  studentId: string;
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
  depositAmount: number;
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
  confirmedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
    autoCancelAt?: string; // Add this property
  paymentRequirements?: {
    minimumRequired: number;
    meetsRequirement: boolean;
    daysUntilAutoCancel: number;
    requirementDescription: string;
  };
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
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
      allowedGenders?: string[];
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
    status: string;
    roomType: {
      id: string;
      name: string;
      pricePerSemester: number;
      pricePerMonth: number;
      pricePerWeek?: number;
      capacity: number;
      amenities: string[];
      allowedGenders?: string[];
    };
  }>;
}

export interface PaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE';
  transactionRef?: string;
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  transactionRef?: string;
  notes?: string;
  paymentDate: string;
  receivedBy?: string;
  createdAt: string;
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
      
      // Handle specific backend error messages
      if (errorData.message) {
        throw new Error(errorData.message);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

   calculatePaymentRequirement(booking: BookingResponse) {
    const minRequired = booking.totalAmount * 0.5; // 50% of semester fee
    const daysUntilCancel = this.getDaysUntilAutoCancel(booking);
    
    return {
      minimumRequired: minRequired,
      meetsRequirement: booking.amountPaid >= minRequired,
      daysUntilAutoCancel: daysUntilCancel,
      requirementDescription: `At least 50% (GHS ${minRequired.toFixed(2)}) of the semester fee must be paid within 7 days to avoid automatic cancellation`
    };
  }

  // Calculate days until auto-cancellation
  private getDaysUntilAutoCancel(booking: BookingResponse): number {
    if (!booking.autoCancelAt) return 7; // Default 7 days if not set
    
    const autoCancelDate = new Date(booking.autoCancelAt);
    const now = new Date();
    const diffTime = autoCancelDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // Create a new booking with enhanced error handling
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    try {
      return await this.makeRequest<BookingResponse>('/bookings/create-with-deposit-balance', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    } catch (error: any) {
      // Re-throw with enhanced context
      if (error.message.includes('already have an active booking')) {
        throw new Error(error.message);
      }
      if (error.message.includes('gender')) {
        throw new Error(error.message);
      }
      if (error.message.includes('Room is not available')) {
        throw new Error('This room is no longer available for booking. Please select another room or different dates.');
      }
      if (error.message.includes('Room is already booked')) {
        throw new Error('This room has been booked by another user. Please select another room.');
      }
      throw error;
    }
  }

async createBookingWithDeposit(bookingData: any): Promise<BookingResponse> {
  try {
    const response = await this.makeRequest<BookingResponse>('/bookings/create-with-deposit', {
      method: 'POST',
      body: JSON.stringify({
        ...bookingData,
        depositAmount: 70,
        bookingFeeAmount: 70,
        paymentReference: `deposit_${Date.now()}`,
        paymentVerified: true,
      }),
    });
    return response;
  } catch (error: any) {
    // If dedicated endpoint fails, try regular booking endpoint
    if (error.message.includes('create-with-deposit')) {
      return await this.createBooking(bookingData);
    }
    throw error;
  }
}

  // Check room availability for specific dates with enhanced filtering
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

    try {
      const response = await this.makeRequest<RoomAvailabilityResponse>(
        `/bookings/hostel/${hostelId}/availability?${params}`
      );
      
      // Filter out rooms that are not actually available
      // response.rooms = response.rooms.filter(room => 
      //   room.status === 'available' && 
      //   room.currentOccupancy < room.maxOccupancy
      // );
      
      response.availableRooms = response.rooms.length;
      
      return response;
    } catch (error: any) {
      throw new Error(`Failed to check room availability: ${error.message}`);
    }
  }

  

  async getUserBookings(studentId: string): Promise<BookingResponse[]> {
    try {
      const bookings = await this.makeRequest<BookingResponse[]>(`/bookings/student/${studentId}`);
      
      // Add payment requirements to each booking
      const bookingsWithRequirements = bookings.map(booking => {
        if (booking.status === 'confirmed' || booking.status === 'pending') {
          return {
            ...booking,
            paymentRequirements: this.calculatePaymentRequirement(booking)
          };
        }
        return booking;
      });
      
      return bookingsWithRequirements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch your bookings: ${error.message}`);
    }
  }

  async hasActiveBooking(studentId: string): Promise<{
    hasActive: boolean;
    activeBooking?: BookingResponse;
  }> {
    try {
      const bookings = await this.getUserBookings(studentId);
      const activeStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN];
      
      const activeBooking = bookings.find(booking => 
        activeStatuses.includes(booking.status)
      );
      
      return {
        hasActive: !!activeBooking,
        activeBooking
      };
    } catch (error) {
      console.error('Error checking active booking:', error);
      return { hasActive: false };
    }
  }

  async getBookingById(bookingId: string): Promise<BookingResponse> {
    const booking = await this.makeRequest<BookingResponse>(`/bookings/${bookingId}`);
    
    // Add payment requirements calculation
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      booking.paymentRequirements = this.calculatePaymentRequirement(booking);
    }
    
    return booking;
  }

  async updateBooking(
    bookingId: string,
    updateData: Partial<CreateBookingRequest>
  ): Promise<BookingResponse> {
    return this.makeRequest<BookingResponse>(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

    // Cancel booking with reason
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

  // Enhanced date validation
  validateBookingDates(checkIn: Date, checkOut: Date): string | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return 'Check-in date cannot be in the past';
    }

    if (checkOut <= checkIn) {
      return 'Check-out date must be after check-in date';
    }

    // Minimum stay requirement (1 day)
    const minStayDays = 1;
    const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (stayDuration < minStayDays) {
      return `Minimum stay is ${minStayDays} day(s)`;
    }

    // Check if booking is too far in advance (1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (checkIn > oneYearFromNow) {
      return 'Check-in date cannot be more than one year in advance';
    }

    // Maximum booking duration based on type
    const maxDurations = {
      [BookingType.WEEKLY]: 28, // 4 weeks max
      [BookingType.MONTHLY]: 365, // 12 months max
      [BookingType.SEMESTER]: 180, // 6 months max
    };

    return null;
  }

    // Validate booking constraints
  validateBookingConstraints(
    userProfile: any,
    roomType: any,
    checkIn: Date,
    checkOut: Date,
    bookingType: BookingType
  ): string[] {
    const errors: string[] = [];

    // Gender compatibility check
    if (userProfile?.gender && roomType?.allowedGenders) {
      const userGender = userProfile.gender.toLowerCase();
      const allowedGenders = roomType.allowedGenders.map((g: string) => g.toLowerCase());
      
      if (!allowedGenders.includes(userGender) && !allowedGenders.includes('mixed')) {
        const allowedGendersText = allowedGenders.join(', ');
        errors.push(`This room is restricted to ${allowedGendersText} students only.`);
      }
    }

    // Date validation
    const dateError = this.validateBookingDates(checkIn, checkOut);
    if (dateError) {
      errors.push(dateError);
    }

    // Booking type specific validations
    const duration = this.getDurationInDays(checkIn, checkOut);
    
    if (bookingType === BookingType.WEEKLY && duration > 28) {
      errors.push('Weekly bookings cannot exceed 4 weeks');
    }
    
    if (bookingType === BookingType.SEMESTER && duration > 180) {
      errors.push('Semester bookings cannot exceed 6 months');
    }

    return errors;
  }


  // Check booking constraints
  checkBookingConstraints(
    userProfile: any,
    roomType: any,
    checkIn: Date,
    checkOut: Date,
    bookingType: BookingType
  ): string[] {
    return this.validateBookingConstraints(
      userProfile,
      roomType,
      checkIn,
      checkOut,
      bookingType
    );
  }

   // Get booking payments
  async getBookingPayments(bookingId: string): Promise<PaymentResponse[]> {
    return this.makeRequest<PaymentResponse[]>(`/bookings/${bookingId}/payments`);
  }

  // Get booking calendar for a hostel
  async getBookingCalendar(hostelId: string, month?: string) {
    const params = month ? `?month=${month}` : '';
    return this.makeRequest(`/bookings/hostel/${hostelId}/calendar${params}`);
  }

  // Get duration in days
  getDurationInDays(checkIn: Date, checkOut: Date): number {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const bookingService = new BookingService();