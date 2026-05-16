"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Plus } from 'lucide-react';

import { Booking, BookingStatus, BookingType, PaymentStatus } from '@/types/booking';
import { Hostel } from '@/types/hostel';

import BookingFilters from '@/components/dashboard/components/bookings/BookingFilters';
import BookingsList from '@/components/dashboard/components/bookings/BookingsList';
import BookingDetailsModal from '@/components/dashboard/components/bookings/BookingDetailsModal';
import PaymentModal, { PaymentFormData } from '@/components/dashboard/components/bookings/PaymentModal';
import CheckInModal, { CheckInFormData } from '@/components/dashboard/components/bookings/CheckInModal';
import CheckOutModal, { CheckOutFormData } from '@/components/dashboard/components/bookings/CheckOutModal';
import BookingStatsCards from '@/components/dashboard/components/bookings/BookingStatsCards';
import BulkActionsBar from '@/components/dashboard/components/bookings/BulkActionsBar';
import CreateBookingModal from '@/components/dashboard/components/bookings/CreateBookingModal';

import { useBookings } from '@/hooks/useBookings';
import { usePayments } from '@/hooks/usePayments';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { exportToExcel } from '@/utils/export';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface FiltersState {
  search: string;
  status: BookingStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  bookingType: BookingType | 'all';
  hostelId: string;
  dateRange: { from: string; to: string };
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

const DEFAULT_FILTERS: FiltersState = {
  search: '',
  status: 'all',
  paymentStatus: 'all',
  bookingType: 'all',
  hostelId: '',
  dateRange: { from: '', to: '' },
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

const PAGE_SIZE = 20;

// Build URLSearchParams-compatible object from filters + pagination
function buildFetchParams(filters: FiltersState, page: number) {
  return {
    page,
    limit: PAGE_SIZE,
    ...filters,
    ...(filters.dateRange.from && { checkInFrom: filters.dateRange.from }),
    ...(filters.dateRange.to   && { checkInTo:   filters.dateRange.to }),
  };
}

const BookingManagementPage: React.FC = () => {
  const [filters, setFilters]               = useState<FiltersState>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput]       = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking]   = useState<Booking | null>(null);
  const [hostels, setHostels]               = useState<Hostel[]>([]);
  const [currentPage, setCurrentPage]       = useState(1);
  const [modals, setModals] = useState({
    details: false, payment: false, checkIn: false, checkOut: false, create: false,
  });

  // Debounce search — fire API only after 350 ms of inactivity
  const debouncedSearch = useDebounce(searchInput, 350);

  const {
    bookings, loading: bookingsLoading, pagination, stats,
    fetchBookings, confirmBooking, cancelBooking,
    checkInBooking, checkOutBooking, fetchStats,
  } = useBookings();

  const { recordPayment, loading: paymentLoading } = usePayments();

  // ── One-time mount: fetch hostels + initial stats in parallel ─────────────
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      try {
        const [hostelRes] = await Promise.all([
          fetch(`${API_BASE_URL}/hostels/fetch`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
        ]);

        if (hostelRes.ok) {
          const data: Hostel[] = await hostelRes.json();
          setHostels(data);
          if (data.length > 0) {
            const firstId = data[0].id;
            setFilters(prev => ({ ...prev, hostelId: firstId }));
            fetchStats(firstId);
          }
        }
      } catch {
        // silently ignore — the page still works without pre-loaded hostels
      }
    };

    init();
  }, [fetchStats]);

  // ── Sync debounced search into filters ────────────────────────────────────
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
    setCurrentPage(1);
  }, [debouncedSearch]);

  // ── Fetch bookings whenever filters / page changes ────────────────────────
  useEffect(() => {
    if (!filters.hostelId) return;
    fetchBookings(buildFetchParams(filters, currentPage));
  }, [filters, currentPage, fetchBookings]);

  // ── Refresh stats when hostel changes ─────────────────────────────────────
  useEffect(() => {
    if (filters.hostelId) fetchStats(filters.hostelId);
  }, [filters.hostelId, fetchStats]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchBookings(buildFetchParams(filters, currentPage)),
      filters.hostelId ? fetchStats(filters.hostelId) : Promise.resolve(),
    ]);
  }, [fetchBookings, fetchStats, filters, currentPage]);

  const handleFilterChange = useCallback((newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const openModal = useCallback((type: keyof typeof modals, booking?: Booking) => {
    if (booking) setSelectedBooking(booking);
    setModals(prev => ({ ...prev, [type]: true }));
  }, []);

  const closeModal = useCallback((type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }));
    if (type === 'details') setSelectedBooking(null);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handlePayment = async (bookingId: string, paymentData: PaymentFormData) => {
    const result = await recordPayment(bookingId, paymentData);
    if (result.booking) {
      setSelectedBooking(prev =>
        prev ? { ...prev, ...result.booking } : null,
      );
    }
    await refreshAll();
    closeModal('payment');
  };

  const handleCheckIn = async (bookingId: string, checkInData: CheckInFormData) => {
    const updated = await checkInBooking(bookingId, checkInData);
    setSelectedBooking(updated);
    await refreshAll();
    closeModal('checkIn');
  };

  const handleCheckOut = async (bookingId: string, checkOutData: CheckOutFormData) => {
    const updated = await checkOutBooking(bookingId, checkOutData);
    setSelectedBooking(updated);
    closeModal('checkOut');
    await refreshAll();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBookings.length === 0) return;
    if (action === 'confirm') {
      await Promise.all(selectedBookings.map(id => confirmBooking(id, { notes: 'Bulk confirm' })));
    } else if (action === 'cancel') {
      await Promise.all(selectedBookings.map(id =>
        cancelBooking(id, { reason: 'Bulk cancel', notes: 'Cancelled via bulk action' }),
      ));
    }
    setSelectedBookings([]);
    await refreshAll();
  };

  const handleExport = async () => {
    const result = await fetchBookings({ ...filters, page: 1, limit: 1000 });
    exportToExcel(result.bookings, 'bookings', [
      { key: 'id',              label: 'Booking ID' },
      { key: 'studentName',     label: 'Student Name' },
      { key: 'studentEmail',    label: 'Email' },
      { key: 'hostel.name',     label: 'Hostel' },
      { key: 'room.roomNumber', label: 'Room' },
      { key: 'status',          label: 'Status' },
      { key: 'paymentStatus',   label: 'Payment Status' },
      { key: 'totalAmount',     label: 'Total Amount' },
      { key: 'amountPaid',      label: 'Amount Paid' },
      { key: 'checkInDate',     label: 'Check-in Date' },
      { key: 'checkOutDate',    label: 'Check-out Date' },
      { key: 'createdAt',       label: 'Created At' },
    ]);
  };

  const activeBookings = bookings.filter(
    b => b.status !== BookingStatus.CHECKED_OUT && b.status !== BookingStatus.CANCELLED,
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Booking Management</h1>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Manage bookings, payments, and check-ins</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={!filters.hostelId}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => openModal('create')}
            disabled={!filters.hostelId}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-[#FF6A00] hover:bg-[#E55E00] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {filters.hostelId && (
        <BookingStatsCards stats={stats} loading={bookingsLoading && !bookings.length} />
      )}

      {/* Filters */}
      <BookingFilters
        filters={filters}
        hostels={hostels}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onFilterChange={handleFilterChange}
      />

      {/* Bulk actions */}
      {selectedBookings.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedBookings.length}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedBookings([])}
        />
      )}

      {/* Bookings list */}
      {!filters.hostelId ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-gray-700">Loading hostels…</p>
          <p className="text-xs text-gray-400 mt-1">Please wait a moment.</p>
        </div>
      ) : (
        <BookingsList
          bookings={activeBookings}
          loading={bookingsLoading}
          selectedBookings={selectedBookings}
          onBookingSelect={(id, sel) =>
            setSelectedBookings(prev => sel ? [...prev, id] : prev.filter(x => x !== id))
          }
          onSelectAll={sel => setSelectedBookings(sel ? bookings.map(b => b.id) : [])}
          onViewDetails={b => openModal('details', b)}
          onPayment={b => openModal('payment', b)}
          onCheckIn={b => openModal('checkIn', b)}
          onCheckOut={b => openModal('checkOut', b)}
          onConfirm={confirmBooking}
          onCancel={async (id, data) => {
            await cancelBooking(id, data);
            setSelectedBookings(prev => prev.filter(x => x !== id));
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
            onSubmit={data => handlePayment(selectedBooking.id, data)}
            loading={paymentLoading}
          />
          <CheckInModal
            isOpen={modals.checkIn}
            onClose={() => closeModal('checkIn')}
            booking={selectedBooking}
            onSubmit={data => handleCheckIn(selectedBooking.id, data)}
            loading={bookingsLoading}
          />
          <CheckOutModal
            isOpen={modals.checkOut}
            onClose={() => closeModal('checkOut')}
            booking={selectedBooking}
            onSubmit={data => handleCheckOut(selectedBooking.id, data)}
            loading={bookingsLoading}
          />
        </>
      )}

      <CreateBookingModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        hostels={hostels}
        onSubmit={async () => {
          await refreshAll();
          closeModal('create');
        }}
      />
    </div>
  );
};

export default BookingManagementPage;
