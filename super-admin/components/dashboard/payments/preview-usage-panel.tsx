'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  RefreshCw,
  Eye,
  User,
  Calendar,
  Globe,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { PreviewUsageRecord, PreviewUsageStats } from '@/types/access.types';
import { formatDate } from '@/lib/formatters';

interface PreviewUsagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  records: PreviewUsageRecord[];
  stats: PreviewUsageStats | null;
  onRefresh: () => void;
}

export default function PreviewUsagePanel({
  isOpen,
  onClose,
  records,
  stats,
  onRefresh,
}: PreviewUsagePanelProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'analytics'>('records');
  const [selectedRecord, setSelectedRecord] = useState<PreviewUsageRecord | null>(null);

  const handleExport = () => {
    const csvContent = [
      ['User ID', 'Name', 'Email', 'Source', 'IP Address', 'User Agent', 'Used At'],
      ...records.map(record => [
        record.user.id,
        record.user.name || '',
        record.user.email,
        record.source,
        record.ipAddress || '',
        record.userAgent || '',
        new Date(record.usedAt).toISOString(),
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preview-usage-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getDeviceInfo = (userAgent: string | undefined) => {
    if (!userAgent) return 'Unknown';
    
    if (/mobile/i.test(userAgent)) {
      return 'Mobile';
    } else if (/tablet/i.test(userAgent)) {
      return 'Tablet';
    } else if (/Mozilla|Chrome|Safari|Firefox/i.test(userAgent)) {
      return 'Desktop';
    }
    return 'Unknown';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-18 font-semibold text-gray-900">Preview Usage</h2>
                <p className="text-12 text-gray-500">Track user preview activity</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onRefresh}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Refresh"
                >
                  <RefreshCw size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Export CSV"
                >
                  <Download size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('records')}
                  className={`flex-1 py-3 text-center text-12 font-medium ${
                    activeTab === 'records'
                      ? 'text-[#ff7a00] border-b-2 border-[#ff7a00]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Eye size={14} />
                    Usage Records
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 py-3 text-center text-12 font-medium ${
                    activeTab === 'analytics'
                      ? 'text-[#ff7a00] border-b-2 border-[#ff7a00]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Globe size={14} />
                    Analytics
                  </div>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="h-[calc(100vh-160px)] overflow-y-auto">
              {activeTab === 'records' ? (
                <div className="divide-y divide-gray-100">
                  {records.length === 0 ? (
                    <div className="p-8 text-center">
                      <Eye size={32} className="mx-auto text-gray-300 mb-3" />
                      <h3 className="text-14 font-medium text-gray-900 mb-1">No preview usage found</h3>
                      <p className="text-12 text-gray-500">No users have used preview features yet</p>
                    </div>
                  ) : (
                    records.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User size={18} className="text-gray-600" />
                            </div>
                            <div>
                              <div className="text-12 font-medium text-gray-900">
                                {record.user.name || 'Anonymous User'}
                              </div>
                              <div className="text-11 text-gray-500">{record.user.email}</div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-10 font-medium text-gray-700 rounded">
                                  {record.source}
                                </span>
                                {record.ipAddress && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-10 font-medium text-blue-700 rounded">
                                    <Globe size={10} />
                                    {record.ipAddress}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-11 text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(record.usedAt)}
                            </div>
                            <div className="text-10 text-gray-400 mt-1">
                              {getDeviceInfo(record.userAgent)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Analytics Tab
                <div className="p-6 space-y-6">
                  {stats && (
                    <>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                          <div className="text-11 font-medium text-gray-500">Total Previews</div>
                          <div className="text-20 font-semibold text-gray-900 mt-1">
                            {stats.totalUses.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                          <div className="text-11 font-medium text-gray-500">Unique Users</div>
                          <div className="text-20 font-semibold text-gray-900 mt-1">
                            {stats.uniqueUsers.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Daily Usage */}
                      <div>
                        <h4 className="text-12 font-medium text-gray-900 mb-3">Daily Usage (Last 7 days)</h4>
                        <div className="space-y-2">
                          {Object.entries(stats.byDay)
                            .slice(-7)
                            .map(([date, count]) => (
                              <div key={date} className="flex items-center justify-between">
                                <span className="text-11 text-gray-600">
                                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-[#ff7a00] h-2 rounded-full"
                                      style={{ width: `${(count / Math.max(...Object.values(stats.byDay))) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-11 font-semibold text-gray-900 w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}