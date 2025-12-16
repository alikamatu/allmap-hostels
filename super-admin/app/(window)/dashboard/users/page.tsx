'use client';

import { useState } from 'react';
import { 
  UserPlus, 
  Download, 
  Filter,
  Search,
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserFilters, UserRole, UserStatus } from '@/types/user.types';
import UserTable from '@/components/dashboard/users/user-table';
import UserFiltersPanel from '@/components/dashboard/users/user-filters-panel';
import CreateUserModal from '@/components/dashboard/users/create-user-modal';
import EditUserModal from '@/components/dashboard/users/edit-user-modal';
import UserDetailsModal from '@/components/dashboard/users/user-details-modal';
import BulkActions from '@/components/dashboard/users/bulk-actions';
import UserStats from '@/components/dashboard/users/user-stats';

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const {
    users,
    stats,
    pagination,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    verifyUser,
    updateUserRole,
    deleteUser,
    bulkVerifyUsers,
    bulkDeleteUsers,
    exportUsers,
  } = useUsers(filters);

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm || undefined });
  };

  const handleCreateUser = async (data: any) => {
    const result = await createUser(data);
    if (result) {
      setShowCreateModal(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (selectedUser) {
      const result = await updateUser(selectedUser.id, data);
      if (result) {
        setShowEditModal(false);
        setSelectedUser(null);
      }
    }
  };

  const handleVerifyUser = async (userId: string) => {
    await verifyUser(userId);
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
    }
  };

  const handleExport = async () => {
    const csv = await exportUsers(filters);
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const handleBulkVerify = async () => {
    if (selectedUsers.size === 0) return;
    
    if (confirm(`Verify ${selectedUsers.size} users?`)) {
      await bulkVerifyUsers(Array.from(selectedUsers));
      setSelectedUsers(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (confirm(`Delete ${selectedUsers.size} users? This action cannot be undone.`)) {
      await bulkDeleteUsers(Array.from(selectedUsers));
      setSelectedUsers(new Set());
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-20 font-semibold text-gray-900">User Management</h1>
          <p className="text-12 text-gray-500">Manage all users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium text-gray-700 hover:bg-gray-100"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-12 font-medium bg-[#ff7a00] text-white hover:bg-orange-600"
          >
            <UserPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-11 font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && <UserStats stats={stats} />}

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <BulkActions
          selectedCount={selectedUsers.size}
          onBulkVerify={handleBulkVerify}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedUsers(new Set())}
        />
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
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
        {showFilters && (
          <UserFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        pagination={pagination}
        selectedUsers={selectedUsers}
        onSelectAll={handleSelectAll}
        onSelectUser={handleSelectUser}
        onPageChange={(page) => handleFilterChange({ page })}
        onViewUser={(user) => {
          setSelectedUser(user);
          setShowDetailsModal(true);
        }}
        onEditUser={(user) => {
          setSelectedUser(user);
          setShowEditModal(true);
        }}
        onVerifyUser={handleVerifyUser}
        onUpdateRole={handleUpdateRole}
        onDeleteUser={handleDeleteUser}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateUser}
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onUpdate={handleUpdateUser}
          />

          <UserDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
}