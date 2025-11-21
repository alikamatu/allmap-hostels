"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Settings, Trash2, X } from 'lucide-react';
import { RoomStatus } from '@/types/room';

const QuickActionsBar = ({ 
  selectedCount, 
  onMarkAvailable, 
  onMarkMaintenance, 
  onDeleteAll, 
  onClearSelection 
}: { 
  selectedCount: number;
  onMarkAvailable: () => void;
  onMarkMaintenance: () => void;
  onDeleteAll: () => void;
  onClearSelection: () => void;
}) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-t-4 border-t-[#FF6A00] px-4 py-3 flex items-center gap-4 z-40 shadow-lg"
  >
    <span className="text-xs font-medium text-gray-900">{selectedCount} room(s) selected</span>
    <div className="flex gap-2">
      <button
        onClick={onMarkAvailable}
        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors duration-150 flex items-center gap-1"
      >
        <CheckCircle size={12} />
        Mark Available
      </button>
      <button
        onClick={onMarkMaintenance}
        className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium hover:bg-yellow-700 transition-colors duration-150 flex items-center gap-1"
      >
        <Settings size={12} />
        Mark Maintenance
      </button>
      <button
        onClick={onDeleteAll}
        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors duration-150 flex items-center gap-1"
      >
        <Trash2 size={12} />
        Delete All
      </button>
      <button
        onClick={onClearSelection}
        className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium hover:bg-gray-700 transition-colors duration-150 flex items-center gap-1"
      >
        <X size={12} />
        Clear Selection
      </button>
    </div>
  </motion.div>
);

export default QuickActionsBar;