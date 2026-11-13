"use client";

import { useState, useEffect, useRef } from "react";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
} from "lucide-react";
import { User, UserPagination } from "@/types/user.types";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar, RoleBadge, StatusBadge } from "./user-badges";

interface UserTableProps {
  users: User[];
  loading: boolean;
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (user: User) => void;
  onEditUser: (user: User) => void;
  onVerifyUser: (userId: string) => void;
  onDeleteUser: (user: User) => void;
  onSendVerification: (userId: string) => void;
  pagination: UserPagination;
  onPageChange: (page: number) => void;
}

function formatShortDate(dateString?: string | null) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserTable({
  users,
  loading,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onViewDetails,
  onEditUser,
  onVerifyUser,
  onDeleteUser,
  onSendVerification,
  pagination,
  onPageChange,
}: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const allSelected =
    users.length > 0 && users.every((u) => selectedUsers.includes(u.id));

  if (loading && users.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Mobile skeleton */}
        <div className="divide-y divide-gray-100 md:hidden">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
                <div className="flex gap-2 pt-0.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <UsersIcon size={22} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">No users found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          Try adjusting your search query or clearing active filters to see more
          users.
        </p>
      </div>
    );
  }

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div
      ref={menuContainerRef}
      className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden"
    >
      {/* Mobile-first minimal card list */}
      <div className="divide-y divide-gray-100 md:hidden">
        {users.map((user) => {
          const isSelected = selectedUsers.includes(user.id);
          return (
            <div
              key={user.id}
              className={`p-4 transition-colors ${
                isSelected ? "bg-orange-50/40" : "hover:bg-gray-50/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectUser(user.id)}
                  aria-label={`Select ${user.name || user.email}`}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#ff7a00] focus:ring-[#ff7a00]"
                />
                <button
                  type="button"
                  onClick={() => onViewDetails(user)}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left"
                >
                  <UserAvatar name={user.name} email={user.email} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user.name || "Unnamed User"}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {user.email}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <RoleBadge role={user.role} />
                      <StatusBadge
                        status={user.status}
                        isVerified={user.is_verified}
                      />
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onViewDetails(user)}
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
              <th className="w-11 pl-5 pr-2 py-3.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  aria-label="Select all users"
                  className="h-4 w-4 rounded border-gray-300 text-[#ff7a00] focus:ring-[#ff7a00]"
                />
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="pl-4 pr-5 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isSelected = selectedUsers.includes(user.id);
              const isMenuOpen = openMenuId === user.id;

              return (
                <tr
                  key={user.id}
                  className={`group transition-colors ${
                    isSelected ? "bg-orange-50/40" : "hover:bg-gray-50/70"
                  }`}
                >
                  <td className="pl-5 pr-2 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectUser(user.id)}
                      aria-label={`Select ${user.name || user.email}`}
                      className="h-4 w-4 rounded border-gray-300 text-[#ff7a00] focus:ring-[#ff7a00]"
                    />
                  </td>

                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(user)}
                      className="flex items-center gap-3 text-left min-w-0 group/user"
                    >
                      <UserAvatar
                        name={user.name}
                        email={user.email}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900 group-hover/user:text-[#ff7a00] transition-colors truncate">
                          {user.name || "Unnamed User"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge
                      status={user.status}
                      isVerified={user.is_verified}
                    />
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500">
                    {formatShortDate(user.created_at)}
                  </td>

                  <td className="pl-4 pr-5 py-3.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 relative">
                      <button
                        type="button"
                        onClick={() => onViewDetails(user)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-100/80 hover:bg-orange-50 hover:text-[#ff7a00] transition-colors"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(isMenuOpen ? null : user.id)
                        }
                        aria-label="More actions"
                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-gray-200/90 bg-white shadow-lg py-1.5 z-30 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onEditUser(user);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit size={14} className="text-gray-400" />
                            <span>Edit User</span>
                          </button>

                          {!user.is_verified && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onVerifyUser(user.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50/70 transition-colors"
                              >
                                <CheckCircle2 size={14} />
                                <span>Verify User</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onSendVerification(user.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Mail size={14} className="text-gray-400" />
                                <span>Send Verification</span>
                              </button>
                            </>
                          )}

                          <div className="my-1 border-t border-gray-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onDeleteUser(user);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50/80 transition-colors"
                          >
                            <Trash2 size={14} />
                            <span>Delete User</span>
                          </button>
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
      {pagination.totalPages > 1 && (
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
