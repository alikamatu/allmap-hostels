import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, User, Calendar, MapPin, Clock } from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import { formatDate, formatDateTime } from '@/utils/date';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (checkInData: CheckInFormData) => Promise<void>;
  loading: boolean;
}

interface CheckInFormData {
  notes?: string;
  actualCheckInTime?: string;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CheckInFormData>({
    notes: '',
    actualCheckInTime: new Date().toISOString().slice(0, 16), // Current datetime in YYYY-MM-DDTHH:mm format
  });

  const [showWarnings, setShowWarnings] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        notes: '',
        actualCheckInTime: new Date().toISOString().slice(0, 16),
      });
      
      // Check for warnings
      const warnings = [];
      const today = new Date();
      const checkInDate = new Date(booking.checkInDate);
      
      if (booking.paymentStatus !== PaymentStatus.PAID) {
        warnings.push('Payment is not fully completed');
      }
      
      if (checkInDate > today) {
        warnings.push('Check-in date is in the future');
      }
      
      const daysDiff = Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        warnings.push(`Check-in is ${daysDiff} days late`);
      }
      
      setShowWarnings(warnings);
    }
  }, [isOpen, booking]);

  const canCheckIn = booking.status === BookingStatus.CONFIRMED;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Check-in Student</h3>
              <p className="text-sm text-gray-500">Booking: {booking.id.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Booking Details */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Student</div>
                <div className="font-medium">{booking.studentName}</div>
                <div className="text-sm text-gray-500">{booking.studentEmail}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Room</div>
                <div className="font-medium">{booking.hostel?.name}</div>
                <div className="text-sm text-gray-500">Room {booking.room?.roomNumber}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Scheduled Check-in</div>
                <div className="font-medium">{formatDate(booking.checkInDate)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Check-out Date</div>
                <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {showWarnings.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Attention Required</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    {showWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check-in Status */}
        {!canCheckIn && (
          <div className="p-4 border-b border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Cannot Check-in</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {booking.status === BookingStatus.PENDING && 'Booking must be confirmed first'}
                    {booking.status === BookingStatus.CHECKED_IN && 'Student is already checked in'}
                    {booking.status === BookingStatus.CHECKED_OUT && 'Booking is already completed'}
                    {booking.status === BookingStatus.CANCELLED && 'Booking has been cancelled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Actual Check-in Time */}
          <div>
            <label htmlFor="actualCheckInTime" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-2" />
              Actual Check-in Time
            </label>
            <input
              type="datetime-local"
              id="actualCheckInTime"
              value={formData.actualCheckInTime}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                actualCheckInTime: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be recorded as the official check-in time
            </p>
          </div>

          {/* Emergency Contacts Display */}
          {booking.emergencyContacts && booking.emergencyContacts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Emergency Contacts</h4>
              <div className="space-y-2">
                {booking.emergencyContacts.map((contact, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-blue-900">{contact.name}</div>
                    <div className="text-blue-700">{contact.relationship} • {contact.phone}</div>
                    {contact.email && (
                      <div className="text-blue-600">{contact.email}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Requests Display */}
          {booking.specialRequests && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Special Requests</h4>
              <p className="text-sm text-purple-700">{booking.specialRequests}</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                notes: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes about the check-in process..."
              disabled={loading}
            />
          </div>

          {/* Checklist */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Check-in Checklist</h4>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="id-verified" className="rounded" />
                <label htmlFor="id-verified">Student ID verified</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="keys-handed" className="rounded" />
                <label htmlFor="keys-handed">Room keys handed over</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rules-explained" className="rounded" />
                <label htmlFor="rules-explained">Hostel rules explained</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="room-inspected" className="rounded" />
                <label htmlFor="room-inspected">Room condition inspected</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="contact-updated" className="rounded" />
                <label htmlFor="contact-updated">Contact information updated</label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || !canCheckIn}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Checking In...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Check-in
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;