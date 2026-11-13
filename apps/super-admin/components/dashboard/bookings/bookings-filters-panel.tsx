"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import {
  BookingFilters,
  BookingStatus,
  PaymentStatus,
  BookingType,
} from "@/types/booking.types";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";

interface BookingsFiltersPanelProps {
  filters: BookingFilters;
  onFilterChange: (filters: Partial<BookingFilters>) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: SelectOption<"" | BookingStatus>[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS: SelectOption<"" | PaymentStatus>[] = [
  { value: "", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

const BOOKING_TYPE_OPTIONS: SelectOption<"" | BookingType>[] = [
  { value: "", label: "All Types" },
  { value: "semester", label: "Semester" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

export default function BookingsFiltersPanel({
  filters,
  onFilterChange,
  onClose,
}: BookingsFiltersPanelProps) {
  const [localFilters, setLocalFilters] =
    useState<Partial<BookingFilters>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Partial<BookingFilters> = {
      status: undefined,
      paymentStatus: undefined,
      bookingType: undefined,
      checkInFrom: undefined,
      checkInTo: undefined,
      overdueOnly: undefined,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  const selectedStatus = Array.isArray(localFilters.status)
    ? localFilters.status[0] || ""
    : localFilters.status || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="mt-4 pt-4 border-t border-gray-100"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <CustomSelect<"" | BookingStatus>
          label="Booking Status"
          value={selectedStatus}
          onChange={(val) =>
            setLocalFilters((prev) => ({
              ...prev,
              status: val ? (val as BookingStatus) : undefined,
            }))
          }
          options={STATUS_OPTIONS}
        />

        <CustomSelect<"" | PaymentStatus>
          label="Payment Status"
          value={localFilters.paymentStatus || ""}
          onChange={(val) =>
            setLocalFilters((prev) => ({
              ...prev,
              paymentStatus: val ? (val as PaymentStatus) : undefined,
            }))
          }
          options={PAYMENT_STATUS_OPTIONS}
        />

        <CustomSelect<"" | BookingType>
          label="Booking Type"
          value={localFilters.bookingType || ""}
          onChange={(val) =>
            setLocalFilters((prev) => ({
              ...prev,
              bookingType: val ? (val as BookingType) : undefined,
            }))
          }
          options={BOOKING_TYPE_OPTIONS}
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Check-in From
          </label>
          <input
            type="date"
            value={localFilters.checkInFrom || ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                checkInFrom: e.target.value || undefined,
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] min-h-[40px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Check-in To
          </label>
          <input
            type="date"
            value={localFilters.checkInTo || ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                checkInTo: e.target.value || undefined,
              }))
            }
            className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] min-h-[40px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-gray-100">
        <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(localFilters.overdueOnly)}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                overdueOnly: e.target.checked ? true : undefined,
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-[#ff7a00] focus:ring-[#ff7a00]"
          />
          <span>Show overdue payments only</span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-medium bg-[#ff7a00] text-white hover:bg-orange-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
}
