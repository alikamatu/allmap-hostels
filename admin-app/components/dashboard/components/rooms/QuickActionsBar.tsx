"use client";

import React from 'react';
import { motion } from 'framer-motion';
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
    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white rounded-lg shadow-lg px-6 py-3 flex items-center gap-4 z-40"
  >
    <span className="text-sm">{selectedCount} room(s) selected</span>
    <div className="flex gap-2">
      <button
        onClick={onMarkAvailable}
        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
      >
        Mark Available
      </button>
      <button
        onClick={onMarkMaintenance}
        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
      >
        Mark Maintenance
      </button>
      <button
        onClick={onDeleteAll}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
      >
        Delete All
      </button>
      <button
        onClick={onClearSelection}
        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
      >
        Clear Selection
      </button>
    </div>
  </motion.div>
);

export default QuickActionsBar;