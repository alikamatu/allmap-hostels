export interface CreateBookingWithDepositRequest {
  hostelId: string;
  roomId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  checkInDate: string;
  checkOutDate: string;
  bookingType: 'semester' | 'monthly' | 'weekly';
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  useDepositBalance: boolean;
  depositAmount: number;
}

export interface RoomAvailabilityCheck {
  available: boolean;
  roomId: string;
  currentOccupancy: number;
  maxOccupancy: number;
  status: string;
  lastChecked: string;
}

class EnhancedBookingService {
  private baseURL: string;
  private readonly BOOKING_FEE = 70;

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

  /**
   * CRITICAL: Perform final room availability check before booking
   * This ensures no overbooking occurs
   */
  async performFinalAvailabilityCheck(
    hostelId: string,
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<RoomAvailabilityCheck> {
    try {
      const availability = await this.makeRequest<any>(
        `/bookings/hostel/${hostelId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`
      );

      const room = availability.rooms.find((r: any) => r.id === roomId);

      if (!room) {
        return {
          available: false,
          roomId,
          currentOccupancy: 0,
          maxOccupancy: 0,
          status: 'not_found',
          lastChecked: new Date().toISOString()
        };
      }

      const isAvailable = 
        room.status === 'available' && 
        room.currentOccupancy < room.maxOccupancy;

      return {
        available: isAvailable,
        roomId: room.id,
        currentOccupancy: room.currentOccupancy,
        maxOccupancy: room.maxOccupancy,
        status: room.status,
        lastChecked: new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(`Failed to verify room availability: ${error.message}`);
    }
  }

  /**
   * Check room availability with real-time updates
   */
  async checkRoomAvailability(
    hostelId: string,
    checkIn: string,
    checkOut: string,
    roomTypeId?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      ...(roomTypeId && { roomTypeId }),
    });

    try {
      const response = await this.makeRequest<any>(
        `/bookings/hostel/${hostelId}/availability?${params}`
      );
      
      // Filter rooms with actual capacity
      response.rooms = response.rooms.filter((room: any) => 
        room.status === 'available' && 
        room.currentOccupancy < room.maxOccupancy
      );
      
      response.availableRooms = response.rooms.length;
      
      return response;
    } catch (error: any) {
      throw new Error(`Failed to check room availability: ${error.message}`);
    }
  }

  /**
   * Create booking with automatic deposit deduction
   * Includes multiple safety checks to prevent overbooking
   */
  async createBookingWithDeposit(
    bookingData: CreateBookingWithDepositRequest
  ): Promise<any> {
    try {
      // Step 1: Verify deposit balance first
      const depositBalance = await this.makeRequest<any>('/deposits/balance');
      
      if (depositBalance.availableBalance < this.BOOKING_FEE) {
        throw new Error(
          `Insufficient deposit balance. You have GHS ${depositBalance.availableBalance.toFixed(2)} ` +
          `but need at least GHS ${this.BOOKING_FEE.toFixed(2)} to proceed.`
        );
      }

      // Step 2: CRITICAL - Final availability check
      console.log('Performing final availability check...');
      const availabilityCheck = await this.performFinalAvailabilityCheck(
        bookingData.hostelId,
        bookingData.roomId,
        bookingData.checkInDate,
        bookingData.checkOutDate
      );

      if (!availabilityCheck.available) {
        if (availabilityCheck.status === 'not_found') {
          throw new Error('This room is no longer available. Please select another room.');
        } else if (availabilityCheck.currentOccupancy >= availabilityCheck.maxOccupancy) {
          throw new Error('This room is now fully booked. Please select another room.');
        } else {
          throw new Error('This room is not currently available for booking.');
        }
      }

      console.log('Room availability confirmed. Proceeding with booking...');

      // Step 3: Create booking (backend will handle deposit deduction atomically)
      const booking = await this.makeRequest<any>('/bookings/create-with-deposit', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingData,
          bookingFeeAmount: this.BOOKING_FEE,
          paymentMethod: 'ACCOUNT_CREDIT'
        }),
      });

      console.log('Booking created successfully:', booking.id);
      return booking;

    } catch (error: any) {
      console.error('Booking creation failed:', error);
      
      // Enhanced error messages
      if (error.message.includes('already have an active booking')) {
        throw new Error(
          'You already have an active booking. Please complete or cancel your current booking before creating a new one.'
        );
      }
      
      if (error.message.includes('gender')) {
        throw new Error(error.message);
      }
      
      if (error.message.includes('no longer available') || 
          error.message.includes('fully booked')) {
        throw new Error(
          'This room was just booked by another user. Please select a different room.'
        );
      }

      throw error;
    }
  }

  /**
   * Get user's deposit balance
   */
  async getUserDepositBalance(): Promise<{
    totalBalance: number;
    availableBalance: number;
    pendingDeposits: number;
  }> {
    return this.makeRequest('/deposits/balance');
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(studentId: string): Promise<any[]> {
    try {
      const bookings = await this.makeRequest<any[]>(`/bookings/student/${studentId}`);
      return bookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  }

  /**
   * Check if user has active booking
   */
  async hasActiveBooking(studentId: string): Promise<{
    hasActive: boolean;
    activeBooking?: any;
  }> {
    try {
      const bookings = await this.getUserBookings(studentId);
      const activeStatuses = ['pending', 'confirmed', 'checked_in'];
      
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

  /**
   * Calculate booking price
   */
  calculateBookingPrice(
    pricePerSemester: number,
    pricePerMonth: number,
    pricePerWeek: number | undefined,
    bookingType: string,
    checkIn: Date,
    checkOut: Date
  ): number {
    const duration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    switch (bookingType) {
      case 'semester':
        return pricePerSemester;
      case 'monthly':
        const months = Math.ceil(duration / 30);
        return pricePerMonth * months;
      case 'weekly':
        const weeks = Math.ceil(duration / 7);
        return pricePerWeek ? pricePerWeek * weeks : (pricePerMonth * weeks) / 4;
      default:
        return 0;
    }
  }

  /**
   * Format price in GHS
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(price);
  }

  /**
   * Validate booking dates
   */
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

    const stayDuration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (stayDuration < 1) {
      return 'Minimum stay is 1 day';
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (checkIn > oneYearFromNow) {
      return 'Check-in date cannot be more than one year in advance';
    }

    return null;
  }

  /**
   * Get booking fee amount
   */
  getBookingFee(): number {
    return this.BOOKING_FEE;
  }
}

export const enhancedBookingService = new EnhancedBookingService();