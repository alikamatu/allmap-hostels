"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  UserPlus,
  Download,
  Filter,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import TopBar from "@/components/dashboard/top-bar";
import { useUsers } from "@/hooks/useUsers";
import {
  User,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  UserRole,
} from "@/types/user.types";
import UserTable from "@/components/dashboard/users/user-table";
import UserStats from "@/components/dashboard/users/user-stats";
import CreateUserModal from "@/components/dashboard/users/create-user-modal";
import EditUserModal from "@/components/dashboard/users/edit-user-modal";
import UserDetailsModal from "@/components/dashboard/users/user-details-modal";
import UserFiltersPanel from "@/components/dashboard/users/user-filters-panel";
import BulkActions from "@/components/dashboard/users/bulk-actions";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";
import { ConfirmDialog } from "@/components/ui/modal";

type SortOptionValue = "newest" | "oldest" | "name_asc" | "email_asc";

const SORT_OPTIONS: SelectOption<SortOptionValue>[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "email_asc", label: "Email (A–Z)" },
];

type PendingConfirm =
  | { type: "delete_single"; user: User }
  | { type: "bulk_delete"; count: number }
  | { type: "bulk_verify"; count: number }
  | null;

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
    sortBy: "created_at",
    sortOrder: "DESC",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Debounce search query (300ms) for fast typing without request spam
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
    users,
    stats,
    pagination,
    loading,
    isRefreshing,
    error,
    refetch,
    createUser,
    updateUser,
    verifyUser,
    updateUserRole,
    deleteUser,
    sendVerificationEmail,
    bulkVerifyUsers,
    bulkDeleteUsers,
    exportUsers,
  } = useUsers(filters);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.role) count++;
    if (filters.status) count++;
    if (filters.is_verified !== undefined) count++;
    if (filters.school_id) count++;
    return count;
  }, [filters]);

  const currentSortValue: SortOptionValue = useMemo(() => {
    if (filters.sortBy === "name" && filters.sortOrder === "ASC")
      return "name_asc";
    if (filters.sortBy === "email" && filters.sortOrder === "ASC")
      return "email_asc";
    if (filters.sortBy === "created_at" && filters.sortOrder === "ASC")
      return "oldest";
    return "newest";
  }, [filters.sortBy, filters.sortOrder]);

  const handleSortChange = (val: SortOptionValue | "") => {
    const next = val || "newest";
    setFilters((prev) => {
      switch (next) {
        case "oldest":
          return { ...prev, sortBy: "created_at", sortOrder: "ASC", page: 1 };
        case "name_asc":
          return { ...prev, sortBy: "name", sortOrder: "ASC", page: 1 };
        case "email_asc":
          return { ...prev, sortBy: "email", sortOrder: "ASC", page: 1 };
        default:
          return { ...prev, sortBy: "created_at", sortOrder: "DESC", page: 1 };
      }
    });
  };

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (users.length > 0 && users.every((u) => selectedUsers.includes(u.id))) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleCreateUser = async (data: CreateUserData) => {
    const created = await createUser(data);
    if (created) {
      setNotice({
        type: "success",
        text: `Created account for ${created.email}.`,
      });
    }
  };

  const handleUpdateUser = async (data: UpdateUserData) => {
    if (!selectedUser) return;
    const updated = await updateUser(selectedUser.id, data);
    if (updated) {
      setNotice({ type: "success", text: "User profile updated." });
    }
  };

  const handleVerifyUser = async (userId: string) => {
    const updated = await verifyUser(userId);
    if (updated) {
      setNotice({ type: "success", text: "User account verified." });
    }
  };

  const handleSendVerification = async (userId: string) => {
    const sent = await sendVerificationEmail(userId);
    if (sent) {
      setNotice({ type: "success", text: "Verification email sent." });
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const updated = await updateUserRole(userId, role);
    if (updated) {
      setNotice({
        type: "success",
        text: `Role updated to ${role.replace("_", " ")}.`,
      });
    }
  };

  const handleExport = async () => {
    const csv = await exportUsers(filters);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setNotice({ type: "success", text: "Users exported to CSV." });
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirm) return;
    setConfirmLoading(true);
    try {
      if (pendingConfirm.type === "delete_single") {
        const ok = await deleteUser(pendingConfirm.user.id);
        if (ok) {
          setSelectedUsers((prev) =>
            prev.filter((id) => id !== pendingConfirm.user.id),
          );
          if (selectedUserId === pendingConfirm.user.id) {
            setShowDetailsModal(false);
            setSelectedUserId(null);
          }
          setNotice({ type: "success", text: "User deleted." });
        }
      } else if (pendingConfirm.type === "bulk_delete") {
        const res = await bulkDeleteUsers(selectedUsers);
        setSelectedUsers([]);
        setNotice({
          type: "success",
          text: `Deleted ${res.deleted} user${res.deleted === 1 ? "" : "s"}.`,
        });
      } else if (pendingConfirm.type === "bulk_verify") {
        const res = await bulkVerifyUsers(selectedUsers);
        setSelectedUsers([]);
        setNotice({
          type: "success",
          text: `Verified ${res.verified} user${res.verified === 1 ? "" : "s"}.`,
        });
      }
    } finally {
      setConfirmLoading(false);
      setPendingConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900">
      <TopBar
        title="User Management"
        subtitle="Manage student, hostel admin, and super admin accounts"
        onRefresh={refetch}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Directory & Accounts
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any user to view full profile, verification history, and
              emergency contact details.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff7a00] text-white text-xs font-semibold hover:bg-orange-600 transition-colors shadow-2xs"
            >
              <UserPlus size={14} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <UserStats stats={stats} loading={loading} />

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

        {/* Search, Filter & Sort Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 mb-4 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

          {showFilters && (
            <UserFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <BulkActions
            selectedCount={selectedUsers.length}
            onBulkVerify={() =>
              setPendingConfirm({
                type: "bulk_verify",
                count: selectedUsers.length,
              })
            }
            onBulkDelete={() =>
              setPendingConfirm({
                type: "bulk_delete",
                count: selectedUsers.length,
              })
            }
            onClearSelection={() => setSelectedUsers([])}
          />
        )}

        {/* Minimal List / Table */}
        <UserTable
          users={users}
          loading={loading}
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
          onViewDetails={(user) => {
            setSelectedUserId(user.id);
            setShowDetailsModal(true);
          }}
          onEditUser={(user) => {
            setSelectedUserId(user.id);
            setShowEditModal(true);
          }}
          onVerifyUser={handleVerifyUser}
          onDeleteUser={(user) =>
            setPendingConfirm({ type: "delete_single", user })
          }
          onSendVerification={handleSendVerification}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
            }}
            user={selectedUser}
            onUpdate={handleUpdateUser}
          />

          <UserDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
            }}
            user={selectedUser}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowEditModal(true);
            }}
            onVerify={() => handleVerifyUser(selectedUser.id)}
            onSendVerification={() => handleSendVerification(selectedUser.id)}
            onRoleChange={(role) => handleRoleChange(selectedUser.id, role)}
            onDelete={() =>
              setPendingConfirm({ type: "delete_single", user: selectedUser })
            }
          />
        </>
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={pendingConfirm !== null}
        onClose={() => !confirmLoading && setPendingConfirm(null)}
        onConfirm={handleConfirmAction}
        loading={confirmLoading}
        variant={pendingConfirm?.type === "bulk_verify" ? "primary" : "danger"}
        title={
          pendingConfirm?.type === "bulk_verify"
            ? `Verify ${pendingConfirm.count} Users`
            : pendingConfirm?.type === "bulk_delete"
              ? `Delete ${pendingConfirm.count} Users`
              : "Delete User Account"
        }
        description={
          pendingConfirm?.type === "bulk_verify"
            ? `Are you sure you want to mark ${pendingConfirm.count} selected user(s) as verified?`
            : pendingConfirm?.type === "bulk_delete"
              ? `This will permanently delete ${pendingConfirm.count} selected user(s) and cannot be undone.`
              : pendingConfirm?.type === "delete_single"
                ? `Are you sure you want to permanently delete ${
                    pendingConfirm.user.name || pendingConfirm.user.email
                  }? This action cannot be undone.`
                : ""
        }
        confirmLabel={
          pendingConfirm?.type === "bulk_verify" ? "Verify Users" : "Delete"
        }
      />
    </div>
  );
}
