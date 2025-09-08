"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, UserCheck, UserX, Shield, Trash2, Eye } from "lucide-react";
import { User } from "@/types/user.types";
import { useState } from "react";

interface UserActionsProps {
  user: User;
  onStatusChange: (userId: string, status: 'verified' | 'unverified' | 'pending') => void;
  onRoleChange: (userId: string, role: 'student' | 'hostel_admin') => void;
  onDelete: (userId: string) => void;
  onViewDetails: (user: User) => void;
}

export function UserActions({ user, onStatusChange, onRoleChange, onDelete, onViewDetails }: UserActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewDetails(user)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {!user.is_verified && (
            <DropdownMenuItem onClick={() => onStatusChange(user.id, 'verified')}>
              <UserCheck className="mr-2 h-4 w-4" />
              Verify User
            </DropdownMenuItem>
          )}
          
          {user.is_verified && (
            <DropdownMenuItem onClick={() => onStatusChange(user.id, 'unverified')}>
              <UserX className="mr-2 h-4 w-4" />
              Unverify User
            </DropdownMenuItem>
          )}
          
          {user.role === 'student' && (
            <DropdownMenuItem onClick={() => onRoleChange(user.id, 'hostel_admin')}>
              <Shield className="mr-2 h-4 w-4" />
              Make Hostel Admin
            </DropdownMenuItem>
          )}
          
          {user.role === 'hostel_admin' && (
            <DropdownMenuItem onClick={() => onRoleChange(user.id, 'student')}>
              <Shield className="mr-2 h-4 w-4" />
              Make Student
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for {user.name || user.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(user.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
