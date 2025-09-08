"use client";

import { useState } from "react";
import { UserFilters, User } from "@/types/user.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useUsers } from "@/services/useUsers";
import { UserStatsCards } from "@/components/dashboard/user-management/UserStatsCards";
import { UserFiltersComponent } from "@/components/dashboard/user-management/UserFilters";
import { UserActions } from "@/components/dashboard/user-management/UserActions";
import { UserDetailsDialog } from "@/components/dashboard/user-management/UserDetailsDialog";

export default function UserManagementPage() {
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const { users, stats, loading, error, updateUserStatus, updateUserRole, deleteUser, refetch } = useUsers(filters);

  const handleStatusChange = async (userId: string, status: 'verified' | 'unverified' | 'pending') => {
    const success = await updateUserStatus(userId, status);
    if (success) {
      toast.success(`User status updated to ${status}`);
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleRoleChange = async (userId: string, role: 'student' | 'hostel_admin') => {
    const success = await updateUserRole(userId, role);
    if (success) {
      toast.success(`User role updated to ${role}`);
    } else {
      toast.error("Failed to update user role");
    }
  };

  const handleDelete = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      toast.success("User deleted successfully");
    } else {
      toast.error("Failed to delete user");
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'unverified': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'hostel_admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'student': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users, their roles, and verification status
        </p>
      </div>

      <UserStatsCards stats={stats} loading={loading} />

      <UserFiltersComponent 
        filters={filters} 
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-10 text-destructive">
              <p>Error loading users: {error}</p>
              <button 
                onClick={() => refetch()} 
                className="mt-4 text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No users found matching your filters</p>
              {Object.keys(filters).length > 0 && (
                <button 
                  onClick={handleClearFilters}
                  className="mt-2 text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{user.name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_verified ? "default" : "secondary"}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions
                          user={user}
                          onStatusChange={handleStatusChange}
                          onRoleChange={handleRoleChange}
                          onDelete={handleDelete}
                          onViewDetails={handleViewDetails}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDetailsDialog
        user={selectedUser}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}