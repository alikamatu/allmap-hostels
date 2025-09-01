"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, MapPin, Phone, Mail, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

// Declare PaystackPop on window for TypeScript
declare global {
  interface Window {
    PaystackPop: any;
  }
}

// Define types locally for the component
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
  onSubmit: (bookingData: any) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here';
const BOOKING_FEE = 70; // 70 GHS booking fee

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  hostels,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentId: '',
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
      script.onload = () => {
        console.log('Paystack script loaded');
        setPaystackLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        setError('Failed to load payment processor. Please refresh the page.');
      };
      document.head.appendChild(script);
    }
  }, [paystackLoaded]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Fetch available rooms when hostel is selected
  useEffect(() => {
    if (formData.hostelId && formData.checkInDate && formData.checkOutDate) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setRoomTypes(new Map());
    }
  }, [formData.hostelId, formData.checkInDate, formData.checkOutDate]);

  // Calculate booking amount when relevant fields change
  useEffect(() => {
    if (formData.roomId && formData.bookingType && formData.checkInDate && formData.checkOutDate) {
      calculateBookingAmount();
    } else {
      setCalculatedAmount(0);
    }
  }, [formData.roomId, formData.bookingType, formData.checkInDate, formData.checkOutDate]);

  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('Fetching rooms for hostel:', formData.hostelId);
      
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
        const errorText = await response.text();
        console.error('Room fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch rooms: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Rooms data:', data);
      
      setAvailableRooms(data.rooms || []);
      
      // Store room type information
      const typesMap = new Map<string, RoomType>();
      if (data.rooms) {
        data.rooms.forEach((room: any) => {
          if (room.roomType) {
            typesMap.set(room.roomType.id, room.roomType);
          }
        });
      }
      setRoomTypes(typesMap);
    } catch (error: any) {
      console.error('Failed to fetch available rooms:', error);
      setError(`Failed to fetch available rooms: ${error.message}`);
      setAvailableRooms([]);
      setRoomTypes(new Map());
    } finally {
      setLoadingRooms(false);
    }
  };

const calculateBookingAmount = () => {
    const room = availableRooms.find(r => r.id === formData.roomId);
    if (!room || !room.roomType) {
      setCalculatedAmount(0);
      return;
    }

    const roomType = room.roomType;
    if (!roomType) {
      setCalculatedAmount(0);
      return;
    }
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    let amount = 0;
    try {
      switch (formData.bookingType) {
        case BookingType.SEMESTER:
          amount = roomType.pricePerSemester;
          break;
        case BookingType.MONTHLY:
          const months = Math.ceil(days / 30);
          amount = roomType.pricePerMonth * months;
          break;
        case BookingType.WEEKLY:
          const weeks = Math.ceil(days / 7);
          amount = roomType.pricePerWeek ? 
            roomType.pricePerWeek * weeks : 
            Math.ceil((roomType.pricePerMonth * weeks) / 4);
          break;
        default:
          amount = 0;
      }
      
      setCalculatedAmount(Math.max(0, amount));
    } catch (error) {
      console.error('Error calculating booking amount:', error);
      setCalculatedAmount(0);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.studentName.trim()) errors.studentName = 'Student name is required';
    if (!formData.studentEmail.trim()) errors.studentEmail = 'Student email is required';
    if (!formData.studentPhone.trim()) errors.studentPhone = 'Student phone is required';
    if (!formData.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!formData.hostelId) errors.hostelId = 'Please select a hostel';
    if (!formData.roomId) errors.roomId = 'Please select a room';
    if (!formData.checkInDate) errors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) errors.checkOutDate = 'Check-out date is required';

    // Validate dates
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

      // Check minimum booking duration
      const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 1) {
        errors.checkOutDate = 'Minimum booking duration is 1 day';
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.studentEmail && !emailRegex.test(formData.studentEmail)) {
      errors.studentEmail = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    if (formData.studentPhone && formData.studentPhone.length < 10) {
      errors.studentPhone = 'Please enter a valid phone number';
    }

    // Check if calculated amount is valid
    if (calculatedAmount <= 0) {
      errors.roomId = 'Unable to calculate room charges. Please select a different room or dates.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear room selection if hostel changes
    if (name === 'hostelId' && value !== formData.hostelId) {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  };

  const initializePayment = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    if (!paystackLoaded) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'pk_test_your_key_here') {
      setError('Payment system is not properly configured. Please contact support.');
      return;
    }

    if (!window.PaystackPop) {
      setError('Payment system failed to load. Please refresh the page and try again.');
      return;
    }

    setError('');
    setPaymentStatus(PaymentStatus.PROCESSING);

    // Generate unique reference
    const reference = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPaymentReference(reference);

    console.log('Initializing payment with reference:', reference);

    try {
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: formData.studentEmail,
        amount: BOOKING_FEE * 100, // Convert to pesewas (kobo)
        currency: 'GHS',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Booking Type',
              variable_name: 'booking_type',
              value: 'Hostel Booking Fee'
            },
            {
              display_name: 'Student Name',
              variable_name: 'student_name',
              value: formData.studentName
            },
            {
              display_name: 'Hostel',
              variable_name: 'hostel',
              value: hostels.find(h => h.id === formData.hostelId)?.name || 'Unknown'
            },
            {
              display_name: 'Room Amount',
              variable_name: 'room_amount',
              value: calculatedAmount.toString()
            }
          ]
        },
        callback: function(response: any) {
          console.log('Payment callback received:', response);
          handlePaymentSuccess(response.reference);
        },
        onClose: function() {
          console.log('Payment modal closed');
          if (paymentStatus === PaymentStatus.PROCESSING) {
            setPaymentStatus(PaymentStatus.IDLE);
            setError('Payment was cancelled. Please try again.');
          }
        }
      });

      handler.openIframe();
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      setPaymentStatus(PaymentStatus.FAILED);
      setError(`Payment initialization failed: ${error.message}`);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    console.log('Processing payment success for reference:', reference);
    
    try {
      setPaymentStatus(PaymentStatus.SUCCESS);
      
      // Prepare booking data with payment reference
      const bookingData = {
        ...formData,
        paymentReference: reference,
        bookingFeeAmount: BOOKING_FEE,
        totalAmount: calculatedAmount,
        emergencyContacts: formData.emergencyContactName ? [{
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        }] : []
      };

      console.log('Submitting booking data:', bookingData);

      // Submit the booking
      await onSubmit(bookingData);
      
      // Reset form and close modal after successful submission
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000); // Give user time to see success message
      
    } catch (error: any) {
      console.error('Booking creation failed:', error);
      setError(`Failed to create booking: ${error.message || 'Please try again or contact support.'}`);
      setPaymentStatus(PaymentStatus.FAILED);
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentEmail: '',
      studentPhone: '',
      studentId: '',
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={paymentStatus === PaymentStatus.PROCESSING}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Status Banner */}
          {paymentStatus === PaymentStatus.SUCCESS && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Payment Successful!</p>
                <p className="text-xs text-green-600">Reference: {paymentReference}</p>
                <p className="text-xs text-green-600">Creating booking...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {!paystackLoaded && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">Loading payment system...</p>
            </div>
          )}

          {/* Booking Fee Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Booking Fee Required</h4>
            </div>
            <p className="text-sm text-blue-700">
              A non-refundable booking fee of <span className="font-bold">GHS {BOOKING_FEE}</span> is required to secure this reservation.
              The room charges of <span className="font-bold">GHS {calculatedAmount.toFixed(2)}</span> will be paid separately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.studentName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              />
              {validationErrors.studentName && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.studentName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Email *
              </label>
              <input
                type="email"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.studentEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              />
              {validationErrors.studentEmail && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.studentEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Phone *
              </label>
              <input
                type="tel"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.studentPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              />
              {validationErrors.studentPhone && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.studentPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.studentId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student ID"
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              />
              {validationErrors.studentId && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.studentId}</p>
              )}
            </div>

            {/* Dates - Place before Hostel selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.checkInDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              />
              {validationErrors.checkInDate && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.checkInDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date *
              </label>
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              />
              {validationErrors.checkOutDate && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.checkOutDate}</p>
              )}
            </div>

            {/* Accommodation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hostel *
              </label>
              <select
                name="hostelId"
                value={formData.hostelId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.hostelId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.checkInDate || !formData.checkOutDate || paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              >
                <option value="">Select Hostel</option>
                {hostels.map(hostel => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
              {validationErrors.hostelId && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.hostelId}</p>
              )}
              {(!formData.checkInDate || !formData.checkOutDate) && (
                <p className="mt-1 text-xs text-gray-500">Please select dates first</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room *
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.roomId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.hostelId || loadingRooms || paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
              >
                <option value="">
                  {loadingRooms ? 'Loading rooms...' : 'Select Room'}
                </option>
                {availableRooms.map(room => {
                  const roomType = roomTypes.get(room.roomTypeId);
                  const availableBeds = room.maxOccupancy - room.currentOccupancy;
                  return (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {roomType?.name || 'Standard'} 
                      ({availableBeds} bed{availableBeds !== 1 ? 's' : ''} available)
                    </option>
                  );
                })}
              </select>
              {validationErrors.roomId && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.roomId}</p>
              )}
              {formData.hostelId && availableRooms.length === 0 && !loadingRooms && (
                <p className="mt-1 text-xs text-red-500">No rooms available for selected dates</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or requests..."
                disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
              />
            </div>

            {/* Emergency Contact */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
                />
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Contact Phone"
                  className="px-3 py-2border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  placeholder="Relationship"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          {calculatedAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Cost Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Fee (Due Now):</span>
                  <span className="font-medium">GHS {BOOKING_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Charges (Due Later):</span>
                  <span className="font-medium">GHS {calculatedAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Total Booking Cost:</span>
                  <span className="font-bold text-lg text-gray-900">
                    GHS {(BOOKING_FEE + calculatedAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={paymentStatus === PaymentStatus.PROCESSING}
            >
              Cancel
            </button>
            <button
              onClick={initializePayment}
              disabled={paymentStatus === PaymentStatus.PROCESSING || paymentStatus === PaymentStatus.SUCCESS}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {paymentStatus === PaymentStatus.PROCESSING ? 'Processing...' : 
               paymentStatus === PaymentStatus.SUCCESS ? 'Payment Complete' : 
               `Pay GHS ${BOOKING_FEE} & Create Booking`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingModal;