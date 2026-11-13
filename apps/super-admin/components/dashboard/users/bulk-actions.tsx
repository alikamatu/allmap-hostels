"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Trash2, X } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onBulkVerify: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedCount,
  onBulkVerify,
  onBulkDelete,
  onClearSelection,
}: BulkActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-gray-900 text-white rounded-2xl px-4 py-3 mb-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <span className="text-xs sm:text-[13px] font-medium">
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 mr-2 rounded-full bg-[#ff7a00] text-white text-xs font-semibold">
              {selectedCount}
            </span>
            user{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={13} />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBulkVerify}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Verify Selected</span>
          </button>
          <button
            type="button"
            onClick={onBulkDelete}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Trash2 size={14} />
            <span>Delete Selected</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
