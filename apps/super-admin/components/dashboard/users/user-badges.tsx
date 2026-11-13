"use client";

import {
  Shield,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { UserRole, UserStatus } from "@/types/user.types";

export function UserAvatar({
  name,
  email,
  size = "md",
}: {
  name?: string | null;
  email: string;
  size?: "sm" | "md" | "lg";
}) {
  const display = (name?.trim() || email || "?").trim();
  const initials = display
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const sizeClasses = {
    sm: "w-8 h-8 text-[11px] rounded-xl",
    md: "w-9 h-9 text-xs rounded-xl",
    lg: "w-12 h-12 text-base rounded-2xl",
  }[size];

  return (
    <div
      className={`${sizeClasses} bg-gradient-to-br from-orange-500 to-amber-500 text-white font-semibold flex items-center justify-center shrink-0 shadow-xs select-none`}
    >
      {initials || "U"}
    </div>
  );
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; classes: string; icon: typeof Shield }
> = {
  super_admin: {
    label: "Super Admin",
    classes: "bg-purple-50 text-purple-700 border-purple-200/80",
    icon: Shield,
  },
  hostel_admin: {
    label: "Hostel Admin",
    classes: "bg-blue-50 text-blue-700 border-blue-200/80",
    icon: Building2,
  },
  student: {
    label: "Student",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: UserCheck,
  },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role] ?? {
    label: role,
    classes: "bg-gray-100 text-gray-700 border-gray-200",
    icon: UserCheck,
  };
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

const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; classes: string; icon: typeof CheckCircle2 }
> = {
  verified: {
    label: "Verified",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: Clock,
  },
  unverified: {
    label: "Unverified",
    classes: "bg-red-50 text-red-700 border-red-200/80",
    icon: XCircle,
  },
};

export function StatusBadge({
  status,
  isVerified,
}: {
  status?: UserStatus;
  isVerified?: boolean;
}) {
  const resolvedStatus: UserStatus =
    status || (isVerified ? "verified" : "unverified");
  const cfg = STATUS_CONFIG[resolvedStatus] ?? STATUS_CONFIG.unverified;
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
