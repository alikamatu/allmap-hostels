"use client";

import {
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Shield,
  Edit,
  Trash2,
  Send,
  Building2,
  BookOpen,
} from "lucide-react";
import { User, UserRole } from "@/types/user.types";
import { Modal } from "@/components/ui/modal";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";
import { UserAvatar, RoleBadge, StatusBadge } from "./user-badges";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onEdit: () => void;
  onVerify: () => void;
  onSendVerification: () => void;
  onRoleChange: (role: UserRole) => void;
  onDelete: () => void;
}

const ROLE_OPTIONS: SelectOption<UserRole>[] = [
  { value: "student", label: "Student" },
  { value: "hostel_admin", label: "Hostel Admin" },
  { value: "super_admin", label: "Super Admin" },
];

function formatDateTime(dateString?: string | null) {
  if (!dateString) return "Not available";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Not available";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailItem({
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

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onVerify,
  onSendVerification,
  onRoleChange,
  onDelete,
}: UserDetailsModalProps) {
  const hasEmergencyContact = Boolean(
    user.emergency_contact_name ||
    user.emergency_contact_phone ||
    user.emergency_contact_relationship ||
    user.emergency_contact_email,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      headerContent={
        <div className="flex items-center gap-3.5 min-w-0">
          <UserAvatar name={user.name} email={user.email} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {user.name || "Unnamed User"}
              </h2>
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} isVerified={user.is_verified} />
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100/80 transition-colors"
          >
            <Trash2 size={14} />
            <span>Delete User</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {!user.is_verified && (
              <>
                <button
                  type="button"
                  onClick={onSendVerification}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Send size={13} />
                  <span>Send Verification</span>
                </button>
                <button
                  type="button"
                  onClick={onVerify}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  <span>Verify Account</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#ff7a00] hover:bg-orange-600 transition-colors"
            >
              <Edit size={14} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Role Management & ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              User ID
            </div>
            <div className="text-xs font-mono text-gray-800 truncate mt-0.5">
              {user.id}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-medium text-gray-700">Role:</span>
            <CustomSelect<UserRole>
              size="sm"
              value={user.role}
              onChange={(val) => val && onRoleChange(val as UserRole)}
              options={ROLE_OPTIONS}
              menuAlign="right"
              className="w-40"
            />
          </div>
        </div>

        {/* Contact & Personal Information */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Personal & Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailItem label="Email Address" value={user.email} icon={Mail} />
            <DetailItem
              label="Phone Number"
              value={user.phone || "Not provided"}
              icon={Phone}
            />
            <DetailItem
              label="Gender"
              value={
                user.gender
                  ? user.gender
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Not specified"
              }
              icon={UserIcon}
            />
            <DetailItem
              label="School / Campus"
              value={
                user.school?.name ||
                (user.school_id
                  ? `School ID: ${user.school_id}`
                  : "Not assigned")
              }
              icon={GraduationCap}
            />
          </div>
        </section>

        {/* Activity Stats (when available) */}
        {user.stats && (
          <section>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Platform Activity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DetailItem
                label="Total Bookings"
                value={String(user.stats.totalBookings ?? 0)}
                icon={BookOpen}
              />
              <DetailItem
                label="Active Bookings"
                value={String(user.stats.activeBookings ?? 0)}
                icon={BookOpen}
              />
              <DetailItem
                label="Managed Hostels"
                value={String(user.stats.totalHostels ?? 0)}
                icon={Building2}
              />
            </div>
          </section>
        )}

        {/* Verification & Onboarding Compliance */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Verification & Onboarding
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium text-gray-500">
                  Email Verification
                </div>
                <div className="text-xs font-medium text-gray-900 mt-0.5">
                  {user.is_verified ? "Verified" : "Not verified"}
                </div>
                {user.verified_at && (
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {formatDateTime(user.verified_at)}
                  </div>
                )}
              </div>
              {user.is_verified ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={18} className="text-red-500 shrink-0" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium text-gray-500">
                  Onboarding Status
                </div>
                <div className="text-xs font-medium text-gray-900 mt-0.5">
                  {user.onboarding_completed ? "Completed" : "Incomplete"}
                </div>
              </div>
              {user.onboarding_completed ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={18} className="text-gray-400 shrink-0" />
              )}
            </div>

            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium text-gray-500">
                  Terms & Conditions
                </div>
                <div className="text-xs font-medium text-gray-900 mt-0.5">
                  {user.terms_accepted ? "Accepted" : "Not accepted"}
                </div>
              </div>
              <Shield
                size={18}
                className={
                  user.terms_accepted
                    ? "text-emerald-600 shrink-0"
                    : "text-gray-400 shrink-0"
                }
              />
            </div>

            <DetailItem
              label="Account Joined"
              value={formatDateTime(user.created_at)}
              icon={Calendar}
            />
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Emergency Contact
          </h3>
          {hasEmergencyContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailItem
                label="Contact Name"
                value={user.emergency_contact_name || "Not provided"}
              />
              <DetailItem
                label="Relationship"
                value={user.emergency_contact_relationship || "Not provided"}
              />
              <DetailItem
                label="Phone Number"
                value={user.emergency_contact_phone || "Not provided"}
              />
              <DetailItem
                label="Email Address"
                value={user.emergency_contact_email || "Not provided"}
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-50/70 border border-dashed border-gray-200 text-xs text-gray-500">
              No emergency contact information has been added by this user.
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
