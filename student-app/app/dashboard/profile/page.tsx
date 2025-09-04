"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiMail, FiPhone, FiShield, FiCheckCircle, FiXCircle, FiEdit, FiMapPin, FiGlobe, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import EditProfileModal from '@/_components/profile/EditProfileModal';
import ChangePasswordModal from '@/_components/profile/ChangePasswordModal';

interface School {
  id: string;
  name: string;
  domain: string;
  location: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  is_verified: boolean;
  role: string;
  school_id: string;
  school?: School;
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

// Add this debugging code to your profile page's fetchProfile function
const fetchProfile = async () => {
  try {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Fetching profile...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user-profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status === 404) {
        throw new Error('Profile not found');
      }
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();
    console.log('Profile API Response:', data); // Add this debug line
    console.log('Gender from API:', data.gender); // Add this debug line
    
    // Also log localStorage data for comparison
    const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('LocalStorage user:', localStorageUser);
    console.log('LocalStorage gender:', localStorageUser.gender);
    
    setProfile(data);
  } catch (err) {
    console.error('Profile fetch error:', err);
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};

    fetchProfile();
  }, [authUser]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const formatGender = (gender?: string) => {
    if (!gender) return 'Not specified';
    
    const genderMap: { [key: string]: string } = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer_not_to_say': 'Prefer not to say'
    };
    
    return genderMap[gender] || gender;
  };

  // Loading state
  if (loading) {
    return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[400px] sm:h-[600px] flex items-center justify-center"
    >
      <div className="relative flex w-64 animate-pulse gap-2 p-4">
        <div className="h-12 w-12 rounded-full bg-slate-400"></div>
        <div className="flex-1">
          <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
          <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
        </div>
        <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
      </div>
    </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center max-w-md px-6 py-8">
          <FiXCircle className="h-6 w-6  mx-auto mb-4" />
          <h2 className="text-2xl font-bold  mb-2">Profile Error</h2>
          <p className=" mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2   hover:bg-gray-800 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center px-6 py-8">
          <p className="">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-6 font-sans text-gray-900">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold  mb-2">Your Profile</h1>
          <p className="text-base  mb-8 leading-relaxed">
            Manage your account information and settings
          </p>

          {profile && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <FiUser className="h-6 w-6 " />
                  <div>
                    <h2 className="text-2xl font-bold ">{profile.name || 'User'}</h2>
                    <p className="text-base text-gray-800">{profile.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiShield className="h-4 w-4 " />
                    <span className="text-sm text-gray-800 capitalize">{profile.role.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-2xl font-bold  mb-4 flex items-center">
                  <FiUser className="h-6 w-6  mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <InfoItem icon={<FiUser className="h-4 w-4 " />} label="Full Name" value={profile.name || "Not provided"} />
                  <InfoItem icon={<FiUser className="h-4 w-4 " />} label="Gender" value={formatGender(profile.gender)} />
                  <InfoItem icon={<FiMail className="h-4 w-4 " />} label="Email" value={profile.email} />
                  <InfoItem icon={<FiPhone className="h-4 w-4 " />} label="Phone" value={profile.phone || "Not provided"} />
                  <div className="flex items-center space-x-3">
                    <div>{profile.is_verified ? <FiCheckCircle className="h-4 w-4 " /> : <FiXCircle className="h-4 w-4 " />}</div>
                    <div>
                      <p className="text-sm ">Verification Status</p>
                      <p className="text-base ">{profile.is_verified ? "Verified Account" : "Unverified Account"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    <FiEdit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowChangePasswordModal(true)}
                    className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
                  >
                    <FiLock className="h-4 w-4 mr-2" />
                    Change Password
                  </motion.button>
                </div>
              </div>

              <hr className="border-t border-gray-200" />

              {/* Security Settings */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <FiLock className="h-6 w-6 mr-2" />
                  Security Settings
                </h3>
                <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600">
                        Keep your account secure with a strong password
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setShowChangePasswordModal(true)}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200"
                    >
                      Change
                    </motion.button>
                  </div>
                  <div className="flex items-start justify-between pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="font-semibold text-gray-900">Account Verification</h4>
                      <p className="text-sm text-gray-600">
                        {profile.is_verified ? "Your account is verified" : "Verify your account for enhanced security"}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {profile.is_verified ? (
                        <span className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                          <FiCheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                          <FiXCircle className="h-4 w-4 mr-1" />
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-t border-gray-200" />

              {/* School Information */}
              <div>
                <h3 className="text-2xl font-bold  mb-4 flex items-center">
                  <FiMapPin className="h-6 w-6  mr-2" />
                  School Information
                </h3>
                {profile.school ? (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold  mb-2">{profile.school.name}</h4>
                        <div className="flex items-center text-gray-800 mb-3">
                          <FiGlobe className="h-4 w-4  mr-2" />
                          <span className="text-sm">{profile.school.domain}</span>
                        </div>
                      </div>
                      <span className="text-sm ">Connected</span>
                    </div>
                    <div className=" text-sm mb-4">School Campus View (Not Available)</div>
                    {/* <p className="text-sm text-gray-800 flex items-center">
                      <FiMapPin className="h-4 w-4  mr-1" />
                      {profile.school.location && typeof profile.school.location === 'object'
                        ? JSON.stringify(profile.school.location)
                        : profile.school.location}
                    </p> */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 w-full py-2  hover:bg-gray-100 transition duration-200"
                    >
                      View School Details
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-bold  mb-2">No School Connected</h4>
                    <p className=" mb-4">You haven&apos;t been associated with a school yet</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 py-2   hover:bg-gray-800 transition duration-200"
                    >
                      Connect School
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {profile && (
            <EditProfileModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              profile={{
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                gender: profile.gender,
              }}
              onUpdate={handleProfileUpdate}
            />
          )}

          {/* Change Password Modal */}
          <ChangePasswordModal
            isOpen={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Reusable InfoItem component
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div>{icon}</div>
      <div>
        <p className="text-sm ">{label}</p>
        <p className="text-base  truncate" title={value}>{value}</p>
      </div>
    </div>
  );
}