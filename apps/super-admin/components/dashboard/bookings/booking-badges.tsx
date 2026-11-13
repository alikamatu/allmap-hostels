"use client";

import {
  CheckCircle2,
  Clock,
  XCircle,
  LogIn,
  LogOut,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import {
  BookingStatus,
  PaymentStatus,
  BookingType,
} from "@/types/booking.types";

const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; classes: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: CheckCircle2,
  },
  checked_in: {
    label: "Checked In",
    classes: "bg-blue-50 text-blue-700 border-blue-200/80",
    icon: LogIn,
  },
  checked_out: {
    label: "Checked Out",
    classes: "bg-purple-50 text-purple-700 border-purple-200/80",
    icon: LogOut,
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-700 border-red-200/80",
    icon: XCircle,
  },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = BOOKING_STATUS_CONFIG[status] ?? BOOKING_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cfg.classes}`}
    >
      <Icon size={11} className="shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
}

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; classes: string; icon: typeof CreditCard }
> = {
  paid: {
    label: "Paid",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: CheckCircle2,
  },
  partial: {
    label: "Partial",
    classes: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: CreditCard,
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-50 text-red-700 border-red-200/80",
    icon: AlertTriangle,
  },
  pending: {
    label: "Pending",
    classes: "bg-gray-100 text-gray-700 border-gray-200/80",
    icon: Clock,
  },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cfg.classes}`}
    >
      <Icon size={11} className="shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
}

export function BookingTypeBadge({ type }: { type: BookingType }) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-[#ff7a00] border border-orange-200/70">
      {label}
    </span>
  );
}
