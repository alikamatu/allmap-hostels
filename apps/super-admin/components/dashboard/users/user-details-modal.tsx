'use client';

import { motion } from 'framer-motion';
import { 
  X, 
  Mail, 
  Phone, 
  User, 
  School, 
  Calendar, 
  Shield, 
  Building, 
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { User as UserType } from '@/types/user.types';
import { formatDate } from '@/lib/formatters';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!isOpen) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return GraduationCap;
      case 'hostel_admin':
        return Building;
      case 'super_admin':
        return Shield;
      default:
        return User;
    }
  };

  const getStatusIcon = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return CheckCircle;
    } else if (status === 'pending') {
      return Clock;
    } else {
      return XCircle;
    }
  };

  const getStatusColor = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return 'text-green-600';
    } else if (status === 'pending') {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  const RoleIcon = getRoleIcon(user.role);
  const StatusIcon = getStatusIcon(user.status, user.is_verified);
  const statusColor = getStatusColor(user.status, user.is_verified);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-16 font-semibold text-gray-700">
                {user.name?.charAt(0) || user.email.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-18 font-semibold text-gray-900">{user.name || 'Unnamed User'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusColor} bg-opacity-10`}>
                  <StatusIcon size={10} />
                  <span className="text-10 font-medium capitalize">
                    {user.is_verified ? 'Verified' : user.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-blue-600 bg-blue-50">
                  <RoleIcon size={10} />
                  <span className="text-10 font-medium capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-14 font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-gray-400" />
                  <div>
                    <div className="text-11 text-gray-500">Email</div>
                    <div className="text-12 font-medium text-gray-900">{user.email}</div>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-gray-400" />
                    <div>
                      <div className="text-11 text-gray-500">Phone</div>
                      <div className="text-12 font-medium text-gray-900">{user.phone}</div>
                    </div>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-gray-400" />
                    <div>
                      <div className="text-11 text-gray-500">Gender</div>
                      <div className="text-12 font-medium text-gray-900 capitalize">{user.gender}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-gray-400" />
                  <div>
                    <div className="text-11 text-gray-500">Joined</div>
                    <div className="text-12 font-medium text-gray-900">
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                </div>
                {user.verified_at && (
                  <div className="flex items-center gap-3">
                    <UserCheck size={14} className="text-gray-400" />
                    <div>
                      <div className="text-11 text-gray-500">Verified On</div>
                      <div className="text-12 font-medium text-gray-900">
                        {formatDate(user.verified_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* School Information */}
            <div>
              <h3 className="text-14 font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                School Information
              </h3>
              {user.school ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <School size={14} className="text-gray-400" />
                    <div>
                      <div className="text-11 text-gray-500">School</div>
                      <div className="text-12 font-medium text-gray-900">{user.school.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-gray-400" />
                    <div>
                      <div className="text-11 text-gray-500">Domain</div>
                      <div className="text-12 font-medium text-gray-900">{user.school.domain}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                  <AlertCircle size={14} className="text-gray-400" />
                  <span className="text-11 text-gray-500">No school information available</span>
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            {(user.emergency_contact_name || user.emergency_contact_phone) && (
              <div className="md:col-span-2">
                <h3 className="text-14 font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.emergency_contact_name && (
                    <div className="flex items-center gap-3">
                      <User size={14} className="text-gray-400" />
                      <div>
                        <div className="text-11 text-gray-500">Name</div>
                        <div className="text-12 font-medium text-gray-900">{user.emergency_contact_name}</div>
                      </div>
                    </div>
                  )}
                  {user.emergency_contact_phone && (
                    <div className="flex items-center gap-3">
                      <PhoneCall size={14} className="text-gray-400" />
                      <div>
                        <div className="text-11 text-gray-500">Phone</div>
                        <div className="text-12 font-medium text-gray-900">{user.emergency_contact_phone}</div>
                      </div>
                    </div>
                  )}
                  {user.emergency_contact_relationship && (
                    <div className="flex items-center gap-3">
                      <UserCheck size={14} className="text-gray-400" />
                      <div>
                        <div className="text-11 text-gray-500">Relationship</div>
                        <div className="text-12 font-medium text-gray-900">{user.emergency_contact_relationship}</div>
                      </div>
                    </div>
                  )}
                  {user.emergency_contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-gray-400" />
                      <div>
                        <div className="text-11 text-gray-500">Email</div>
                        <div className="text-12 font-medium text-gray-900">{user.emergency_contact_email}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Statistics */}
            {user.stats && (
              <div className="md:col-span-2">
                <h3 className="text-14 font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  User Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-16 font-semibold text-gray-900">{user.stats.totalBookings || 0}</div>
                    <div className="text-11 text-gray-500">Total Bookings</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-16 font-semibold text-gray-900">{user.stats.activeBookings || 0}</div>
                    <div className="text-11 text-gray-500">Active Bookings</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-16 font-semibold text-gray-900">{user.stats.totalHostels || 0}</div>
                    <div className="text-11 text-gray-500">Hostels Managed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="md:col-span-2">
              <h3 className="text-14 font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Account Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${user.is_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <StatusIcon size={12} className={user.is_verified ? 'text-green-600' : 'text-gray-600'} />
                  </div>
                  <div>
                    <div className="text-11 text-gray-500">Verification</div>
                    <div className="text-12 font-medium text-gray-900">
                      {user.is_verified ? 'Verified' : 'Not Verified'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-100">
                    <UserCheck size={12} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-11 text-gray-500">Onboarding</div>
                    <div className="text-12 font-medium text-gray-900">
                      {user.onboarding_completed ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-purple-100">
                    <Shield size={12} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-11 text-gray-500">Terms</div>
                    <div className="text-12 font-medium text-gray-900">
                      {user.terms_accepted ? 'Accepted' : 'Pending'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-orange-100">
                    <Building size={12} className="text-orange-600" />
                  </div>
                  <div>
                    <div className="text-11 text-gray-500">Role</div>
                    <div className="text-12 font-medium text-gray-900 capitalize">
                      {user.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}