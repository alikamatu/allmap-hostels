import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

export const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.PENDING:
    case BookingStatus.NO_SHOW:
    case BookingStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800';
    case BookingStatus.CONFIRMED:
    case BookingStatus.CHECKED_IN:
    case BookingStatus.CHECKED_OUT:
      return 'bg-black text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
    case PaymentStatus.CANCELLED:
      return 'bg-black text-white';
    case PaymentStatus.PARTIAL:
    case PaymentStatus.PENDING:
    case PaymentStatus.OVERDUE:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'GHS' 
  }).format(price);
};

export const canWriteReview = (booking: Booking): boolean => {
  return booking.status === BookingStatus.CHECKED_OUT && !booking.hasReview;
};

export const calculatePaymentRequirement = (booking: Booking) => {
  const minRequired = booking.totalAmount * 0.5;
  const daysUntilCancel = getDaysUntilAutoCancel(booking);
  
  return {
    minimumRequired: minRequired,
    meetsRequirement: booking.amountPaid >= minRequired,
    daysUntilAutoCancel: daysUntilCancel,
    requirementDescription: `At least 50% (GHS ${minRequired.toFixed(2)}) of the semester fee must be paid within 7 days to avoid automatic cancellation`
  };
};

const getDaysUntilAutoCancel = (booking: Booking): number => {
  if (!booking.autoCancelAt) return 7;
  
  const autoCancelDate = new Date(booking.autoCancelAt);
  const now = new Date();
  const diffTime = autoCancelDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};