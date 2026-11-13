"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Filter,
  Calendar,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Home,
  X,
} from "lucide-react";
import TopBar from "@/components/dashboard/top-bar";
import { useBookings } from "@/hooks/useBookings";
import {
  BookingFilters,
  BookingRecord,
  BookingStatus,
  PaymentStatus,
} from "@/types/booking.types";
import BookingStats from "@/components/dashboard/bookings/booking-stats";
import BookingTable from "@/components/dashboard/bookings/booking-table";
import BookingsFiltersPanel from "@/components/dashboard/bookings/bookings-filters-panel";
import BookingDetailsModal from "@/components/dashboard/bookings/booking-details-modal";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";
import { ConfirmDialog } from "@/components/ui/modal";

type BookingTab = "all" | "checkins" | "checkouts" | "overdue";
type SortOptionValue = "newest" | "oldest" | "amount_desc" | "checkin_asc";

const SORT_OPTIONS: SelectOption<SortOptionValue>[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_desc", label: "Highest Amount" },
  { value: "checkin_asc", label: "Soonest Check-in" },
];

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingTab>("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<BookingRecord | null>(
    null,
  );
  const [cancelLoading, setCancelLoading] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        const trimmed = searchQuery.trim() || undefined;
        if (prev.search === trimmed) return prev;
        return { ...prev, search: trimmed, page: 1 };
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-dismiss transient feedback notices
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const {
    bookings,
    pagination,
    loading,
    isRefreshing,
    error,
    stats,
    upcomingCheckIns,
    upcomingCheckOuts,
    overdueBookings,
    refetch,
    updateStatus,
    updatePaymentStatus,
    exportBookings,
  } = useBookings(filters);

  const displayedBookings = useMemo(() => {
    switch (activeTab) {
      case "checkins":
        return upcomingCheckIns;
      case "checkouts":
        return upcomingCheckOuts;
      case "overdue":
        return overdueBookings;
      default:
        return bookings;
    }
  }, [
    activeTab,
    bookings,
    upcomingCheckIns,
    upcomingCheckOuts,
    overdueBookings,
  ]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return (
      bookings.find((b) => b.id === selectedBookingId) ||
      upcomingCheckIns.find((b) => b.id === selectedBookingId) ||
      upcomingCheckOuts.find((b) => b.id === selectedBookingId) ||
      overdueBookings.find((b) => b.id === selectedBookingId) ||
      null
    );
  }, [
    selectedBookingId,
    bookings,
    upcomingCheckIns,
    upcomingCheckOuts,
    overdueBookings,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.paymentStatus) count++;
    if (filters.bookingType) count++;
    if (filters.checkInFrom) count++;
    if (filters.checkInTo) count++;
    if (filters.overdueOnly) count++;
    return count;
  }, [filters]);

  const currentSortValue: SortOptionValue = useMemo(() => {
    if (filters.sortBy === "totalAmount" && filters.sortOrder === "DESC") {
      return "amount_desc";
    }
    if (filters.sortBy === "checkInDate" && filters.sortOrder === "ASC") {
      return "checkin_asc";
    }
    if (filters.sortBy === "createdAt" && filters.sortOrder === "ASC") {
      return "oldest";
    }
    return "newest";
  }, [filters.sortBy, filters.sortOrder]);

  const handleSortChange = (val: SortOptionValue | "") => {
    const next = val || "newest";
    setFilters((prev) => {
      switch (next) {
        case "oldest":
          return { ...prev, sortBy: "createdAt", sortOrder: "ASC", page: 1 };
        case "amount_desc":
          return { ...prev, sortBy: "totalAmount", sortOrder: "DESC", page: 1 };
        case "checkin_asc":
          return { ...prev, sortBy: "checkInDate", sortOrder: "ASC", page: 1 };
        default:
          return { ...prev, sortBy: "createdAt", sortOrder: "DESC", page: 1 };
      }
    });
  };

  const handleFilterChange = (newFilters: Partial<BookingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    setActiveTab("all");
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleStatusUpdate = async (
    booking: BookingRecord,
    nextStatus: BookingStatus,
  ) => {
    if (nextStatus === "cancelled") {
      setPendingCancel(booking);
      return;
    }
    const updated = await updateStatus(booking.id, nextStatus);
    if (updated) {
      setNotice({
        type: "success",
        text: `Booking status updated to ${nextStatus.replace("_", " ")}.`,
      });
    }
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;
    setCancelLoading(true);
    try {
      const updated = await updateStatus(pendingCancel.id, "cancelled");
      if (updated) {
        setNotice({ type: "success", text: "Booking cancelled." });
      }
    } finally {
      setCancelLoading(false);
      setPendingCancel(null);
    }
  };

  const handlePaymentStatusUpdate = async (
    bookingId: string,
    paymentStatus: PaymentStatus,
  ) => {
    const updated = await updatePaymentStatus(bookingId, paymentStatus);
    if (updated) {
      setNotice({
        type: "success",
        text: `Payment status updated to ${paymentStatus}.`,
      });
    }
  };

  const handleExport = async () => {
    const csv = await exportBookings(filters);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setNotice({ type: "success", text: "Bookings exported to CSV." });
  };

  const tabs: {
    id: BookingTab;
    label: string;
    icon: typeof Home;
    count?: number;
    badgeClasses?: string;
  }[] = [
    { id: "all", label: "All Bookings", icon: Home, count: pagination.total },
    {
      id: "checkins",
      label: "Check-ins (7d)",
      icon: Calendar,
      count: upcomingCheckIns.length,
      badgeClasses: "bg-blue-50 text-blue-700",
    },
    {
      id: "checkouts",
      label: "Check-outs (7d)",
      icon: CalendarDays,
      count: upcomingCheckOuts.length,
      badgeClasses: "bg-purple-50 text-purple-700",
    },
    {
      id: "overdue",
      label: "Overdue",
      icon: AlertCircle,
      count: overdueBookings.length,
      badgeClasses: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900">
      <TopBar
        title="Bookings Management"
        subtitle="Monitor reservations, check-ins, and payment statuses"
        onRefresh={refetch}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Reservations & Stays
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Tap any booking to inspect full stay timeline, payment breakdown,
              and emergency contacts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff7a00] text-white text-xs font-semibold hover:bg-orange-600 transition-colors shadow-2xs shrink-0"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* KPI Stats */}
        <BookingStats stats={stats} loading={loading} />

        {/* Transient Notice / Error Banner */}
        {(error || notice) && (
          <div
            className={`mb-4 px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium ${
              error || notice?.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {error || notice?.type === "error" ? (
                <AlertCircle size={15} className="shrink-0" />
              ) : (
                <CheckCircle2 size={15} className="shrink-0" />
              )}
              <span className="truncate">{error || notice?.text}</span>
            </div>
            {notice && (
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="p-1 rounded-lg hover:bg-black/5 shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Segmented Tabs + Search + Filter Bar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 mb-4 shadow-2xs space-y-3.5">
          {/* Mobile-scrollable segmented tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? "bg-orange-50 text-[#ff7a00] border border-orange-200/80"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isActive
                          ? "bg-[#ff7a00] text-white"
                          : tab.badgeClasses || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search, Filters & Sort */}
          {activeTab === "all" && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 pt-1 border-t border-gray-100">
              <div className="relative flex-1 pt-2 md:pt-0">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-1 md:mt-0 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by student, hostel, room, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 md:mt-0 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                    showFilters || activeFilterCount > 0
                      ? "border-[#ff7a00] bg-orange-50/70 text-[#ff7a00]"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={14} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff7a00] text-white text-[10px] font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <CustomSelect<SortOptionValue>
                  value={currentSortValue}
                  onChange={handleSortChange}
                  options={SORT_OPTIONS}
                  menuAlign="right"
                  className="w-40 sm:w-44"
                />
              </div>
            </div>
          )}

          {showFilters && activeTab === "all" && (
            <BookingsFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Minimal List / Table */}
        <BookingTable
          bookings={displayedBookings}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          showPagination={activeTab === "all"}
          onViewDetails={(booking) => {
            setSelectedBookingId(booking.id);
            setShowDetailsModal(true);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      </main>

      {/* Full Details Modal */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
        onStatusUpdate={handleStatusUpdate}
        onPaymentStatusUpdate={handlePaymentStatusUpdate}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={pendingCancel !== null}
        onClose={() => !cancelLoading && setPendingCancel(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
        variant="danger"
        title="Cancel Booking"
        description={
          pendingCancel
            ? `Are you sure you want to cancel the booking for ${
                pendingCancel.student?.name ||
                pendingCancel.studentName ||
                "this student"
              } at ${pendingCancel.hostel?.name || "this hostel"}?`
            : ""
        }
        confirmLabel="Cancel Booking"
      />
    </div>
  );
}
