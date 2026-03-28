/**
 * Shared TypeScript definitions for Allmap Hostels monorepo.
 */

// --- Enums ---

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
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
  // Admin App might use these
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export enum RoomGender {
  MALE = 'male',
  FEMALE = 'female',
  MIXED = 'mixed',
  OTHER = 'other'
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export { RoomGender as AllowedGender };

export enum PaymentMethod {
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  CHEQUE = 'CHEQUE',
}

// --- Common Types ---

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

// --- Paystack ---

export interface PaystackResponse {
  reference: string;
  status?: string;
  message?: string;
  transaction?: string;
}

export interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string; // Made optional based on instruction
  ref: string;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string | number; // Updated type
    }>;
  };
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
  plan?: string; // Added
  quantity?: number; // Added
  subaccount?: string; // Added
  transaction_charge?: number; // Added
  bearer?: string; // Added
}

export interface PaystackPop {
  setup: (options: PaystackOptions) => {
    openIframe: () => void;
  };
}

// --- User Profile ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  is_verified: boolean;
  role: string;
  school_id: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  emergency_contact_email?: string;
  school?: {
    id: string;
    name: string;
    domain: string;
    location: string;
  };
}

// --- Hostel ---

export interface Hostel {
  id: string;
  name: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  images?: string[];
  amenities: {
    wifi?: boolean;
    laundry?: boolean;
    cafeteria?: boolean;
    parking?: boolean;
    security?: boolean;
  };
  location?: string | {
    lat: number;
    lng: number;
  };
  adminId?: string;
  created_at?: string;
  updated_at?: string;
  rating: number;
  reviews: number;
  accepting_bookings: boolean;
  roomTypes: RoomType[];
  is_verified: boolean;
  contact?: {
    admin?: string;
    phone?: string;
    email?: string;
  };
}

// --- Room & RoomType ---

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
  allowedGenders?: string[];
  gender?: RoomGender;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

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

export interface Room {
  id: string;
  hostelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number | null;
  status: RoomStatus;
  currentOccupancy: number;
  maxOccupancy: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  roomType?: RoomType;
  hostel?: Hostel;
}

// --- Booking ---

export interface Booking {
  id: string;
  hostelId: string;
  roomId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  bookingType: BookingType;
  hasReview: boolean;
  autoCancelAt?: string;
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
  paymentRequirements?: {
    minimumRequired: number;
    meetsRequirement: boolean;
    daysUntilAutoCancel: number;
    requirementDescription: string;
  };
  hostel?: Partial<Hostel>;
  room?: {
    id: string;
    roomNumber: string;
    floor: number;
    roomType?: Partial<RoomType>;
  };
}

export type BookingResponse = Booking;

export interface RoomAvailabilityResponse {
  checkInDate: string;
  checkOutDate: string;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  rooms: ApiRoom[];
}

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
  emergencyContacts?: EmergencyContact[];
  depositAmount?: number;
}

// --- UI Component Props ---

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

export interface BookingFilters {
  hostelId?: string;
  roomTypeId?: string;
  status?: BookingStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  bookingType?: BookingType | 'all';
  checkInDate?: string;
  checkOutDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  dateRange?: {
    from: string;
    to: string;
  };
}

// --- Calendar ---

export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  resource?: {
    bookingId: string;
    status: BookingStatus;
    studentName: string;
    roomNumber: string;
  };
}

export interface CreateBookingWithDepositRequest extends CreateBookingRequest {
  useDepositBalance: boolean;
}

export interface RoomAvailabilityCheck {
  available: boolean;
  roomId: string;
  currentOccupancy: number;
  maxOccupancy: number;
  status: string;
  lastChecked: string;
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

// --- API Response Types ---

export interface ApiRoom {
  id: string;
  roomNumber: string;
  floor: number;
  maxOccupancy: number;
  currentOccupancy: number;
  status: string;
  hostelId?: string;
  roomTypeId?: string;
  createdAt?: string;
  updatedAt?: string;
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

// --- Payment ---

export interface PaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: string;
  transactionRef?: string;
  notes?: string;
  paymentDate: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  transactionRef?: string;
  notes?: string;
  receivedBy?: string;
  paymentType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Reviews ---

export interface DetailedRatings {
  cleanliness?: number;
  security?: number;
  location?: number;
  staff?: number;
  facilities?: number;
  valueForMoney?: number;
  [key: string]: number | undefined;
}

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  reviewText: string;
  detailedRatings?: DetailedRatings;
  images?: string[];
}

export interface Review {
  id: string;
  hostelId: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  rating: number;
  reviewText: string;
  detailedRatings?: DetailedRatings;
  images: string[];
  status: ReviewStatus;
  helpfulVotes: string[];
  helpfulCount: number;
  hostelResponse?: string;
  hostelRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  averageDetailedRatings: Record<string, number>;
  totalHelpfulVotes: number;
}

export interface UpdateReviewDto {
  rating?: number;
  reviewText?: string;
  detailedRatings?: DetailedRatings;
  images?: string[];
}

export interface ReviewFilterDto {
  hostelId?: string;
  studentId?: string;
  status?: ReviewStatus;
  rating?: number | string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface ModerateReviewDto {
  status: ReviewStatus;
  notes?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HostelResponseDto {
  response: string;
}

export interface ReviewsAPIService {
  getHostels(): Promise<Hostel[]>;
  getHostelReviews(hostelId: string, params?: Partial<ReviewFilterDto>): Promise<ReviewsResponse>;
  getHostelReviewStats(hostelId: string): Promise<ReviewStats>;
  addHostelResponse(reviewId: string, response: string): Promise<Review>;
  getReviewById(reviewId: string): Promise<Review>;
  getReviewByBookingId(bookingId: string): Promise<{ review: Review | null }>;
  toggleHelpfulVote(reviewId: string): Promise<Review>;
  updateReview(reviewId: string, data: UpdateReviewDto): Promise<Review>;
  deleteReview(reviewId: string): Promise<void>;
  moderateReview(reviewId: string, data: ModerateReviewDto): Promise<Review>;
  searchReviews(searchTerm: string, filters?: Partial<ReviewFilterDto>): Promise<ReviewsResponse>;
  getRecentReviews(limit?: number): Promise<Review[]>;
  getStudentReviews(studentId: string, filters?: Partial<ReviewFilterDto>): Promise<ReviewsResponse>;
  getEligibleBookingsForReview(studentId: string): Promise<{ bookingIds: string[] }>;
  canReviewBooking(bookingId: string, studentId: string): Promise<{ canReview: boolean }>;
}

// --- Deposit ---

export interface Deposit {
  id: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  paymentStatus: string;
  paymentDate: string;
  createdAt: string;
}

export interface DepositBalance {
  studentId?: string;
  balance: number;
  availableBalance: number;
  totalBalance?: number;
  pendingDeposits?: number;
  lastUpdated?: string;
}

export interface CreateDepositRequest {
  amount: number;
  paymentMethod: string;
  transactionRef: string;
}

export interface VerifyDepositRequest {
  transactionRef: string;
  paymentReference: string;
}

// --- Hostel UI specific types ---

export interface HostelCard {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string;
  address: string;
  location: string;
  coords: [number, number] | null;
  lowestPrice: number;
  highestPrice: number;
  base_price: number | null;
  distance: number | null;
  accepting_bookings: boolean;
  is_verified: boolean;
}

export interface HostelFilters {
  sortBy: 'price' | 'availability';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

// --- Onboarding ---

export interface School {
  id: string;
  name: string;
  domain?: string;
  location?: string;
}

export interface OnboardingData {
  name: string;
  phone: string;
  gender: string;
  school_id: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  emergency_contact_email?: string;
  last_onboarding_step?: number;
}

export type OnboardingStep = 1 | 2 | 3;
