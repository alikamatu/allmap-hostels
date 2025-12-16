'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  Search,
  TrendingUp,
  Shield,
  Eye,
  Plus,
  RefreshCw,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useAccess } from '@/hooks/useAccess';
import { AccessFilters, AccessStatus } from '@/types/access.types';
import AccessStats from '@/components/dashboard/payments/access-stats';
import AccessTable from '@/components/dashboard/payments/access-table';
// import AccessFiltersPanel from '@/components/payments/AccessFiltersPanel';
// import RevenueChart from '@/components/payments/RevenueChart';
// import PreviewUsagePanel from '@/components/payments/PreviewUsagePanel';

export default function PaymentsPage() {
  const [filters, setFilters] = useState<AccessFilters>({
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'access' | 'revenue' | 'preview'>('access');

  const {
    records,
    pagination,
    loading,
    error,
    stats,
    previewStats,
    revenueStats,
    previewRecords,
    refetch,
    refetchStats,
    refetchPreview,
    refetchRevenue,
    exportRecords,
  } = useAccess(filters);

  const handleFilterChange = (newFilters: Partial<AccessFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm || undefined });
  };

  const handleExport = async () => {
    const csv = await exportRecords(filters);
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-records-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetch(filters),
      refetchStats(),
      refetchRevenue('monthly'),
    ]);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-20 font-semibold text-gray-900">Payment & Access Management</h1>
          <p className="text-12 text-gray-500">Manage user access, subscriptions, and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium text-gray-700 hover:bg-gray-100"
            title="Refresh Data"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => setShowPreviewPanel(true)}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium text-gray-700 hover:bg-gray-100"
          >
            <Eye size={14} />
            Preview Usage
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium text-gray-700 hover:bg-gray-100"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-600" />
            <p className="text-11 font-medium text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && <AccessStats stats={stats} />}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('access')}
              className={`py-2 px-1 text-12 font-medium border-b-2 ${
                activeTab === 'access'
                  ? 'border-[#ff7a00] text-[#ff7a00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={14} />
                Access Records
              </div>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-2 px-1 text-12 font-medium border-b-2 ${
                activeTab === 'revenue'
                  ? 'border-[#ff7a00] text-[#ff7a00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign size={14} />
                Revenue Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 px-1 text-12 font-medium border-b-2 ${
                activeTab === 'preview'
                  ? 'border-[#ff7a00] text-[#ff7a00]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye size={14} />
                Preview Analytics
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Access Tab Content */}
      {activeTab === 'access' && (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search users, email, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 text-12 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#ff7a00] focus:border-[#ff7a00]"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-11 font-medium text-[#ff7a00] hover:text-orange-700"
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 text-11 font-medium ${
                    showFilters ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Filter size={14} />
                  Filters
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {/* {showFilters && (
              <AccessFiltersPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            )} */}
          </div>

          {/* Access Table */}
          <AccessTable
            records={records}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        </>
      )}

      {/* Revenue Tab Content */}
      {activeTab === 'revenue' && revenueStats && (
        <div className="space-y-6">
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">This Month</div>
                <DollarSign size={16} className="text-green-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                ${revenueStats.thisMonth.toLocaleString()}
              </div>
              <div className="flex items-center mt-2">
                {revenueStats.growth >= 0 ? (
                  <TrendingUp size={12} className="text-green-600 mr-1" />
                ) : (
                  <TrendingUp size={12} className="text-red-600 mr-1 rotate-180" />
                )}
                <span className={`text-11 ${revenueStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueStats.growth >= 0 ? '+' : ''}{revenueStats.growth.toFixed(1)}%
                </span>
                <span className="text-11 text-gray-500 ml-2">vs last month</span>
              </div>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">Total Revenue</div>
                <BarChart3 size={16} className="text-blue-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                ${revenueStats.total.toLocaleString()}
              </div>
              <div className="text-11 text-gray-500 mt-2">All-time revenue</div>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">MRR Estimate</div>
                <Calendar size={16} className="text-purple-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                ${revenueStats.estimatedMonthlyRecurring.toLocaleString()}
              </div>
              <div className="text-11 text-gray-500 mt-2">Monthly recurring revenue</div>
            </div>
          </div>

          {/* Revenue Chart */}
          {/* <RevenueChart data={revenueStats} /> */}

          {/* Revenue by Source */}
          <div className="bg-white p-4">
            <h3 className="text-14 font-medium text-gray-900 mb-4">Revenue by Source</h3>
            <div className="space-y-3">
              {Object.entries(revenueStats.bySource).map(([source, amount]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      source === 'paystack' ? 'bg-green-500' :
                      source === 'manual_grant' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-12 font-medium text-gray-900 capitalize">
                      {source.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-12 font-semibold text-gray-900">
                    ${amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab Content */}
      {activeTab === 'preview' && previewStats && (
        <div className="space-y-6">
          {/* Preview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">Total Previews</div>
                <Eye size={16} className="text-blue-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                {previewStats.totalUses.toLocaleString()}
              </div>
              <div className="text-11 text-gray-500 mt-2">All-time preview usage</div>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">Unique Users</div>
                <Users size={16} className="text-green-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                {previewStats.uniqueUsers.toLocaleString()}
              </div>
              <div className="text-11 text-gray-500 mt-2">Users who used preview</div>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">Top Source</div>
                <Shield size={16} className="text-purple-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                {Object.entries(previewStats.bySource).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
              <div className="text-11 text-gray-500 mt-2">Most common preview source</div>
            </div>

            <div className="bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-11 font-medium text-gray-500">Today</div>
                <Calendar size={16} className="text-orange-600" />
              </div>
              <div className="text-20 font-semibold text-gray-900">
                {previewStats.byDay[new Date().toISOString().split('T')[0]] || 0}
              </div>
              <div className="text-11 text-gray-500 mt-2">Previews today</div>
            </div>
          </div>

          {/* Preview Usage by Source */}
          <div className="bg-white p-4">
            <h3 className="text-14 font-medium text-gray-900 mb-4">Preview Usage by Source</h3>
            <div className="space-y-3">
              {Object.entries(previewStats.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span className="text-12 font-medium text-gray-900 capitalize">
                        {source.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-12 text-gray-500">{count} uses</div>
                      <div className="text-11 font-semibold text-gray-900">
                        {Math.round((count / previewStats.totalUses) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Usage Modal
      {showPreviewPanel && (
        <PreviewUsagePanel
          isOpen={showPreviewPanel}
          onClose={() => setShowPreviewPanel(false)}
          records={previewRecords}
          stats={previewStats}
          onRefresh={refetchPreview}
        />
      )} */}
    </div>
  );
}