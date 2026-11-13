"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, User } from "lucide-react";
import { User as UserType, UpdateUserData, Gender } from "@/types/user.types";
import { Modal } from "@/components/ui/modal";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdate: (data: UpdateUserData) => Promise<unknown> | void;
}

const GENDER_OPTIONS: SelectOption<"" | Gender>[] = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender,
        emergency_contact_name: user.emergency_contact_name || "",
        emergency_contact_phone: user.emergency_contact_phone || "",
        emergency_contact_relationship:
          user.emergency_contact_relationship || "",
        emergency_contact_email: user.emergency_contact_email || "",
        school_id: user.school_id,
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onUpdate(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof UpdateUserData>(
    field: K,
    value: UpdateUserData[K],
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
      size="md"
      title="Edit User"
      subtitle={user.email}
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
            form="edit-user-form"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium bg-[#ff7a00] text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={15}
              />
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
                placeholder="Enter full name"
              />
            </div>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={15}
              />
              <input
                type="email"
                value={formData.email || ""}
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

          <CustomSelect<"" | Gender>
            label="Gender"
            value={formData.gender || ""}
            onChange={(val) =>
              handleChange("gender", val ? (val as Gender) : undefined)
            }
            options={GENDER_OPTIONS}
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergency_contact_name || ""}
                onChange={(e) =>
                  handleChange("emergency_contact_name", e.target.value)
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.emergency_contact_phone || ""}
                onChange={(e) =>
                  handleChange("emergency_contact_phone", e.target.value)
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                value={formData.emergency_contact_relationship || ""}
                onChange={(e) =>
                  handleChange("emergency_contact_relationship", e.target.value)
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
                placeholder="e.g., Parent, Guardian"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.emergency_contact_email || ""}
                onChange={(e) =>
                  handleChange("emergency_contact_email", e.target.value)
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/15"
                placeholder="contact@example.com"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
