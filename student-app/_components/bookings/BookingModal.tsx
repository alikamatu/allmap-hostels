'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaSync, FaSpinner, FaCreditCard, FaLock } from 'react-icons/fa';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { BookingType, Room, BookingFormData, BookingFormErrors, ApiRoom, apiRoomToRoom } from '@/types/booking';
import { bookingService } from '@/service/bookingService';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { RoomType } from '@/types/hostels';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

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
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useUserProfile();
  const [formData, setFormData] = useState<BookingFormData>({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    checkInDate: '',
    checkOutDate: '',
    bookingType: BookingType.SEMESTER,
    specialRequests: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }],
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [step, setStep] = useState<'details' | 'room-selection' | 'payment' | 'confirmation'>('details');
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const router = useRouter();

  // Fixed booking fee
  const BOOKING_FEE = 70; // 70 GHS

  // Auto-populate form with user profile data
  useEffect(() => {
    if (profile && !hasAutoFilled && isOpen) {
      setFormData(prev => ({
        ...prev,
        studentName: profile.name || prev.studentName,
        studentEmail: profile.email || prev.studentEmail,
        studentPhone: profile.phone || prev.studentPhone,
      }));
      setHasAutoFilled(true);
    }
  }, [profile, hasAutoFilled, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      setFormData({
        studentName: profile?.name || '',
        studentEmail: profile?.email || '',
        studentPhone: profile?.phone || '',
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: nextMonth.toISOString().split('T')[0],
        bookingType: BookingType.SEMESTER,
        specialRequests: '',
        emergencyContacts: [{ name: '', relationship: '', phone: '' }],
      });
      setErrors({});
      setStep('details');
      setSelectedRoomId('');
      setAvailableRooms([]);
      setBookingError(null);
      setPaymentCompleted(false);
      setPaymentReference('');
    }
  }, [isOpen, profile]);

  // Load Paystack script
  useEffect(() => {
    if (isOpen && !window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate total amount
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
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
    }
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

    // Validate emergency contacts
    const validContacts = formData.emergencyContacts?.filter(
      contact => contact.name.trim() && contact.relationship.trim() && contact.phone.trim()
    );
    if (!validContacts || validContacts.length === 0) {
      newErrors.emergencyContacts = 'At least one valid emergency contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const checkAvailability = useCallback(async () => {
    if (!formData.checkInDate || !formData.checkOutDate) return;

    setCheckingAvailability(true);
    setBookingError(null);
    try {
      const availability = await bookingService.checkRoomAvailability(
        hostel.id,
        formData.checkInDate,
        formData.checkOutDate,
        roomType.id
      );

      console.log('Availability response:', availability);
      
      const apiRooms = availability.rooms || [];
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

      setAvailableRooms(roomsOfType);

      if (roomsOfType.length === 0) {
        setErrors({ checkInDate: 'No rooms available for selected dates' });
      }
    } catch (error: any) {
      console.error('Failed to check availability:', error);
      setErrors({ checkInDate: 'Failed to check availability. Please try again.' });
    } finally {
      setCheckingAvailability(false);
    }
  }, [formData.checkInDate, formData.checkOutDate, hostel.id, roomType.id]);

  const handleInputChange = useCallback((field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, emergencyContacts: undefined }));
  }, []);

  const handleEmergencyContactChange = useCallback(
    (index: number, field: keyof typeof formData | 'name' | 'relationship' | 'phone', value: string) => {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts?.map((contact, i) =>
          i === index ? { ...contact, [field]: value } : contact
        ) || [],
      }));
      setErrors(prev => ({ ...prev, emergencyContacts: undefined }));
    },
    []
  );

  const addEmergencyContact = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts || []), { name: '', relationship: '', phone: '' }],
    }));
  }, []);

  const removeEmergencyContact = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const handleRefreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      await refetchProfile();
      if (profile) {
        setFormData(prev => ({
          ...prev,
          studentName: profile.name || prev.studentName,
          studentEmail: profile.email || prev.studentEmail,
          studentPhone: profile.phone || prev.studentPhone,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setLoading(false);
    }
  }, [refetchProfile, profile]);

  const handlePayment = useCallback(() => {
    if (!window.PaystackPop) {
      setBookingError('Payment system not loaded. Please refresh and try again.');
      return;
    }

    setProcessingPayment(true);
    setBookingError(null);

    const reference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_paystack_public_key', // Replace with your Paystack public key
      email: formData.studentEmail,
      amount: BOOKING_FEE * 100, // Amount in kobo (70 GHS = 7000 kobo)
      currency: 'GHS',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Booking Type',
            variable_name: 'booking_type',
            value: formData.bookingType
          },
          {
            display_name: 'Room Type',
            variable_name: 'room_type',
            value: roomType.name
          },
          {
            display_name: 'Hostel',
            variable_name: 'hostel',
            value: hostel.name
          },
          {
            display_name: 'Student Name',
            variable_name: 'student_name',
            value: formData.studentName
          }
        ]
      },
      callback: function(response: any) {
        console.log('Payment successful:', response);
        setPaymentReference(response.reference);
        setPaymentCompleted(true);
        setProcessingPayment(false);
        setStep('confirmation');
      },
      onClose: function() {
        console.log('Payment window closed');
        setProcessingPayment(false);
        setBookingError('Payment was cancelled. Please try again to complete your booking.');
      }
    });

    handler.openIframe();
  }, [formData, roomType.name, hostel.name]);

  const handleNextStep = useCallback(async () => {
    if (step === 'details') {
      if (validateForm()) {
        await checkAvailability();
        if (availableRooms.length > 0 && !errors.checkInDate) {
          setStep('room-selection');
        }
      }
    } else if (step === 'room-selection') {
      if (selectedRoomId) {
        setStep('payment');
      }
    }
  }, [step, validateForm, checkAvailability, availableRooms.length, errors.checkInDate, selectedRoomId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedRoomId || !profile || !paymentCompleted || !paymentReference) return;

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
        emergencyContacts: formData.emergencyContacts?.filter(
          contact => contact.name.trim() && contact.relationship.trim() && contact.phone.trim()
        ),
        paymentReference: paymentReference,
        bookingFeeAmount: BOOKING_FEE,
        depositAmount: 0,
      };
      
      const booking = await bookingService.createBooking(bookingData);
      onClose();
      alert(`Booking created successfully! Booking ID: ${booking.id}\nPayment Reference: ${paymentReference}`);
      router.push(`/dashboard/bookings`);
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      setBookingError(`Failed to create booking: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId, hostel.id, formData, profile, onClose, paymentCompleted, paymentReference]);

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
          className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-black">Book {roomType.name}</h2>
                <p className="text-gray-800">{hostel.name}</p>
                {profile && !profileLoading && (
                  <div className="flex items-center mt-2">
                    <p className="text-sm text-black">✓ Auto-filled with your profile</p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={handleRefreshProfile}
                      className="ml-2 text-black"
                      title="Refresh profile data"
                      aria-label="Refresh profile data"
                    >
                      <FaSync className="text-xs" />
                    </motion.button>
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
            <hr className="border-t border-gray-200 mt-4" />
            {/* Progress indicator */}
            <div className="flex items-center mt-4 space-x-2">
              {['details', 'room-selection', 'payment', 'confirmation'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === stepName
                        ? 'bg-black text-white'
                        : index < ['details', 'room-selection', 'payment', 'confirmation'].indexOf(step)
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {stepName === 'payment' && paymentCompleted ? (
                      <FiCheck className="text-sm" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        index < ['details', 'room-selection', 'payment', 'confirmation'].indexOf(step) ? 'bg-black' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {bookingError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-4 bg-red-100 text-red-900 border border-red-400 rounded-lg flex items-center"
              >
                <FiAlertTriangle className="text-red-900 mr-2" />
                <p className="text-sm">{bookingError}</p>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Profile Status */}
                {profileLoading && (
                  <div className="flex items-center p-4">
                    <FaSpinner className="animate-spin text-black mr-3" />
                    <p className="text-gray-800 text-sm">Loading your profile information...</p>
                  </div>
                )}

                {!profile && !profileLoading && (
                  <div className="flex items-center p-4">
                    <FiAlertTriangle className="text-black mr-3" />
                    <div>
                      <p className="text-black font-medium text-sm">Profile not available</p>
                      <p className="text-gray-800 text-sm">Please fill in your details manually or check your connection.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => handleInputChange('studentName', e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                      aria-label="Enter your full name"
                    />
                    {errors.studentName && <p className="text-red-600 text-sm mt-1">{errors.studentName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.studentEmail}
                      onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                      aria-label="Enter your email address"
                    />
                    {errors.studentEmail && <p className="text-red-600 text-sm mt-1">{errors.studentEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.studentPhone}
                      onChange={(e) => handleInputChange('studentPhone', e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                      aria-label="Enter your phone number"
                    />
                    {errors.studentPhone && <p className="text-red-600 text-sm mt-1">{errors.studentPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      <FaCalendarAlt className="inline mr-2" />
                      Booking Type *
                    </label>
                    <select
                      value={formData.bookingType}
                      onChange={(e) => handleInputChange('bookingType', e.target.value)}
                      className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                      aria-label="Select booking type"
                    >
                      <option value={BookingType.SEMESTER}>Semester</option>
                      <option value={BookingType.MONTHLY}>Monthly</option>
                      <option value={BookingType.WEEKLY}>Weekly</option>
                    </select>
                  </div>

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
                      className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                      aria-label="Select check-in date"
                    />
                    {errors.checkInDate && <p className="text-red-600 text-sm mt-1">{errors.checkInDate}</p>}
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
                      className="w-full px-3 py-2 border-b text-gray-900 border-gray-200 focus:border-black outline-none bg-white text-sm"
                      aria-label="Select check-out date"
                      required
                    />
                    {errors.checkOutDate && <p className="text-red-600 text-sm mt-1">{errors.checkOutDate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Special Requests</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-gray-900 text-sm"
                    rows={3}
                    placeholder="Any special requirements or requests..."
                    aria-label="Enter special requests"
                  />
                </div>

                {/* Emergency Contacts */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Emergency Contacts *</label>
                  {formData.emergencyContacts?.map((contact, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-black">Contact {index + 1}</h4>
                        {formData.emergencyContacts!.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => removeEmergencyContact(index)}
                            className="text-red-600"  
                            aria-label={`Remove emergency contact ${index + 1}`}
                          >
                            <FaTimes />
                          </motion.button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-800">
                        <input
                          type="text"
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                          className="px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                          aria-label={`Enter name for emergency contact ${index + 1}`}
                        />
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={contact.relationship}
                          onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                          className="px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                          aria-label={`Enter relationship for emergency contact ${index + 1}`}
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={contact.phone}
                          onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                          className="px-3 py-2 border-b border-gray-200 focus:border-black outline-none bg-white text-sm text-gray-800"
                          aria-label={`Enter phone number for emergency contact ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                  {errors.emergencyContacts && (
                    <p className="text-red-600 text-sm mt-1">{errors.emergencyContacts}</p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={addEmergencyContact}
                    className="text-black hover:underline text-sm font-medium"
                    aria-label="Add another emergency contact"
                  >
                    + Add Another Emergency Contact
                  </motion.button>
                </div>

                {/* Pricing Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-black mb-2">Pricing Summary</h3>
                  <hr className="border-t border-gray-200 mb-4" />
                  <div className="space-y-2">
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
                          {bookingService.getDurationInDays(new Date(formData.checkInDate), new Date(formData.checkOutDate))} days
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-800">Room Price</span>
                      <span className="font-medium text-black">{bookingService.formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span className="font-medium">Booking Fee (Pay Now)</span>
                      <span className="font-bold">{bookingService.formatPrice(BOOKING_FEE)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between font-bold text-black">
                        <span>Total Room Cost</span>
                        <span>{bookingService.formatPrice(totalAmount)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">*Room payment due on check-in</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'room-selection' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h3 className="text-lg font-bold text-black">Select Your Room</h3>
                <p className="text-gray-800">
                  {availableRooms.length} room(s) available for your selected dates
                </p>

                {checkingAvailability ? (
                  <div className="text-center py-8">
                    <FaSpinner className="animate-spin text-black h-8 w-8 mx-auto mb-4" />
                    <p className="text-gray-800">Checking availability...</p>
                  </div>
                ) : availableRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <FiAlertTriangle className="text-black text-3xl mx-auto mb-4" />
                    <p className="text-black font-medium mb-2">No rooms available</p>
                    <p className="text-gray-800 mb-4">Sorry, no rooms of this type are available for your selected dates.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setStep('details')}
                      className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800"
                      aria-label="Adjust booking dates"
                    >
                      Adjust Dates
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRooms.map((room) => (
                      <motion.div
                        key={room.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoomId === room.id ? 'bg-black/5 border-black' : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => setSelectedRoomId(room.id)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-black">Room {room.roomNumber}</h4>
                            <p className="text-gray-800 text-sm">Floor {room.floor}</p>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-2 ${
                                selectedRoomId === room.id ? 'bg-black' : 'border border-gray-200'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-800">Status:</span>
                            <span className="font-medium text-green-600">Available</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-800">Gender:</span>
                            <span className="font-medium text-black">
                              {roomType.allowedGenders?.join(', ') || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-800">Capacity:</span>
                            <span className="font-medium text-black">
                              {room.currentOccupancy}/{room.maxOccupancy}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {availableRooms.length > 0 && !selectedRoomId && (
                  <div className="text-center text-black mt-4">Please select a room to continue</div>
                )}
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center">
                  <FaCreditCard className="text-4xl text-black mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-black">Secure Payment</h3>
                  <p className="text-gray-800">Complete your booking with a secure payment</p>
                </div>

                {/* Payment Details */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-black mb-4">Payment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-800">Booking Fee</span>
                      <span className="font-medium text-black">{bookingService.formatPrice(BOOKING_FEE)}</span>
                    </div>
                    <hr className="border-t border-gray-200" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-black">Amount to Pay Now</span>
                      <span className="text-orange-600">{bookingService.formatPrice(BOOKING_FEE)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <FaLock className="inline mr-2" />
                      This booking fee secures your room. The remaining balance of {bookingService.formatPrice(totalAmount)} will be due on check-in.
                    </p>
                  </div>
                </div>

                {/* Selected Room Details */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-bold text-black mb-2">Selected Room</h4>
                  {selectedRoomId && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-800">Room Number:</span>
                        <span className="font-medium text-black">
                          {availableRooms.find(r => r.id === selectedRoomId)?.roomNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Floor:</span>
                        <span className="font-medium text-black">
                          {availableRooms.find(r => r.id === selectedRoomId)?.floor || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Duration:</span>
                        <span className="font-medium text-black">
                          {bookingService.getDurationInDays(new Date(formData.checkInDate), new Date(formData.checkOutDate))} days
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {paymentCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FiCheck className="text-green-600 text-xl mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Payment Successful!</p>
                        <p className="text-green-700 text-sm">Reference: {paymentReference}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!paymentCompleted && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className="w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
                    aria-label="Pay booking fee with Paystack"
                  >
                    {processingPayment ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="mr-2" />
                        Pay {bookingService.formatPrice(BOOKING_FEE)} with Paystack
                      </>
                    )}
                  </motion.button>
                )}

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <FaLock className="text-sm" />
                    <span className="text-sm">Secured by Paystack</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'confirmation' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="text-center">
                  <FiCheck className="text-4xl text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-black">Ready to Confirm</h3>
                  <p className="text-gray-800">Review your booking details and confirm</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-black mb-3">Booking Summary</h4>
                  <hr className="border-t border-gray-200 mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-800">Hostel:</span>
                      <span className="font-medium text-black">{hostel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Room Type:</span>
                      <span className="font-medium text-black">{roomType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Room Number:</span>
                      <span className="font-medium text-black">
                        {availableRooms.find(r => r.id === selectedRoomId)?.roomNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Check-in:</span>
                      <span className="font-medium text-black">
                        {new Date(formData.checkInDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Check-out:</span>
                      <span className="font-medium text-black">
                        {new Date(formData.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Duration:</span>
                      <span className="font-medium text-black">
                        {bookingService.getDurationInDays(new Date(formData.checkInDate), new Date(formData.checkOutDate))} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Confirmation */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FiCheck className="text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Payment Completed</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Booking Fee Paid:</span>
                      <span className="font-medium text-green-800">{bookingService.formatPrice(BOOKING_FEE)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Payment Reference:</span>
                      <span className="font-mono text-green-800 text-xs">{paymentReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Remaining Balance:</span>
                      <span className="font-medium text-green-800">{bookingService.formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-black mb-3">Personal Information</h4>
                  <hr className="border-t border-gray-200 mb-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-800">Name:</span>
                      <span className="font-medium text-black">{formData.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Email:</span>
                      <span className="font-medium text-black">{formData.studentEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800">Phone:</span>
                      <span className="font-medium text-black">{formData.studentPhone}</span>
                    </div>
                  </div>
                </div>

                {formData.specialRequests && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-black mb-3">Special Requests</h4>
                    <hr className="border-t border-gray-200 mb-4" />
                    <p className="text-gray-800">{formData.specialRequests}</p>
                  </div>
                )}

                {formData.emergencyContacts && formData.emergencyContacts.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-black mb-3">Emergency Contacts</h4>
                    <hr className="border-t border-gray-200 mb-4" />
                    <div className="space-y-3">
                      {formData.emergencyContacts.map((contact, index) => (
                        <div key={index}>
                          <p className="font-medium text-black">{contact.name}</p>
                          <p className="text-gray-800">
                            {contact.relationship} • {contact.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <FaExclamationTriangle className="inline mr-2" />
                    By confirming this booking, you agree to pay the remaining balance of {bookingService.formatPrice(totalAmount)} on check-in day.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="sticky bottom-0 bg-white p-4 sm:p-6">
              <hr className="border-t border-gray-200 mb-4" />
              <div className="flex justify-between">
                {step !== 'details' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      if (step === 'room-selection') setStep('details');
                      else if (step === 'payment') setStep('room-selection');
                      else if (step === 'confirmation') setStep('payment');
                    }}
                    disabled={loading}
                    className="px-6 py-2 bg-white text-black border border-gray-300 hover:bg-gray-100 disabled:opacity-50 rounded-lg"
                    aria-label="Go back to previous step"
                  >
                    Back
                  </motion.button>
                )}

                {step === 'details' && <div className="ml-auto"></div>}

                {step === 'details' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleNextStep}
                    disabled={loading || checkingAvailability}
                    className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center rounded-lg"
                    aria-label="Check room availability"
                  >
                    {checkingAvailability ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Checking Availability
                      </>
                    ) : (
                      'Check Availability'
                    )}
                  </motion.button>
                )}

                {step === 'room-selection' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleNextStep}
                    disabled={loading || !selectedRoomId}
                    className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 rounded-lg"
                    aria-label="Proceed to payment"
                  >
                    Proceed to Payment
                  </motion.button>
                )}

                {step === 'payment' && paymentCompleted && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setStep('confirmation')}
                    className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 rounded-lg ml-auto"
                    aria-label="Continue to confirmation"
                  >
                    Continue to Confirmation
                  </motion.button>
                )}

                {step === 'confirmation' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 flex items-center ml-auto rounded-lg"
                    aria-label="Confirm booking"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}