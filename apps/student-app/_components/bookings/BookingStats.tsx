import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { FaHome, FaCalendarAlt, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import { canWriteReview } from '@/utils/bookingHelpers';

interface BookingStatsProps {
  bookings: Booking[];
}

export const BookingStats = ({ bookings }: BookingStatsProps) => {
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => 
      [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(b.status)
    ).length,
    pendingPayment: bookings.filter(b => 
      [PaymentStatus.PENDING, PaymentStatus.OVERDUE].includes(b.paymentStatus)
    ).length,
    reviewsToWrite: bookings.filter(b => canWriteReview(b)).length,
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.total,
      icon: FaHome,
    },
    {
      label: 'Active Bookings',
      value: stats.active,
      icon: FaCalendarAlt,
    },
    {
      label: 'Pending Payment',
      value: stats.pendingPayment,
      icon: FaMoneyBillWave,
    },
    {
      label: 'Reviews to Write',
      value: stats.reviewsToWrite,
      icon: FaStar,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="p-4 bg-gray-50 border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-800">{stat.label}</p>
              <p className="text-2xl font-bold text-black">{stat.value}</p>
            </div>
            <stat.icon className="text-black text-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};