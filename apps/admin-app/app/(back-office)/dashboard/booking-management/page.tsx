"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, Plus, MapPin
} from 'lucide-react';
import { motion } from "framer-motion"

// Types
import { Booking, BookingStatus, PaymentStatus, BookingType } from '@/types/booking';
import { Hostel } from '@/types/hostel';

// Components
import BookingFilters from '@/components/dashboard/components/bookings/BookingFilters';
import BookingsList from '@/components/dashboard/components/bookings/BookingsList';
import BookingDetailsModal from '@/components/dashboard/components/bookings/BookingDetailsModal';
import PaymentModal, { PaymentFormData } from '@/components/dashboard/components/bookings/PaymentModal';
import CheckInModal, { CheckInFormData } from '@/components/dashboard/components/bookings/CheckInModal';
import CheckOutModal, { CheckOutFormData } from '@/components/dashboard/components/bookings/CheckOutModal';
import BookingStatsCards from '@/components/dashboard/components/bookings/BookingStatsCards';
import BulkActionsBar from '@/components/dashboard/components/bookings/BulkActionsBar';
import CreateBookingModal from '@/components/dashboard/components/bookings/CreateBookingModal';

// Hooks
import { useBookings } from '@/hooks/useBookings';
import { usePayments } from '@/hooks/usePayments';

// Utils
import { exportToExcel } from '@/utils/export';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface BookingFiltersState {
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
  const [filters, setFilters] = useState<BookingFiltersState>({
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
  const [hasAutoSelectedHostel, setHasAutoSelectedHostel] = useState(false);

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
    fetchStats
  } = useBookings();

  const {
    recordPayment,
    loading: paymentLoading
  } = usePayments();

  // Function to filter out checked-out and cancelled bookings
  const filterActiveBookings = useCallback((bookings: Booking[]) => {
    return bookings.filter(booking => 
      booking.status !== BookingStatus.CHECKED_OUT && 
      booking.status !== BookingStatus.CANCELLED
    );
  }, []);

  // Fetch hostels on mount and auto-select first hostel
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
          
          // Auto-select the first hostel if none is selected and we haven't auto-selected before
          if (data.length > 0 && !filters.hostelId && !hasAutoSelectedHostel) {
            console.log('🏢 Auto-selecting first hostel:', data[0].name);
            setFilters(prev => ({ ...prev, hostelId: data[0].id }));
            setHasAutoSelectedHostel(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hostels:', error);
      }
    };
    
    fetchHostels();
  }, [filters.hostelId, hasAutoSelectedHostel]);

  // Fetch stats when hostel ID changes
  useEffect(() => {
    const loadStats = async () => {
      try {
        if (!filters.hostelId) {
          console.log('⚠️ No hostel selected, skipping stats load');
          return;
        }

        console.log('📊 Fetching stats for hostel:', filters.hostelId);
        const statsData = await fetchStats(filters.hostelId);
        console.log('✅ Stats loaded:', statsData);
      } catch (error) {
        console.error('❌ Failed to fetch stats:', error);
      }
    };

    loadStats();
  }, [filters.hostelId, fetchStats]);

  // Fetch bookings when filters change
  useEffect(() => {
    if (!filters.hostelId) {
      return;
    }

    const filterParams = {
      page: currentPage,
      limit: pageSize,
      ...filters,
      ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
      ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
    };
    
    fetchBookings(filterParams);
  }, [filters, currentPage, pageSize, fetchBookings]);

  const handleFilterChange = useCallback((newFilters: Partial<BookingFiltersState>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // If hostel filter changed, we'll let the useEffect handle stats fetching
      if (newFilters.hostelId && newFilters.hostelId !== prev.hostelId) {
        console.log('🏢 Hostel changed to:', newFilters.hostelId);
      }
      
      return updated;
    });
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

  const handlePayment = async (bookingId: string, paymentData: PaymentFormData) => {
    try {
      const result = await recordPayment(bookingId, paymentData);
      
      if (result.booking) {
        setSelectedBooking(prev => prev ? {
          ...prev,
          amountPaid: result.booking.amountPaid,
          amountDue: result.booking.amountDue,
          paymentStatus: result.booking.paymentStatus
        } : null);
      }
      
      const filterParams = {
        page: currentPage,
        limit: pageSize,
        ...filters,
        ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
        ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
      };
      
      await fetchBookings(filterParams);
      closeModal('payment');
      
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  const handleCheckIn = async (bookingId: string, checkInData: CheckInFormData) => {
    try {
      const updatedBooking = await checkInBooking(bookingId, checkInData);
      setSelectedBooking(updatedBooking);
      
      const filterParams = {
        page: currentPage,
        limit: pageSize,
        ...filters,
        ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
        ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
      };
      await fetchBookings(filterParams);
      
      closeModal('checkIn');
    } catch (error) {
      console.error('Check-in failed:', error);
      throw error;
    }
  };

  const handleCheckOut = async (bookingId: string, checkOutData: CheckOutFormData) => {
    try {
      const updatedBooking = await checkOutBooking(bookingId, checkOutData);
      setSelectedBooking(updatedBooking);
      
      const filterParams = {
        page: currentPage,
        limit: pageSize,
        ...filters,
        ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
        ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
      };
      await fetchBookings(filterParams);
      
      // Refresh stats after checkout
      if (filters.hostelId) {
        console.log('📊 Refreshing stats after check-out');
        await fetchStats(filters.hostelId);
      }
      
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
          setSelectedBookings(prev => prev.filter(id => !selectedBookings.includes(id)));
          break;
      }
      
      setSelectedBookings([]);
      
      const filterParams = {
        page: currentPage,
        limit: pageSize,
        ...filters,
        ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
        ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
      };
      await fetchBookings(filterParams);
      
      // Refresh stats after bulk action
      if (filters.hostelId) {
        console.log('📊 Refreshing stats after bulk action');
        await fetchStats(filters.hostelId);
      }
      
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

  // Get filtered bookings
  const activeBookings = filterActiveBookings(bookings);

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-7xl mx-auto space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Booking Management</h1>
            <p className="text-xs text-gray-600">Manage bookings, payments, and check-ins</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!filters.hostelId}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
            
            <button
              onClick={() => openModal('create')}
              disabled={!filters.hostelId}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
              New Booking
            </button>
          </div>
        </div>

        {/* Stats Cards - Only show when hostel is selected */}
        {filters.hostelId && (
          <BookingStatsCards stats={stats} loading={bookingsLoading} />
        )}

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

        {/* Show message when no hostel is selected */}
        {!filters.hostelId ? (
          <div className="bg-white border border-gray-200 p-6 text-center">
            <div className="h-10 w-10 bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Loading Hostels...</h3>
            <p className="text-xs text-gray-500">Please wait while we load available hostels.</p>
          </div>
        ) : (
          /* Bookings List */
          <BookingsList
            bookings={activeBookings}
            loading={bookingsLoading}
            selectedBookings={selectedBookings}
            onBookingSelect={handleBookingSelect}
            onSelectAll={handleSelectAll}
            onViewDetails={(booking) => openModal('details', booking)}
            onPayment={(booking) => openModal('payment', booking)}
            onCheckIn={(booking) => openModal('checkIn', booking)}
            onCheckOut={(booking) => openModal('checkOut', booking)}
            onConfirm={confirmBooking}
            onCancel={async (bookingId: string, data: { reason: string; notes?: string }) => {
              await cancelBooking(bookingId, data);
              setSelectedBookings(prev => prev.filter(id => id !== bookingId));
            }}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

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
              onSubmit={(paymentData) => handlePayment(selectedBooking.id, paymentData)}
              loading={paymentLoading}
            />

            <CheckInModal
              isOpen={modals.checkIn}
              onClose={() => closeModal('checkIn')}
              booking={selectedBooking}
              onSubmit={(checkInData) => handleCheckIn(selectedBooking.id, checkInData)}
              loading={bookingsLoading}
            />

            <CheckOutModal
              isOpen={modals.checkOut}
              onClose={() => closeModal('checkOut')}
              booking={selectedBooking}
              onSubmit={(checkOutData) => handleCheckOut(selectedBooking.id, checkOutData)}
              loading={bookingsLoading}
            />
          </>
        )}

        <CreateBookingModal
          isOpen={modals.create}
          onClose={() => closeModal('create')}
          hostels={hostels}
          onSubmit={async () => {
            const filterParams = {
              page: currentPage,
              limit: pageSize,
              ...filters,
              ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
              ...(filters.dateRange.to && { checkInTo: filters.dateRange.to })
            };
            await fetchBookings(filterParams);
            
            // Refresh stats after booking creation
            if (filters.hostelId) {
              console.log('📊 Refreshing stats after new booking');
              await fetchStats(filters.hostelId);
            }
            
            closeModal('create');
          }}
        />
      </motion.div>
    </div>
  );
};

export default BookingManagementPage;