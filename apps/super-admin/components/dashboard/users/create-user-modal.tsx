"use client";

import { useState } from "react";
import { Mail, Phone, Lock, User } from "lucide-react";
import { CreateUserData, UserRole } from "@/types/user.types";
import { Modal } from "@/components/ui/modal";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateUserData) => Promise<unknown> | void;
}

const ROLE_OPTIONS: SelectOption<UserRole>[] = [
  { value: "student", label: "Student" },
  { value: "hostel_admin", label: "Hostel Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreate,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student",
    is_verified: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onCreate(formData);
      onClose();
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "student",
        is_verified: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof CreateUserData>(
    field: K,
    value: CreateUserData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Create New User"
      subtitle="Add a student, hostel admin, or super admin account"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-user-form"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium bg-[#ff7a00] text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border bg-white ${
                errors.name ? "border-red-400" : "border-gray-200"
              } focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15`}
              placeholder="Enter full name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border bg-white ${
                errors.email ? "border-red-400" : "border-gray-200"
              } focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15`}
              placeholder="Enter email address"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Password *
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border bg-white ${
                errors.password ? "border-red-400" : "border-gray-200"
              } focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15`}
              placeholder="Minimum 6 characters"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <CustomSelect<UserRole>
          label="Role"
          value={formData.role || "student"}
          onChange={(val) =>
            handleChange("role", (val || "student") as UserRole)
          }
          options={ROLE_OPTIONS}
        />

        <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(formData.is_verified)}
            onChange={(e) => handleChange("is_verified", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#ff7a00] focus:ring-[#ff7a00]"
          />
          <span className="text-xs text-gray-700">
            Mark account as verified immediately
          </span>
        </label>
      </form>
    </Modal>
  );
}
