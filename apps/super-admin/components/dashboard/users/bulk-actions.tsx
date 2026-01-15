'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Trash2, X } from 'lucide-react';

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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#ff7a00] text-white p-3 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-12 font-medium">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </div>
          <button
            onClick={onClearSelection}
            className="text-10 hover:bg-orange-700 px-2 py-1 rounded"
          >
            <X size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkVerify}
            className="flex items-center gap-1 px-3 py-1 text-11 font-medium bg-white text-[#ff7a00] hover:bg-gray-100"
          >
            <CheckCircle size={12} />
            Verify Selected
          </button>
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1 px-3 py-1 text-11 font-medium bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 size={12} />
            Delete Selected
          </button>
        </div>
      </div>
    </motion.div>
  );
}