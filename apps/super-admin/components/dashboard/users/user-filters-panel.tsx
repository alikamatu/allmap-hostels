"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { UserFilters, UserRole, UserStatus } from "@/types/user.types";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";

interface UserFiltersPanelProps {
  filters: UserFilters;
  onFilterChange: (filters: Partial<UserFilters>) => void;
  onClose: () => void;
}

const ROLE_OPTIONS: SelectOption<"" | UserRole>[] = [
  { value: "", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "hostel_admin", label: "Hostel Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const STATUS_OPTIONS: SelectOption<"" | UserStatus>[] = [
  { value: "", label: "All Statuses" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "unverified", label: "Unverified" },
];

const VERIFICATION_OPTIONS: SelectOption<"" | "true" | "false">[] = [
  { value: "", label: "Any Verification" },
  { value: "true", label: "Verified Only" },
  { value: "false", label: "Unverified Only" },
];

export default function UserFiltersPanel({
  filters,
  onFilterChange,
  onClose,
}: UserFiltersPanelProps) {
  const [localFilters, setLocalFilters] =
    useState<Partial<UserFilters>>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Partial<UserFilters> = {
      role: undefined,
      status: undefined,
      is_verified: undefined,
      school_id: undefined,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="mt-4 pt-4 border-t border-gray-100"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <CustomSelect<"" | UserRole>
          label="Role"
          value={localFilters.role || ""}
          onChange={(val) =>
            setLocalFilters((prev) => ({
              ...prev,
              role: val ? (val as UserRole) : undefined,
            }))
          }
          options={ROLE_OPTIONS}
        />

        <CustomSelect<"" | UserStatus>
          label="Account Status"
          value={localFilters.status || ""}
          onChange={(val) =>
            setLocalFilters((prev) => ({
              ...prev,
              status: val ? (val as UserStatus) : undefined,
            }))
          }
          options={STATUS_OPTIONS}
        />

        <CustomSelect<"" | "true" | "false">
          label="Verification"
          value={
            localFilters.is_verified === undefined
              ? ""
              : localFilters.is_verified
                ? "true"
                : "false"
          }
          onChange={(val) =>
            setLocalFilters((prev) => ({
              ...prev,
              is_verified: val === "" ? undefined : val === "true",
            }))
          }
          options={VERIFICATION_OPTIONS}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-4 pt-3.5 border-t border-gray-100">
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
    </motion.div>
  );
}
