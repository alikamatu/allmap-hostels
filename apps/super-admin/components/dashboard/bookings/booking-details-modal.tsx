"use client";

import {
  User,
  Mail,
  Phone,
  Home,
  BedDouble,
  Calendar,
  CreditCard,
  MapPin,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  BookingRecord,
  BookingStatus,
  PaymentStatus,
} from "@/types/booking.types";
import { formatCurrency } from "@/lib/formatters";
import { Modal } from "@/components/ui/modal";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";
import { UserAvatar } from "@/components/dashboard/users/user-badges";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
  BookingTypeBadge,
} from "./booking-badges";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord | null;
  onStatusUpdate: (booking: BookingRecord, status: BookingStatus) => void;
  onPaymentStatusUpdate: (
    bookingId: string,
    paymentStatus: PaymentStatus,
  ) => void;
}

const BOOKING_STATUS_OPTIONS: SelectOption<BookingStatus>[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "checked_out", label: "Checked Out" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS: SelectOption<PaymentStatus>[] = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

function formatDate(dateValue?: Date | string | null, withTime = false) {
  if (!dateValue) return "Not available";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "Not available";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function DetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
}) {
  return (
    <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
        {Icon && <Icon size={12} className="text-gray-400 shrink-0" />}
        <span>{label}</span>
      </div>
      <div className="text-xs sm:text-[13px] font-medium text-gray-900 mt-1 break-words">
        {value}
      </div>
    </div>
  );
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onStatusUpdate,
  onPaymentStatusUpdate,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const studentName = booking.student?.name || booking.studentName || "Student";
  const studentEmail =
    booking.student?.email || booking.studentEmail || "Not provided";
  const studentPhone =
    booking.student?.phone || booking.studentPhone || "Not provided";
  const progress = Math.min(
    100,
    Math.max(0, Math.round(booking.paymentProgress || 0)),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      headerContent={
        <div className="flex items-center gap-3.5 min-w-0">
          <UserAvatar name={studentName} email={studentEmail} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {studentName}
              </h2>
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.paymentStatus} />
              <BookingTypeBadge type={booking.bookingType} />
            </div>
            <p className="text-xs text-gray-500 font-mono truncate mt-0.5">
              ID: {booking.id}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-[11px] text-gray-500">
            Booked on {formatDate(booking.createdAt, true)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Quick Status Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100">
          <CustomSelect<BookingStatus>
            label="Booking Status"
            size="sm"
            value={booking.status}
            onChange={(val) => {
              if (val && val !== booking.status) {
                onStatusUpdate(booking, val as BookingStatus);
              }
            }}
            options={BOOKING_STATUS_OPTIONS}
          />
          <CustomSelect<PaymentStatus>
            label="Payment Status"
            size="sm"
            value={booking.paymentStatus}
            onChange={(val) => {
              if (val && val !== booking.paymentStatus) {
                onPaymentStatusUpdate(booking.id, val as PaymentStatus);
              }
            }}
            options={PAYMENT_STATUS_OPTIONS}
          />
        </div>

        {/* Financial Summary & Payment Progress */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Financial Summary
          </h3>
          <div className="p-4 rounded-2xl border border-gray-200/80 bg-white space-y-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[11px] text-gray-500">Total Amount</div>
                <div className="text-sm sm:text-base font-bold text-gray-900 mt-0.5">
                  {formatCurrency(booking.totalAmount)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Amount Paid</div>
                <div className="text-sm sm:text-base font-bold text-emerald-600 mt-0.5">
                  {formatCurrency(booking.amountPaid)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Amount Due</div>
                <div
                  className={`text-sm sm:text-base font-bold mt-0.5 ${
                    booking.amountDue > 0 ? "text-amber-600" : "text-gray-900"
                  }`}
                >
                  {formatCurrency(booking.amountDue)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Booking Fee</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(booking.bookingFee)}
                  </span>
                  {booking.bookingFeePaid ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <XCircle size={14} className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                <span>Payment Progress</span>
                <span className="font-semibold text-gray-800">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#ff7a00] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {(booking.paymentReference ||
              booking.paymentDueDate ||
              booking.isOverdue) && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                {booking.paymentReference && (
                  <span>
                    Ref:{" "}
                    <span className="font-mono font-medium text-gray-900">
                      {booking.paymentReference}
                    </span>
                  </span>
                )}
                {booking.paymentDueDate && (
                  <span>
                    Due Date:{" "}
                    <span className="font-medium text-gray-900">
                      {formatDate(booking.paymentDueDate)}
                    </span>
                  </span>
                )}
                {booking.isOverdue && (
                  <span className="text-red-600 font-semibold">Overdue</span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Student Information */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Student Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailCard label="Full Name" value={studentName} icon={User} />
            <DetailCard
              label="Email Address"
              value={studentEmail}
              icon={Mail}
            />
            <DetailCard
              label="Phone Number"
              value={studentPhone}
              icon={Phone}
            />
            <DetailCard
              label="Gender"
              value={
                booking.student?.gender
                  ? booking.student.gender
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Not specified"
              }
              icon={User}
            />
          </div>
        </section>

        {/* Hostel & Room Information */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Hostel & Room Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailCard
              label="Hostel Name"
              value={booking.hostel?.name || "Not available"}
              icon={Home}
            />
            <DetailCard
              label="Hostel Address"
              value={booking.hostel?.address || "Not provided"}
              icon={MapPin}
            />
            <DetailCard
              label="Hostel Contact"
              value={`${booking.hostel?.phone || "—"} · ${booking.hostel?.email || "—"}`}
              icon={Phone}
            />
            <DetailCard
              label="Room & Type"
              value={`Room ${booking.room?.roomNumber || "—"}${
                booking.room?.floor ? ` (Floor ${booking.room.floor})` : ""
              }${booking.room?.roomType?.name ? ` · ${booking.room.roomType.name}` : ""}`}
              icon={BedDouble}
            />
            {booking.room && (
              <DetailCard
                label="Room Occupancy"
                value={`${booking.room.currentOccupancy} / ${booking.room.maxOccupancy} occupied`}
                icon={Users}
              />
            )}
          </div>
        </section>

        {/* Stay Timeline */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Stay & Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailCard
              label="Check-in Date"
              value={formatDate(booking.checkInDate)}
              icon={Calendar}
            />
            <DetailCard
              label="Check-out Date"
              value={formatDate(booking.checkOutDate)}
              icon={Calendar}
            />
            <DetailCard
              label="Duration"
              value={`${booking.duration} ${
                booking.bookingType === "semester"
                  ? "semester(s)"
                  : booking.bookingType === "monthly"
                    ? "month(s)"
                    : booking.bookingType === "weekly"
                      ? "week(s)"
                      : "day(s)"
              }`}
              icon={Clock}
            />
            {booking.confirmedAt && (
              <DetailCard
                label="Confirmed At"
                value={formatDate(booking.confirmedAt, true)}
                icon={CheckCircle2}
              />
            )}
            {booking.checkedInAt && (
              <DetailCard
                label="Checked In At"
                value={formatDate(booking.checkedInAt, true)}
                icon={Clock}
              />
            )}
            {booking.checkedOutAt && (
              <DetailCard
                label="Checked Out At"
                value={formatDate(booking.checkedOutAt, true)}
                icon={Clock}
              />
            )}
            {booking.cancelledAt && (
              <DetailCard
                label="Cancelled At"
                value={formatDate(booking.cancelledAt, true)}
                icon={XCircle}
              />
            )}
          </div>
          {booking.cancellationReason && (
            <div className="mt-3 p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
              <span className="font-semibold">Cancellation Reason:</span>{" "}
              {booking.cancellationReason}
            </div>
          )}
        </section>

        {/* Emergency Contacts */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Emergency Contacts
          </h3>
          {booking.emergencyContacts && booking.emergencyContacts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {booking.emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {contact.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                      {contact.relationship}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{contact.phone}</div>
                  {contact.email && (
                    <div className="text-[11px] text-gray-500">
                      {contact.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-50/70 border border-dashed border-gray-200 text-xs text-gray-500">
              No emergency contacts recorded for this booking.
            </div>
          )}
        </section>

        {/* Special Requests & Notes */}
        {(booking.specialRequests || booking.notes) && (
          <section>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Requests & Notes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {booking.specialRequests && (
                <DetailCard
                  label="Special Requests"
                  value={booking.specialRequests}
                  icon={FileText}
                />
              )}
              {booking.notes && (
                <DetailCard
                  label="Admin Notes"
                  value={booking.notes}
                  icon={CreditCard}
                />
              )}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
