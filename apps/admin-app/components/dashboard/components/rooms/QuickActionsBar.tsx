"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Settings, Trash2, X } from 'lucide-react';
import { Button } from '@repo/ui';

const QuickActionsBar = ({ 
  selectedCount, 
  onMarkAvailable, 
  onMarkMaintenance, 
  onDeleteAll, 
  onClearSelection,
  loading = false
}: { 
  selectedCount: number;
  onMarkAvailable: () => void;
  onMarkMaintenance: () => void;
  onDeleteAll: () => void;
  onClearSelection: () => void;
  loading?: boolean;
}) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border-t-4 border-t-[#FF6A00] px-4 py-3 flex items-center gap-4 z-40 shadow-lg"
  >
    <span className="text-xs font-medium text-gray-900">{selectedCount} room(s) selected</span>
    <div className="flex flex-wrap gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={onMarkAvailable}
        loading={loading}
        className="bg-green-600 hover:bg-green-700 text-white border-none"
      >
        <CheckCircle size={12} className="mr-1" />
        Mark Available
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onMarkMaintenance}
        loading={loading}
        className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
      >
        <Settings size={12} className="mr-1" />
        Mark Maintenance
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDeleteAll}
        loading={loading}
      >
        <Trash2 size={12} className="mr-1" />
        Delete All
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onClearSelection}
        disabled={loading}
      >
        <X size={12} className="mr-1" />
        Clear
      </Button>
    </div>
  </motion.div>
);

export default QuickActionsBar;