"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

export const RejectModal = ({
  isOpen,
  reason,
  setReason,
  onConfirm,
  onCancel,
  isLoading
}: {
  isOpen: boolean;
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 max-w-2xl w-full"
        >
          <h3 className="text-4xl font-bold text-gray-900 mb-6">Reason for Rejection</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-40 p-4 text-2xl border border-gray-300 rounded-xl mb-6"
          />
          <div className="flex space-x-4">
            <button onClick={onCancel} className="flex-1 py-4 bg-gray-300 text-gray-800 text-2xl font-bold rounded-xl">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading || !reason}
              className={`flex-1 py-4 text-white text-2xl font-bold rounded-xl flex items-center justify-center ${
                isLoading || !reason ? 'bg-red-400' : 'bg-red-500'
              }`}
            >
              {isLoading ? <FiLoader className="animate-spin mr-2" /> : null}
              Confirm Rejection
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);