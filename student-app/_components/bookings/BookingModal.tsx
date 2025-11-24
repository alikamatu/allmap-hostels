'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaSync, FaSpinner, FaCreditCard, FaLock, FaWallet } from 'react-icons/fa';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { BookingType, Room, BookingFormData, BookingFormErrors } from '@/types/booking';
import { bookingService } from '@/service/bookingService';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { RoomType } from '@/types/hostels';
import { DepositModal } from '../payment/DepositModal';
import { useDepositBalance } from '@/hooks/useDepositBalance';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: RoomType;
  hostel: {
    id: string;
    name: string;
    address: string;
  };
}

export function BookingModal({ isOpen, onClose, roomType, hostel }: BookingModalProps) {
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const [formData, setFormData] = useState<BookingFormData>({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    checkInDate: '',
    checkOutDate: '',
    bookingType: BookingType.SEMESTER,
    specialRequests: '',
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [depositBalance, setDepositBalance] = useState<number>(0);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);
  const router = useRouter();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { refreshBalance } = useDepositBalance();
  
  // Ref for the interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDepositSuccess = () => {
    refreshBalance();
  };

  const BOOKING_FEE = 70;

  // Auto-populate form with user profile data
  useEffect(() => {
    if (profile && !hasAutoFilled && isOpen) {
      setFormData(prev => ({
        ...prev,
        studentName: profile.name || prev.studentName,
        studentEmail: profile.email || prev.studentEmail,
        studentPhone: profile.phone || prev.studentPhone,
        emergency_contact_name: profile.emergency_contact_name || prev.emergency_contact_name,
        emergency_contact_relationship: profile.emergency_contact_relationship || prev.emergency_contact_relationship,
        emergency_contact_phone: profile.emergency_contact_phone || prev.emergency_contact_phone,
        emergency_contact_email: profile.emergency_contact_email || prev.emergency_contact_email,
      }));
      setHasAutoFilled(true);
    }
  }, [profile, hasAutoFilled, isOpen]);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      setFormData(prev => ({
        ...prev,
        studentName: profile?.name || '',
        studentEmail: profile?.email || '',
        studentPhone: profile?.phone || '',
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: nextMonth.toISOString().split('T')[0],
        bookingType: BookingType.SEMESTER,
        specialRequests: '',
        emergencyContacts: [{ name: '', relationship: '', phone: '' }],
      }));
      setErrors({});
      setSelectedRoomId('');
      setAvailableRooms([]);
      setBookingError(null);
      setHasAutoFilled(true);
      setAutoCheckEnabled(true);

      // Load initial data
      loadInitialData();
    } else {
      // Clean up when modal closes
      setAutoCheckEnabled(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen, profile]);

  // Calculate price when dates or booking type changes
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      calculatePrice();
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.bookingType]);

  // Auto-check availability every 3 seconds when enabled
  useEffect(() => {
    if (autoCheckEnabled && formData.checkInDate && formData.checkOutDate && !errors.checkInDate && !errors.checkOutDate) {
      // Check immediately first
      checkAvailability();
      
      // Then set up interval for every 3 seconds
      intervalRef.current = setInterval(() => {
        checkAvailability();
      }, 3000);

      // Clean up interval on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear interval if conditions aren't met
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [autoCheckEnabled, formData.checkInDate, formData.checkOutDate, errors.checkInDate, errors.checkOutDate]);

  const loadInitialData = useCallback(async () => {
    if (!profile) return;

    try {
      // Load deposit balance
      const balanceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000'}/deposits/balance`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
          },
        }
      );

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setDepositBalance(balanceData.availableBalance || 0);
      }
    } catch (error) {
      console.error('Failed to load deposit balance:', error);
    }
  }, [profile]);

  const calculatePrice = useCallback(() => {
    if (!formData.checkInDate || !formData.checkOutDate) return;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    const amount = bookingService.calculateBookingPrice(
      roomType.pricePerSemester,
      roomType.pricePerMonth,
      roomType.pricePerWeek,
      formData.bookingType,
      checkIn,
      checkOut
    );
    setTotalAmount(amount);
  }, [formData.checkInDate, formData.checkOutDate, formData.bookingType, roomType]);

  const validateForm = useCallback((): boolean => {
    const newErrors: BookingFormErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Name is required';
    }

    if (!formData.studentEmail.trim()) {
      newErrors.studentEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.studentEmail)) {
      newErrors.studentEmail = 'Email format is invalid';
    }

    if (!formData.studentPhone.trim()) {
      newErrors.studentPhone = 'Phone number is required';
    }

    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }

    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const validationError = bookingService.validateBookingDates(checkIn, checkOut);
      if (validationError) {
        newErrors.checkInDate = validationError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const checkAvailability = useCallback(async () => {
    if (!formData.checkInDate || !formData.checkOutDate) return;

    setCheckingAvailability(true);
    setBookingError(null);
    try {
      console.log('🔍 Auto-checking availability for dates:', formData.checkInDate, formData.checkOutDate);

      const availability = await bookingService.checkRoomAvailability(
        hostel.id,
        formData.checkInDate,
        formData.checkOutDate,
        roomType.id
      );

      console.log('✅ Auto-check availability response:', availability);

      const apiRooms = availability.rooms || [];
      console.log('📦 Auto-check API rooms:', apiRooms);

      const roomsOfType = apiRooms
        .filter((room: any) => room.roomType.id === roomType.id)
        .map((apiRoom: any) => {
          const convertedRoom: Room = {
            id: apiRoom.id,
            hostelId: apiRoom.hostelId || hostel.id,
            roomTypeId: apiRoom.roomType.id,
            roomNumber: apiRoom.roomNumber,
            floor: apiRoom.floor,
            status: apiRoom.status,
            currentOccupancy: apiRoom.currentOccupancy,
            maxOccupancy: apiRoom.maxOccupancy,
            notes: apiRoom.notes,
            createdAt: apiRoom.createdAt || new Date().toISOString(),
            updatedAt: apiRoom.updatedAt || new Date().toISOString(),
            roomType: {
              id: apiRoom.roomType.id,
              hostelId: apiRoom.roomType.hostelId || hostel.id,
              name: apiRoom.roomType.name,
              description: apiRoom.roomType.description,
              pricePerSemester: apiRoom.roomType.pricePerSemester,
              pricePerMonth: apiRoom.roomType.pricePerMonth,
              pricePerWeek: apiRoom.roomType.pricePerWeek,
              capacity: apiRoom.roomType.capacity,
              amenities: apiRoom.roomType.amenities || [],
              allowedGenders: apiRoom.roomType.allowedGenders,
              totalRooms: apiRoom.roomType.totalRooms || 0,
              availableRooms: apiRoom.roomType.availableRooms || 0,
              createdAt: apiRoom.roomType.createdAt || new Date().toISOString(),
              updatedAt: apiRoom.roomType.updatedAt || new Date().toISOString(),
            }
          };
          return convertedRoom;
        });

      console.log('✨ Auto-check filtered rooms:', roomsOfType);
      setAvailableRooms(roomsOfType);

      if (roomsOfType.length === 0) {
        setBookingError('No rooms available for selected dates');
      }
    } catch (error: any) {
      console.error('❌ Auto-check failed:', error);
      // Don't set booking error for auto-check failures to avoid annoying users
      // setBookingError(`Auto-check failed: ${error.message}`);
    } finally {
      setCheckingAvailability(false);
    }
  }, [formData.checkInDate, formData.checkOutDate, hostel.id, roomType.id]);

  const handleInputChange = useCallback((field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Re-enable auto-check when dates change (if they're valid)
    if ((field === 'checkInDate' || field === 'checkOutDate') && value) {
      setAutoCheckEnabled(true);
    }
  }, []);

  const handleCheckAvailability = useCallback(async () => {
    if (validateForm()) {
      // Force a manual check and ensure auto-check continues
      setAutoCheckEnabled(true);
      await checkAvailability();
    }
  }, [validateForm, checkAvailability]);

  const handleConfirmBooking = useCallback(async () => {
    if (!profile || !selectedRoomId || !formData.checkInDate || !formData.checkOutDate) {
      setBookingError('Please select all required fields');
      return;
    }

    if (depositBalance < BOOKING_FEE) {
      setBookingError(`Insufficient deposit balance. You need GHS ${BOOKING_FEE}`);
      return;
    }

    setLoading(true);
    setBookingError(null);

    try {
      const bookingData = {
        hostelId: hostel.id,
        roomId: selectedRoomId,
        studentId: profile.id,
        studentName: formData.studentName,
        studentEmail: formData.studentEmail,
        studentPhone: formData.studentPhone,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        bookingType: formData.bookingType,
        specialRequests: formData.specialRequests,
        paymentReference: `deposit_booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingFeeAmount: BOOKING_FEE,
        depositAmount: 0,
      };

      console.log('📝 Creating booking with data:', bookingData);

      const booking = await bookingService.createBookingWithDeposit(bookingData);

      console.log('✅ Booking created:', booking);

      // Stop auto-checking after successful booking
      setAutoCheckEnabled(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      onClose();
      alert(
        `Booking confirmed! Booking ID: ${booking.id}\nGHS ${BOOKING_FEE} deducted from your deposit.\nRemaining balance: GHS ${totalAmount}`
      );
      
      setTimeout(() => {
        router.push('/dashboard/bookings');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Booking failed:', error);
      setBookingError(`Booking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [profile, selectedRoomId, formData, hostel.id, depositBalance, totalAmount, onClose]);

  const canBook = selectedRoomId && depositBalance >= BOOKING_FEE && availableRooms.length > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 font-sans"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto "
        >
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black">Book {roomType.name}</h2>
                <p className="text-gray-800">{hostel.name}</p>
                {profile && !profileLoading && (
                  <div className="flex items-center mt-2">
                    <p className="text-sm text-black">✓ Booking as {profile.name}</p>
                    {autoCheckEnabled && (
                      <div className="flex items-center ml-4 text-green-600 text-sm">
                        <FaSync className="animate-spin mr-1" />
                        <span>Auto-checking every 3s</span>
                      </div>
                    )}
                  </div>
                )}
                {profileError && (
                  <div className="flex items-center mt-2 text-black">
                    <FiAlertTriangle className="mr-2" />
                    <p className="text-sm">Profile error: {profileError}</p>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={onClose}
                className="text-black"
                aria-label="Close booking modal"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {bookingError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-100 text-red-900 border border-red-400  flex items-center"
              >
                <FiAlertTriangle className="mr-2 flex-shrink-0" />
                <p className="text-sm">{bookingError}</p>
              </motion.div>
            )}

            {/* Deposit Status */}
            <div
              className={`p-4  border ${
                depositBalance >= BOOKING_FEE
                  ? 'bg-green-50 border-green-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaWallet
                    className={`mr-3 text-lg ${
                      depositBalance >= BOOKING_FEE ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        depositBalance >= BOOKING_FEE ? 'text-green-900' : 'text-yellow-900'
                      }`}
                    >
                      {depositBalance >= BOOKING_FEE ? 'Sufficient Deposit' : 'Insufficient Deposit'}
                    </p>
                    <p
                      className={`text-sm ${
                        depositBalance >= BOOKING_FEE ? 'text-green-800' : 'text-yellow-800'
                      }`}
                    >
                      Available: {bookingService.formatPrice(depositBalance)} • Required:{' '}
                      {bookingService.formatPrice(BOOKING_FEE)}
                      {depositBalance < BOOKING_FEE && (
                        <span className="block mt-1">
                          Need additional: {bookingService.formatPrice(BOOKING_FEE - depositBalance)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {depositBalance < BOOKING_FEE && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowDepositModal(true)}
                    className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800  text-sm whitespace-nowrap"
                  >
                    Add Funds
                  </motion.button>
                )}
              </div>
            </div>

            {/* Booking Details Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-black">Booking Details</h3>

              {/* Check-in and Check-out Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:border-black outline-none bg-white text-black"
                  />
                  {errors.checkInDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.checkInDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    min={formData.checkInDate}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:border-black outline-none bg-white text-black"
                  />
                  {errors.checkOutDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.checkOutDate}</p>
                  )}
                </div>
              </div>

              {/* Booking Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Booking Type *</label>
                <select
                  value={formData.bookingType}
                  onChange={(e) => handleInputChange('bookingType', e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-300 focus:border-black outline-none bg-white text-black"
                >
                  <option value={BookingType.SEMESTER}>Semester</option>
                  <option value={BookingType.MONTHLY}>Monthly</option>
                  <option value={BookingType.WEEKLY}>Weekly</option>
                </select>
              </div>

              {/* Check Availability Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleCheckAvailability}
                disabled={checkingAvailability || !formData.checkInDate || !formData.checkOutDate}
                className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50  flex items-center justify-center"
              >
                {checkingAvailability ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Checking Availability...
                  </>
                ) : (
                  'Check Room Availability'
                )}
              </motion.button>
            </div>

            <DepositModal 
              isOpen={showDepositModal}
              onClose={() => setShowDepositModal(false)}
              onDepositSuccess={handleDepositSuccess}
            />

            {/* Available Rooms */}
            {availableRooms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-black">
                  Select Your Room ({availableRooms.length} available)
                  {autoCheckEnabled && (
                    <span className="ml-2 text-sm font-normal text-green-600 flex items-center">
                      <FaSync className="animate-spin mr-1" />
                      Live updates
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map(room => (
                    <motion.div
                      key={room.id}
                      className={`p-4 border  cursor-pointer transition-colors ${
                        selectedRoomId === room.id
                          ? 'bg-black/5 border-black'
                          : 'hover:bg-gray-50 border-gray-300'
                      }`}
                      onClick={() => setSelectedRoomId(room.id)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-black">Room {room.roomNumber}</h4>
                          <p className="text-gray-800 text-sm">Floor {room.floor}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full ${
                            selectedRoomId === room.id ? 'bg-black' : 'border border-gray-300'
                          }`}
                        />
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">Status:</span>
                          <span className="font-medium text-green-600">Available</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">Gender:</span>
                          <span className="font-medium text-black">
                            {roomType.allowedGenders?.join(', ') || 'Mixed'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">Capacity:</span>
                          <span className="font-medium text-black">
                            {room.currentOccupancy}/{room.maxOccupancy}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {!selectedRoomId && (
                  <p className="text-center text-gray-600 text-sm">Please select a room to continue</p>
                )}
              </div>
            )}

            {availableRooms.length === 0 && !checkingAvailability && formData.checkInDate && (
              <div className="text-center py-8 border border-gray-300 ">
                <FiAlertTriangle className="text-black text-3xl mx-auto mb-4" />
                <p className="text-black font-medium">No rooms available</p>
                <p className="text-gray-800 text-sm mt-2">
                  No rooms of this type are available for your selected dates. Try adjusting your dates.
                  {autoCheckEnabled && (
                    <span className="block mt-1 text-green-600">
                      <FaSync className="animate-spin inline mr-1" />
                      Auto-checking for availability...
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="p-4 bg-gray-50  border border-gray-200">
              <h3 className="font-medium text-black mb-3">Pricing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-800">Room Type</span>
                  <span className="font-medium text-black">{roomType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">Booking Type</span>
                  <span className="font-medium text-black capitalize">{formData.bookingType}</span>
                </div>
                {formData.checkInDate && formData.checkOutDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-800">Duration</span>
                    <span className="font-medium text-black">
                      {bookingService.getDurationInDays(
                        new Date(formData.checkInDate),
                        new Date(formData.checkOutDate)
                      )}{' '}
                      days
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-800">Room Price</span>
                  <span className="font-medium text-black">{bookingService.formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-orange-600 border-t border-gray-300 pt-2 mt-2">
                  <span className="font-medium">Booking Fee (From Deposit)</span>
                  <span className="font-bold">{bookingService.formatPrice(BOOKING_FEE)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t border-gray-200">
            <div className="flex justify-between items-center gap-4">
              <div className="text-sm">
                {selectedRoomId && availableRooms.length > 0 ? (
                  <div className="flex items-center text-green-600">
                    <FiCheck className="mr-2" />
                    <span>
                      Room {availableRooms.find(r => r.id === selectedRoomId)?.roomNumber} selected
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-600">Select a room to continue</span>
                )}
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 bg-white text-black border border-gray-300 hover:bg-gray-100 disabled:opacity-50 "
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleConfirmBooking}
                  disabled={!canBook || loading}
                  className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center "
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Confirm Booking
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}