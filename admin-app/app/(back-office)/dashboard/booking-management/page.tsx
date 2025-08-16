"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
 Download, Plus, 
} from 'lucide-react';

// Types
import { Booking, BookingStatus, PaymentStatus, BookingType } from '@/types/booking';
import { Hostel } from '@/types/hostel';

// Components
import BookingFilters from '@/components/dashboard/components/bookings/BookingFilters';
import BookingsList from '@/components/dashboard/components/bookings/BookingsList';
import BookingDetailsModal from '@/components/dashboard/components/bookings/BookingDetailsModal';
import PaymentModal from '@/components/dashboard/components/bookings/PaymentModal';
import CheckInModal from '@/components/dashboard/components/bookings/CheckInModal';
import CheckOutModal from '@/components/dashboard/components/bookings/CheckOutModal';
import BookingStatsCards from '@/components/dashboard/components/bookings/BookingStatsCards';
import BulkActionsBar from '@/components/dashboard/components/bookings/BulkActionsBar';
import CreateBookingModal from '@/components/dashboard/components/bookings/CreateBookingModal';

// Hooks
import { useBookings } from '@/hooks/useBookings';
import { usePayments } from '@/hooks/usePayments';

// Utils
import { exportToExcel } from '@/utils/export';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface BookingFilters {
  search: string;
  status: BookingStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  bookingType: BookingType | 'all';
  hostelId: string;
  dateRange: {
    from: string;
    to: string;
  };
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

const BookingManagementPage: React.FC = () => {
  // State
  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    bookingType: 'all',
    hostelId: '',
    dateRange: { from: '', to: '' },
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Modal states
  const [modals, setModals] = useState({
    details: false,
    payment: false,
    checkIn: false,
    checkOut: false,
    create: false
  });

  // Custom hooks
  const { 
    bookings, 
    loading: bookingsLoading, 
    pagination,
    stats,
    fetchBookings,
    confirmBooking,
    cancelBooking,
    checkInBooking,
    checkOutBooking,
    getBookingById // Make sure this method exists in your hook
  } = useBookings();

  const {
    recordPayment,
    loading: paymentLoading
  } = usePayments();

  // Fetch hostels on mount
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/hostels/fetch`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHostels(data);
        }
      } catch (error) {
        console.error('Failed to fetch hostels:', error);
      }
    };
    
    fetchHostels();
  }, []);

  // Fetch bookings when filters change
  useEffect(() => {
    const filterParams = {
      page: currentPage,
      limit: pageSize,
      ...filters,
      ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
      ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
    };
    
    fetchBookings(filterParams);
  }, [filters, currentPage, pageSize, fetchBookings]);

  // Helper function to refresh selected booking data
  const refreshSelectedBooking = useCallback(async (bookingId: string) => {
    try {
      if (getBookingById) {
        const updatedBooking = await getBookingById(bookingId);
        setSelectedBooking(updatedBooking);
      }
    } catch (error) {
      console.error('Failed to refresh booking data:', error);
    }
  }, [getBookingById]);

  // Helper function to update booking in the list
  const updateBookingInList = useCallback((updatedBooking: Booking) => {
    // This would be handled by the fetchBookings call, but we could optimize by updating locally
    // For now, we'll rely on the refetch
  }, []);

  // Handlers
  const handleFilterChange = useCallback((newFilters: Partial<BookingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleBookingSelect = useCallback((bookingId: string, selected: boolean) => {
    setSelectedBookings(prev => 
      selected 
        ? [...prev, bookingId]
        : prev.filter(id => id !== bookingId)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedBookings(selected ? bookings.map(b => b.id) : []);
  }, [bookings]);

  const openModal = useCallback((modalType: keyof typeof modals, booking?: Booking) => {
    if (booking) setSelectedBooking(booking);
    setModals(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const closeModal = useCallback((modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
    if (modalType === 'details') setSelectedBooking(null);
  }, []);

// Updated payment handler in page.tsx
const handlePayment = async (bookingId: string, paymentData: any) => {
  try {
    console.log('Recording payment...', { bookingId, paymentData });

        const formattedPaymentData = {
      ...paymentData,
      transactionRef: paymentData.transactionRef || null // Convert empty string to null
    };
    
    // Record the payment using the hook
    const result = await recordPayment(bookingId, formattedPaymentData);

    console.log('Payment recorded successfully:', result);
    
    // The result structure from your backend should be { payment, booking }
    if (result.booking) {
      // Force update the selected booking with the fresh data from server
      console.log('Updating selected booking with fresh data:', {
        bookingId: result.booking.id,
        previousAmountPaid: selectedBooking?.amountPaid,
        newAmountPaid: result.booking.amountPaid,
        previousAmountDue: selectedBooking?.amountDue,
        newAmountDue: result.booking.amountDue,
        paymentStatus: result.booking.paymentStatus
      });
      
           setSelectedBooking(prev => prev ? {
      ...prev,
      amountPaid: result.booking.amountPaid,
      amountDue: result.booking.amountDue,
      paymentStatus: result.booking.paymentStatus
    } : null);
    }
    
    // Always refresh the bookings list to ensure consistency
    const filterParams = {
      page: currentPage,
      limit: pageSize,
      ...filters,
      ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
      ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
    };
    
    await fetchBookings(filterParams);
    
    // Close the payment modal
    closeModal('payment');
    
    console.log('Payment processing complete');
    
  } catch (error) {
    console.error('Payment failed:', error);
    // Re-throw to let PaymentModal handle the error display
    throw error;
  }
};
  

  const handleCheckIn = async (bookingId: string, checkInData: any) => {
    try {
      const updatedBooking = await checkInBooking(bookingId, checkInData);
      setSelectedBooking(updatedBooking);
      await fetchBookings({ page: currentPage, limit: pageSize, ...filters });
      closeModal('checkIn');
    } catch (error) {
      console.error('Check-in failed:', error);
      throw error;
    }
  };

  const handleCheckOut = async (bookingId: string, checkOutData: any) => {
    try {
      const updatedBooking = await checkOutBooking(bookingId, checkOutData);
      setSelectedBooking(updatedBooking);
      await fetchBookings({ page: currentPage, limit: pageSize, ...filters });
      closeModal('checkOut');
    } catch (error) {
      console.error('Check-out failed:', error);
      throw error;
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBookings.length === 0) return;
    
    try {
      switch (action) {
        case 'confirm':
          await Promise.all(selectedBookings.map(id => confirmBooking(id, { notes: 'Bulk confirmation' })));
          break;
        case 'cancel':
          await Promise.all(selectedBookings.map(id => cancelBooking(id, { 
            reason: 'Bulk cancellation', 
            notes: 'Cancelled via bulk action' 
          })));
          break;
      }
      
      setSelectedBookings([]);
      await fetchBookings({ page: currentPage, limit: pageSize, ...filters });
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      const allBookings = await fetchBookings({ 
        ...filters, 
        page: 1, 
        limit: 1000 
      });
      
      exportToExcel(allBookings.bookings, 'bookings', [
        { key: 'id', label: 'Booking ID' },
        { key: 'studentName', label: 'Student Name' },
        { key: 'studentEmail', label: 'Email' },
        { key: 'hostel.name', label: 'Hostel' },
        { key: 'room.roomNumber', label: 'Room' },
        { key: 'status', label: 'Status' },
        { key: 'paymentStatus', label: 'Payment Status' },
        { key: 'totalAmount', label: 'Total Amount' },
        { key: 'amountPaid', label: 'Amount Paid' },
        { key: 'checkInDate', label: 'Check-in Date' },
        { key: 'checkOutDate', label: 'Check-out Date' },
        { key: 'createdAt', label: 'Created At' }
      ]);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">
              Manage bookings, payments, and check-ins
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Booking
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <BookingStatsCards stats={stats} loading={bookingsLoading} />

        {/* Filters */}
        <BookingFilters
          filters={filters}
          hostels={hostels}
          onFilterChange={handleFilterChange}
        />

        {/* Bulk Actions Bar */}
        {selectedBookings.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedBookings.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedBookings([])}
          />
        )}

        {/* Bookings List */}
        <BookingsList
          bookings={bookings}
          loading={bookingsLoading}
          selectedBookings={selectedBookings}
          onBookingSelect={handleBookingSelect}
          onSelectAll={handleSelectAll}
          onViewDetails={(booking) => openModal('details', booking)}
          onPayment={(booking) => openModal('payment', booking)}
          onCheckIn={(booking) => openModal('checkIn', booking)}
          onCheckOut={(booking) => openModal('checkOut', booking)}
          onConfirm={confirmBooking}
          onCancel={cancelBooking}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Modals */}
        {selectedBooking && (
          <>
            <BookingDetailsModal
              isOpen={modals.details}
              onClose={() => closeModal('details')}
              booking={selectedBooking}
              onPayment={() => openModal('payment', selectedBooking)}
              onCheckIn={() => openModal('checkIn', selectedBooking)}
              onCheckOut={() => openModal('checkOut', selectedBooking)}
            />

            <PaymentModal
              isOpen={modals.payment}
              onClose={() => closeModal('payment')}
              booking={selectedBooking}
              onSubmit={(data) => handlePayment(selectedBooking.id, data)}
              loading={paymentLoading}
            />

            <CheckInModal
              isOpen={modals.checkIn}
              onClose={() => closeModal('checkIn')}
              booking={selectedBooking}
              onSubmit={(data) => handleCheckIn(selectedBooking.id, data)}
              loading={bookingsLoading}
            />

            <CheckOutModal
              isOpen={modals.checkOut}
              onClose={() => closeModal('checkOut')}
              booking={selectedBooking}
              onSubmit={(data) => handleCheckOut(selectedBooking.id, data)}
              loading={bookingsLoading}
            />
          </>
        )}

        <CreateBookingModal
          isOpen={modals.create}
          onClose={() => closeModal('create')}
          hostels={hostels}
          onSubmit={async (data) => {
            await fetchBookings({ page: currentPage, limit: pageSize, ...filters });
            closeModal('create');
          }}
        />
      </div>
    </div>
  );
};

export default BookingManagementPage;