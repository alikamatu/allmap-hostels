import { 
  BookingStatus, 
  BookingType, 
  PaymentStatus, 
  RoomStatus, 
  EmergencyContact,
  Room,
  RoomType,
  Booking as BaseBooking,
  BookingFormData,
  BookingCalculation
} from '@repo/types';

export { 
  BookingStatus, 
  BookingType, 
  PaymentStatus, 
  RoomStatus 
};

export type {
  EmergencyContact,
  Room,
  RoomType,
  BaseBooking,
  BookingFormData,
  BookingCalculation
};

export interface Booking extends BaseBooking {
  getDurationInDays: () => number;
  getPaymentProgress: () => number;
  isOverdue: () => boolean;
}

import { 
  BookingModalProps as BaseBookingModalProps,
  BookingFilters as BaseBookingFilters,
  BookingConfirmationProps as BaseBookingConfirmationProps,
  RoomCardProps as BaseRoomCardProps,
  PaginatedResponse,
  ApiError,
  BookingFormErrors,
  CalendarEvent,
  BookingCalendarData
} from '@repo/types';

export type { 
  PaginatedResponse, 
  ApiError, 
  BookingFormErrors, 
  CalendarEvent, 
  BookingCalendarData 
};

// UI Component Props
export type BookingModalProps = BaseBookingModalProps;
export type BookingConfirmationProps = BaseBookingConfirmationProps;
export type RoomCardProps = BaseRoomCardProps;

export interface BookingFilters extends BaseBookingFilters {
  search: string;
  excludeStatuses: BookingStatus[];
}

export type BookingListResponse = PaginatedResponse<Booking>;