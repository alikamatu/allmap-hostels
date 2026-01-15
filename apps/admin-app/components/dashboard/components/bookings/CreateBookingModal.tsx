"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface PaystackResponse {
  reference: string;
  status?: string;
  message?: string;
  transaction?: string;
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

interface PaystackPop {
  setup: (options: PaystackOptions) => {
    openIframe: () => void;
  };
}

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

interface Hostel {
  id: string;
  name: string;
}

interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  maxOccupancy: number;
  currentOccupancy: number;
  roomType: RoomType;
}

interface RoomType {
  id: string;
  name: string;
  pricePerSemester: number;
  pricePerMonth: number;
  pricePerWeek?: number;
}

enum BookingType {
  SEMESTER = 'semester',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly'
}

enum PaymentStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed'
}

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostels: Hostel[];
  onSubmit: (result: unknown) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here';
const BOOKING_FEE = 70;

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const CreateBookingModal = ({
  isOpen,
  onClose,
  hostels,
  onSubmit,
}: CreateBookingModalProps) => {

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentId: generateUUID(), // Auto-generated UUID
    hostelId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    bookingType: BookingType.SEMESTER,
    specialRequests: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<Map<string, RoomType>>(new Map());
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      studentName: '',
      studentEmail: '',
      studentPhone: '',
      studentId: generateUUID(), // Generate new UUID on reset
      hostelId: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      bookingType: BookingType.SEMESTER,
      specialRequests: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: ''
    });
    setPaymentStatus(PaymentStatus.IDLE);
    setPaymentReference('');
    setError('');
    setValidationErrors({});
    setCalculatedAmount(0);
    setAvailableRooms([]);
    setRoomTypes(new Map());
  }, []);

  const fetchAvailableRooms = useCallback(async () => {
    setLoadingRooms(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/bookings/hostel/${formData.hostelId}/availability?` +
        `checkIn=${formData.checkInDate}&checkOut=${formData.checkOutDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableRooms(data.rooms || []);
      
      const typesMap = new Map<string, RoomType>();
      if (data.rooms) {
        data.rooms.forEach((room: Room) => {
          if (room.roomType) {
            typesMap.set(room.roomType.id, room.roomType);
          }
        });
      }
      setRoomTypes(typesMap);
    } catch (error: unknown) {
      setError(`Failed to fetch available rooms: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAvailableRooms([]);
      setRoomTypes(new Map());
    } finally {
      setLoadingRooms(false);
    }
  }, [formData.hostelId, formData.checkInDate, formData.checkOutDate]);

  const calculateBookingAmount = useCallback(() => {
    const room = availableRooms.find(r => r.id === formData.roomId);
    if (!room?.roomType) {
      setCalculatedAmount(0);
      return;
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    let amount = 0;
    switch (formData.bookingType) {
      case BookingType.SEMESTER:
        amount = room.roomType.pricePerSemester;
        break;
      case BookingType.MONTHLY:
        const months = Math.ceil(days / 30);
        amount = room.roomType.pricePerMonth * months;
        break;
      case BookingType.WEEKLY:
        const weeks = Math.ceil(days / 7);
        amount = room.roomType.pricePerWeek ? 
          room.roomType.pricePerWeek * weeks : 
          Math.ceil((room.roomType.pricePerMonth * weeks) / 4);
        break;
    }
    
    setCalculatedAmount(Math.max(0, amount));
  }, [availableRooms, formData.roomId, formData.bookingType, formData.checkInDate, formData.checkOutDate]);

  // Load Paystack script
  useEffect(() => {
    if (!paystackLoaded) {
      const existingScript = document.getElementById('paystack-script');
      if (existingScript) {
        setPaystackLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'paystack-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => setPaystackLoaded(true);
      script.onerror = () => setError('Failed to load payment processor. Please refresh the page.');
      document.head.appendChild(script);
    }
  }, [paystackLoaded]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Fetch available rooms
  useEffect(() => {
    if (formData.hostelId && formData.checkInDate && formData.checkOutDate) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setRoomTypes(new Map());
    }
  }, [fetchAvailableRooms, formData.hostelId, formData.checkInDate, formData.checkOutDate]);

  // Calculate booking amount
  useEffect(() => {
    if (formData.roomId && formData.bookingType && formData.checkInDate && formData.checkOutDate) {
      calculateBookingAmount();
    } else {
      setCalculatedAmount(0);
    }
  }, [calculateBookingAmount, formData.roomId, formData.bookingType, formData.checkInDate, formData.checkOutDate]);



  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentName.trim()) errors.studentName = 'Student name is required';
    if (!formData.studentEmail.trim()) errors.studentEmail = 'Student email is required';
    if (!formData.studentPhone.trim()) errors.studentPhone = 'Student phone is required';
    // studentId is auto-generated, no need to validate
    if (!formData.hostelId) errors.hostelId = 'Please select a hostel';
    if (!formData.roomId) errors.roomId = 'Please select a room';
    if (!formData.checkInDate) errors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) errors.checkOutDate = 'Check-out date is required';

    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        errors.checkInDate = 'Check-in date cannot be in the past';
      }

      if (checkOut <= checkIn) {
        errors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.studentEmail && !emailRegex.test(formData.studentEmail)) {
      errors.studentEmail = 'Please enter a valid email address';
    }

    if (formData.studentPhone && formData.studentPhone.length < 10) {
      errors.studentPhone = 'Please enter a valid phone number';
    }

    if (calculatedAmount <= 0) {
      errors.roomId = 'Unable to calculate room charges.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'hostelId' && value !== formData.hostelId) {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  };

  const initializePayment = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError('Payment system is still loading. Please wait and try again.');
      return;
    }

    setError('');
    setPaymentStatus(PaymentStatus.PROCESSING);

    const reference = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPaymentReference(reference);

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: formData.studentEmail,
        amount: BOOKING_FEE * 100,
        currency: 'GHS',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Student Name',
              variable_name: 'student_name',
              value: formData.studentName
            },
            {
              display_name: 'Student ID',
              variable_name: 'student_id',
              value: formData.studentId
            },
            {
              display_name: 'Hostel',
              variable_name: 'hostel',
              value: hostels.find(h => h.id === formData.hostelId)?.name || 'Unknown'
            }
          ]
        },
        callback: function(response: PaystackResponse) {
          handlePaymentSuccess(response.reference);
        },
        onClose: function() {
          if (paymentStatus === PaymentStatus.PROCESSING) {
            setPaymentStatus(PaymentStatus.IDLE);
            setError('Payment was cancelled. Please try again.');
          }
        }
      });

      handler.openIframe();
    } catch (error: unknown) {
      setPaymentStatus(PaymentStatus.FAILED);
      setError(`Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // In the handlePaymentSuccess function, update the bookingData object:

const handlePaymentSuccess = async (reference: string) => {
  try {
    setPaymentStatus(PaymentStatus.SUCCESS);
    
    const emergencyContacts = formData.emergencyContactName ? [{
      name: formData.emergencyContactName,
      phone: formData.emergencyContactPhone,
      relationship: formData.emergencyContactRelationship
    }] : [];

    // Add depositAmount as a number to the booking data
    const bookingData = {
      hostelId: formData.hostelId,
      roomId: formData.roomId,
      studentId: formData.studentId,
      studentName: formData.studentName,
      studentEmail: formData.studentEmail,
      studentPhone: formData.studentPhone,
      bookingType: formData.bookingType,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      paymentReference: reference,
      bookingFeeAmount: BOOKING_FEE,
      depositAmount: 0, // Add this line - set to 0 since it's not being used for admin booking
      // Optional fields - only include if they have values
      ...(formData.specialRequests && { specialRequests: formData.specialRequests }),
      ...(emergencyContacts.length > 0 && { emergencyContacts })
    };

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/bookings/admin-create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Booking failed: ${response.status}`);
    }

    const result = await response.json();
    await onSubmit(result.booking || result);
    
    setTimeout(() => {
      resetForm();
      onClose();
    }, 2000);
    
  } catch (error: unknown) {
    setError(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setPaymentStatus(PaymentStatus.FAILED);
  }
};



  const handleClose = () => {
    if (paymentStatus !== PaymentStatus.PROCESSING) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && paymentStatus !== PaymentStatus.PROCESSING) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50">
                  <User className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create New Booking</h3>
                  <p className="text-xs text-gray-500">Complete booking with payment</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                disabled={paymentStatus === PaymentStatus.PROCESSING}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Success Message */}
              {paymentStatus === PaymentStatus.SUCCESS && (
                <div className="bg-green-50 border border-green-200 p-3 flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Payment Successful!</p>
                    <p className="text-xs text-green-600">Reference: {paymentReference}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Booking Fee Notice */}
              <div className="bg-orange-50 border border-orange-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <h4 className="font-medium text-orange-900 text-sm">Booking Fee Required</h4>
                </div>
                <p className="text-xs text-orange-700">
                  A non-refundable booking fee of <span className="font-bold">GHS {BOOKING_FEE}</span> is required.
                  Room charges of <span className="font-bold">GHS {calculatedAmount.toFixed(2)}</span> will be paid separately.
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                      validationErrors.studentName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                    disabled={paymentStatus !== PaymentStatus.IDLE}
                  />
                  {validationErrors.studentName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.studentName}
                    </p>
                  )}
                </div>

                {/* Student Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                      validationErrors.studentEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email"
                    disabled={paymentStatus !== PaymentStatus.IDLE}
                  />
                  {validationErrors.studentEmail && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.studentEmail}
                    </p>
                  )}
                </div>

                {/* Student Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Phone *
                  </label>
                  <input
                    type="tel"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                      validationErrors.studentPhone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone"
                    disabled={paymentStatus !== PaymentStatus.IDLE}
                  />
                  {validationErrors.studentPhone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.studentPhone}
                    </p>
                  )}
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID (Auto-generated)
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled={true}
                    readOnly
                  />
                  <p className="mt-1 text-xs text-gray-500">This ID is automatically generated for the booking</p>
                </div>

                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`pl-9 w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                        validationErrors.checkInDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={paymentStatus !== PaymentStatus.IDLE}
                    />
                  </div>
                  {validationErrors.checkInDate && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.checkInDate}
                    </p>
                  )}
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                      className={`pl-9 w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                        validationErrors.checkOutDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={paymentStatus !== PaymentStatus.IDLE}
                    />
                  </div>
                  {validationErrors.checkOutDate && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.checkOutDate}
                    </p>
                  )}
                </div>

                {/* Hostel Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hostel *
                  </label>
                  <select
                    name="hostelId"
                    value={formData.hostelId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                      validationErrors.hostelId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!formData.checkInDate || !formData.checkOutDate || paymentStatus !== PaymentStatus.IDLE}
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map(hostel => (
                      <option key={hostel.id} value={hostel.id}>{hostel.name}</option>
                    ))}
                  </select>
                  {validationErrors.hostelId && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.hostelId}
                    </p>
                  )}
                </div>

                {/* Room Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room *
                  </label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${
                      validationErrors.roomId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!formData.hostelId || loadingRooms || paymentStatus !== PaymentStatus.IDLE}
                  >
                    <option value="">{loadingRooms ? 'Loading...' : 'Select Room'}</option>
                    {availableRooms.map(room => {
                      const roomType = roomTypes.get(room.roomTypeId);
                      const availableBeds = room.maxOccupancy - room.currentOccupancy;
                      return (
                        <option key={room.id} value={room.id}>
                          Room {room.roomNumber} - {roomType?.name || 'Standard'} ({availableBeds} bed{availableBeds !== 1 ? 's' : ''})
                        </option>
                      );
                    })}
                  </select>
                  {validationErrors.roomId && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.roomId}
                    </p>
                  )}
                </div>

                {/* Booking Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Type *
                  </label>
                  <select
                    name="bookingType"
                    value={formData.bookingType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    disabled={paymentStatus !== PaymentStatus.IDLE}
                  >
                    <option value={BookingType.SEMESTER}>Semester</option>
                    <option value={BookingType.MONTHLY}>Monthly</option>
                    <option value={BookingType.WEEKLY}>Weekly</option>
                  </select>
                </div>

                {/* Special Requests */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    placeholder="Any special requirements..."
                    disabled={paymentStatus !== PaymentStatus.IDLE}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="Contact Name"
                      className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      disabled={paymentStatus !== PaymentStatus.IDLE}
                    />
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      placeholder="Contact Phone"
                      className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      disabled={paymentStatus !== PaymentStatus.IDLE}
                    />
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleChange}
                      placeholder="Relationship"
                      className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-orange-500 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                      disabled={paymentStatus !== PaymentStatus.IDLE}
                    />
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              {calculatedAmount > 0 && (
                <div className="bg-gray-50 border border-gray-200 p-3">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">Cost Summary</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Fee (Due Now):</span>
                      <span className="font-medium">GHS {BOOKING_FEE.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Charges (Due Later):</span>
                      <span className="font-medium">GHS {calculatedAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-medium text-gray-900">Total Cost:</span>
                      <span className="font-bold text-gray-900">
                        GHS {(BOOKING_FEE + calculatedAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  disabled={paymentStatus === PaymentStatus.PROCESSING}
                >
                  Cancel
                </button>
                <button
                  onClick={initializePayment}
                  disabled={paymentStatus !== PaymentStatus.IDLE}
                  className="px-3 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent hover:bg-orange-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-150"
                >
                  {paymentStatus === PaymentStatus.PROCESSING ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : paymentStatus === PaymentStatus.SUCCESS ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete!
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay GHS {BOOKING_FEE} & Create Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateBookingModal;