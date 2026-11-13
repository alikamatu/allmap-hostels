"use client";

import { useState, useEffect, useRef } from "react";
import {
  Eye,
  MoreVertical,
  CheckCircle2,
  LogIn,
  LogOut,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BedDouble,
} from "lucide-react";
import {
  BookingRecord,
  BookingStatus,
  BookingPagination,
} from "@/types/booking.types";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/dashboard/users/user-badges";
import { BookingStatusBadge, PaymentStatusBadge } from "./booking-badges";

interface BookingTableProps {
  bookings: BookingRecord[];
  loading: boolean;
  pagination?: BookingPagination;
  onPageChange?: (page: number) => void;
  onViewDetails: (booking: BookingRecord) => void;
  onStatusUpdate: (booking: BookingRecord, status: BookingStatus) => void;
  showPagination?: boolean;
}

function formatShortDate(dateValue?: Date | string | null) {
  if (!dateValue) return "—";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingTable({
  bookings,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
  onStatusUpdate,
  showPagination = true,
}: BookingTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  if (loading && bookings.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="divide-y divide-gray-100 md:hidden">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2 pt-0.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <BedDouble size={22} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">
          No bookings found
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          Try changing tabs, adjusting your search query, or clearing active
          filters.
        </p>
      </div>
    );
  }

  const startItem = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : 1;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : bookings.length;

  return (
    <div
      ref={containerRef}
      className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden"
    >
      {/* Mobile-first minimal card list */}
      <div className="divide-y divide-gray-100 md:hidden">
        {bookings.map((booking) => {
          const studentName =
            booking.student?.name || booking.studentName || "Student";
          const studentEmail =
            booking.student?.email || booking.studentEmail || "";
          const hostelName = booking.hostel?.name || "Hostel";
          const roomNumber = booking.room?.roomNumber || "—";

          return (
            <div
              key={booking.id}
              className="p-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onViewDetails(booking)}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left"
                >
                  <UserAvatar
                    name={studentName}
                    email={studentEmail}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {studentName}
                      </span>
                      <span className="text-xs font-semibold text-gray-900 shrink-0">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {hostelName} · Room {roomNumber}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <BookingStatusBadge status={booking.status} />
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onViewDetails(booking)}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
                >
                  <Eye size={13} />
                  <span>View</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop minimal table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200/80">
              <th className="pl-5 pr-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Hostel & Room
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="pl-4 pr-5 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const studentName =
                booking.student?.name || booking.studentName || "Student";
              const studentEmail =
                booking.student?.email || booking.studentEmail || "";
              const isMenuOpen = openMenuId === booking.id;

              return (
                <tr
                  key={booking.id}
                  className="group hover:bg-gray-50/70 transition-colors"
                >
                  <td className="pl-5 pr-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(booking)}
                      className="flex items-center gap-3 text-left min-w-0 group/student"
                    >
                      <UserAvatar
                        name={studentName}
                        email={studentEmail}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900 group-hover/student:text-[#ff7a00] transition-colors truncate">
                          {studentName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {studentEmail || "No email"}
                        </div>
                      </div>
                    </button>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-[13px] font-medium text-gray-900 truncate max-w-[200px]">
                      {booking.hostel?.name || "Hostel"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Room {booking.room?.roomNumber || "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-600">
                    {formatShortDate(booking.checkInDate)}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-[13px] font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    {booking.amountDue > 0 && (
                      <div className="text-[11px] text-amber-600">
                        Due {formatCurrency(booking.amountDue)}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <BookingStatusBadge status={booking.status} />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  </td>

                  <td className="pl-4 pr-5 py-3.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 relative">
                      <button
                        type="button"
                        onClick={() => onViewDetails(booking)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-100/80 hover:bg-orange-50 hover:text-[#ff7a00] transition-colors"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(isMenuOpen ? null : booking.id)
                        }
                        aria-label="More booking actions"
                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-gray-200/90 bg-white shadow-lg py-1.5 z-30 text-left">
                          {booking.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onStatusUpdate(booking, "confirmed");
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50/70 transition-colors"
                            >
                              <CheckCircle2 size={14} />
                              <span>Confirm Booking</span>
                            </button>
                          )}
                          {(booking.status === "confirmed" ||
                            booking.canCheckIn) &&
                            booking.status !== "checked_in" &&
                            booking.status !== "checked_out" &&
                            booking.status !== "cancelled" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onStatusUpdate(booking, "checked_in");
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-blue-700 hover:bg-blue-50/70 transition-colors"
                              >
                                <LogIn size={14} />
                                <span>Check In</span>
                              </button>
                            )}
                          {booking.status === "checked_in" && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onStatusUpdate(booking, "checked_out");
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-purple-700 hover:bg-purple-50/70 transition-colors"
                            >
                              <LogOut size={14} />
                              <span>Check Out</span>
                            </button>
                          )}
                          {booking.status !== "cancelled" &&
                            booking.status !== "checked_out" && (
                              <>
                                <div className="my-1 border-t border-gray-100" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onStatusUpdate(booking, "cancelled");
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50/80 transition-colors"
                                >
                                  <XCircle size={14} />
                                  <span>Cancel Booking</span>
                                </button>
                              </>
                            )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination &&
        pagination &&
        pagination.totalPages > 1 &&
        onPageChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">{startItem}</span>–
              <span className="font-semibold text-gray-800">{endItem}</span> of{" "}
              <span className="font-semibold text-gray-800">
                {pagination.total}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="px-3 py-1.5 text-xs font-medium text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
