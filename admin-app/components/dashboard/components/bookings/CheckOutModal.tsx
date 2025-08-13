import React, { useState, useEffect } from 'react';
import { X, LogOut, AlertCircle, User, Calendar, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Booking, BookingStatus } from '@/types/booking';
import { formatDate, formatDateTime } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSubmit: (checkOutData: CheckOutFormData) => Promise<void>;
  loading: boolean;
}

interface CheckOutFormData {
  notes?: string;
  actualCheckOutTime?: string;
  roomCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  keyReturned?: boolean;
  damageNotes?: string;
  cleaningFee?: number;
  depositRefund?: number;
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CheckOutFormData>({
    notes: '',
    actualCheckOutTime: new Date().toISOString().slice(0, 16),
    roomCondition: 'good',
    keyReturned: false,
    damageNotes: '',
    cleaningFee: 0,
    depositRefund: 0,
  });

  const [showDamageSection, setShowDamageSection] = useState(false);
  const [showWarnings, setShowWarnings] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        notes: '',
        actualCheckOutTime: new Date().toISOString().slice(0, 16),
        roomCondition: 'good',
        keyReturned: false,
        damageNotes: '',
        cleaningFee: 0,
        depositRefund: 0,
      });
      
      // Check for warnings
      const warnings = [];
      const today = new Date();
      const checkOutDate = new Date(booking.checkOutDate);
      
      if (checkOutDate > today) {
        warnings.push('Early check-out - scheduled date not reached');
      }
      
      const daysDiff = Math.ceil((today.getTime() - checkOutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        warnings.push(`Check-out is ${daysDiff} days late`);
      }
      
      setShowWarnings(warnings);
      setShowDamageSection(false);
    }
  }, [isOpen, booking]);

  const canCheckOut = booking.status === BookingStatus.CHECKED_IN;

  const handleRoomConditionChange = (condition: string) => {
    setFormData(prev => ({ 
      ...prev, 
      roomCondition: condition as 'excellent' | 'good' | 'fair' | 'poor'
    }));
    setShowDamageSection(condition === 'fair' || condition === 'poor');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  if (!isOpen) return null;

  const stayDuration = Math.ceil(
    (new Date().getTime() - new Date(booking.checkedInAt || booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LogOut className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Check-out Student</h3>
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

        {/* Booking Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Student</div>
                <div className="font-medium">{booking.studentName}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Room</div>
                <div className="font-medium">Room {booking.room?.roomNumber}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Stay Duration</div>
                <div className="font-medium">{stayDuration} days</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Total Paid</div>
                <div className="font-medium">{formatCurrency(booking.amountPaid)}</div>
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

        {/* Check-out Status */}
        {!canCheckOut && (
          <div className="p-4 border-b border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Cannot Check-out</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {booking.status === BookingStatus.PENDING && 'Student is not checked in'}
                    {booking.status === BookingStatus.CONFIRMED && 'Student is not checked in'}
                    {booking.status === BookingStatus.CHECKED_OUT && 'Student is already checked out'}
                    {booking.status === BookingStatus.CANCELLED && 'Booking has been cancelled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Actual Check-out Time */}
          <div>
            <label htmlFor="actualCheckOutTime" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-2" />
              Actual Check-out Time
            </label>
            <input
              type="datetime-local"
              id="actualCheckOutTime"
              value={formData.actualCheckOutTime}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                actualCheckOutTime: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Room Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Room Condition Assessment
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'excellent', label: 'Excellent', color: 'green' },
                { value: 'good', label: 'Good', color: 'blue' },
                { value: 'fair', label: 'Fair', color: 'yellow' },
                { value: 'poor', label: 'Poor', color: 'red' }
              ].map((condition) => (
                <button
                  key={condition.value}
                  type="button"
                  onClick={() => handleRoomConditionChange(condition.value)}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    formData.roomCondition === condition.value
                      ? `border-${condition.color}-500 bg-${condition.color}-50 text-${condition.color}-700`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {condition.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Return */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="keyReturned"
              checked={formData.keyReturned}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                keyReturned: e.target.checked 
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="keyReturned" className="text-sm font-medium text-gray-700">
              Room keys returned
            </label>
          </div>

          {/* Damage Assessment (conditional) */}
          {showDamageSection && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-orange-900">Damage Assessment</h4>
              
              <div>
                <label htmlFor="damageNotes" className="block text-sm font-medium text-orange-700 mb-2">
                  Describe any damages or issues
                </label>
                <textarea
                  id="damageNotes"
                  rows={3}
                  value={formData.damageNotes}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    damageNotes: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Detail any damages, missing items, or cleanliness issues..."
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cleaningFee" className="block text-sm font-medium text-orange-700 mb-2">
                    Cleaning Fee (if applicable)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="cleaningFee"
                      step="0.01"
                      min="0"
                      value={formData.cleaningFee || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cleaningFee: parseFloat(e.target.value) || 0 
                      }))}
                      className="pl-10 w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="depositRefund" className="block text-sm font-medium text-orange-700 mb-2">
                    Deposit Refund Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="depositRefund"
                      step="0.01"
                      min="0"
                      value={formData.depositRefund || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        depositRefund: parseFloat(e.target.value) || 0 
                      }))}
                      className="pl-10 w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Check-out Checklist */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Check-out Checklist</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="personal-items" className="rounded" />
                <label htmlFor="personal-items">All personal items removed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="room-cleaned" className="rounded" />
                <label htmlFor="room-cleaned">Room cleaned and inspected</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="utilities-checked" className="rounded" />
                <label htmlFor="utilities-checked">All utilities turned off</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="damages-noted" className="rounded" />
                <label htmlFor="damages-noted">Any damages documented</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="contact-info" className="rounded" />
                <label htmlFor="contact-info">Forwarding address obtained</label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Notes
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
              placeholder="Optional notes about the check-out process..."
              disabled={loading}
            />
          </div>

          {/* Financial Summary */}
          {(formData.cleaningFee > 0 || formData.depositRefund > 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                {formData.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Cleaning Fee:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(formData.cleaningFee)}</span>
                  </div>
                )}
                {formData.depositRefund > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Deposit Refund:</span>
                    <span className="font-medium text-green-600">+{formatCurrency(formData.depositRefund)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Net Amount:</span>
                  <span className={(formData.depositRefund - formData.cleaningFee) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {(formData.depositRefund - formData.cleaningFee) >= 0 ? '+' : ''}{formatCurrency(formData.depositRefund - formData.cleaningFee)}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || !canCheckOut || !formData.keyReturned}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Checking Out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Complete Check-out
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckOutModal;