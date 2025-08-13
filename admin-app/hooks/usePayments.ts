// hooks/usePayments.ts - Fixed with better auth handling
import { useState, useCallback } from 'react';
import { Payment, PaymentMethod, PaymentType } from '@/types/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface PaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

interface PaymentFilters {
  bookingId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
}

interface PaymentResponse {
  payment: Payment;
  booking: any; // The updated booking object
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    // Check both localStorage and sessionStorage
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    
    const token = localToken || sessionToken;
    
    if (!token) {
      console.error('No authentication token found in localStorage or sessionStorage');
      return null;
    }
    
    // Basic token validation (check if it's not just an empty string)
    if (token.trim() === '') {
      console.error('Authentication token is empty');
      return null;
    }
    
    console.log('Token found:', token.substring(0, 20) + '...');
    return token;
  };

  const makeApiRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    console.log('Making API request:', {
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` }
    });

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      // Log response details
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (response.status === 401) {
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          sessionStorage.removeItem('access_token');
        }
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use the default error message
          console.warn('Could not parse error response as JSON');
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  };

  const recordPayment = useCallback(async (bookingId: string, paymentData: PaymentData): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Recording payment:', { bookingId, paymentData });
      
      // Validate payment data before sending
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }
      
      if (!paymentData.paymentMethod) {
        throw new Error('Payment method is required');
      }

      const response = await makeApiRequest(`/bookings/${bookingId}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(paymentData.amount), // Ensure it's a number
          paymentMethod: paymentData.paymentMethod,
          transactionRef: paymentData.transactionRef || null,
          notes: paymentData.notes || null
        }),
      });

      console.log('Payment recorded successfully:', response);

      // Update local payments state if we have the payment data
      if (response.payment) {
        setPayments(prev => {
          // Check if this payment already exists to avoid duplicates
          const exists = prev.some(p => p.id === response.payment.id);
          if (exists) {
            return prev;
          }
          return [response.payment, ...prev];
        });
      }

      return {
        payment: response.payment,
        booking: response.booking // This should be the updated booking from backend
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      setError(errorMessage);
      console.error('Payment recording failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookingPayments = useCallback(async (bookingId: string, forceRefresh: boolean = false): Promise<Payment[]> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching payments for booking:', bookingId);
      
      // Add timestamp to force cache refresh if needed
      const url = forceRefresh 
        ? `/bookings/${bookingId}/payments?_t=${Date.now()}`
        : `/bookings/${bookingId}/payments`;
        
      const data = await makeApiRequest(url);
      
      console.log('Fetched payments:', data);
      
      // Ensure data is an array
      const paymentsArray = Array.isArray(data) ? data : [];
      
      setPayments(paymentsArray);
      return paymentsArray;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async (filters: PaymentFilters = {}): Promise<Payment[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const data = await makeApiRequest(`/payments?${params.toString()}`);
      const paymentsArray = Array.isArray(data) ? data : data.payments || [];
      
      setPayments(paymentsArray);
      return paymentsArray;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (paymentId: string, updateData: Partial<Payment>): Promise<Payment> => {
    setLoading(true);
    try {
      const data = await makeApiRequest(`/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? { ...payment, ...data } : payment
      ));
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePayment = useCallback(async (paymentId: string): Promise<void> => {
    setLoading(true);
    try {
      await makeApiRequest(`/payments/${paymentId}`, {
        method: 'DELETE',
      });
      
      // Update local state
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processRefund = useCallback(async (bookingId: string, refundData: {
    amount: number;
    reason: string;
    notes?: string;
  }): Promise<Payment> => {
    setLoading(true);
    try {
      const paymentData = {
        amount: -Math.abs(refundData.amount), // Ensure negative amount
        paymentMethod: PaymentMethod.BANK_TRANSFER, // Default for refunds
        paymentType: PaymentType.REFUND,
        notes: `Refund: ${refundData.reason}${refundData.notes ? ` - ${refundData.notes}` : ''}`,
      };

      const response = await makeApiRequest(`/bookings/${bookingId}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      // Add to local state
      if (response.payment) {
        setPayments(prev => [response.payment, ...prev]);
      }
      
      return response.payment || response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process refund';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentSummary = useCallback((bookingPayments: Payment[]) => {
    const summary = {
      totalPaid: 0,
      totalRefunded: 0,
      netAmount: 0,
      paymentCount: 0,
      refundCount: 0,
      lastPaymentDate: null as string | null,
      paymentMethods: [] as PaymentMethod[],
    };

    bookingPayments.forEach(payment => {
      if (payment.amount > 0) {
        summary.totalPaid += payment.amount;
        summary.paymentCount++;
      } else {
        summary.totalRefunded += Math.abs(payment.amount);
        summary.refundCount++;
      }

      // Track payment methods
      if (!summary.paymentMethods.includes(payment.paymentMethod)) {
        summary.paymentMethods.push(payment.paymentMethod);
      }

      // Track last payment date
      if (!summary.lastPaymentDate || new Date(payment.paymentDate) > new Date(summary.lastPaymentDate)) {
        summary.lastPaymentDate = payment.paymentDate;
      }
    });

    summary.netAmount = summary.totalPaid - summary.totalRefunded;

    return summary;
  }, []);

  const validatePayment = useCallback((paymentData: PaymentData, maxAmount: number) => {
    const errors: string[] = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (paymentData.amount > maxAmount) {
      errors.push('Payment amount cannot exceed the amount due');
    }

    if (!paymentData.paymentMethod) {
      errors.push('Payment method is required');
    }

    // Check if transaction reference is required for electronic payments
    const electronicMethods = [PaymentMethod.BANK_TRANSFER, PaymentMethod.MOBILE_MONEY, PaymentMethod.CARD];
    if (electronicMethods.includes(paymentData.paymentMethod) && !paymentData.transactionRef?.trim()) {
      errors.push('Transaction reference is required for this payment method');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const generatePaymentReceipt = useCallback((payment: Payment, booking?: any) => {
    return {
      id: payment.id,
      receiptNumber: `RCP-${payment.id.substring(0, 8).toUpperCase()}`,
      date: payment.paymentDate,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionRef: payment.transactionRef,
      studentName: booking?.studentName,
      bookingId: payment.bookingId,
      notes: payment.notes,
    };
  }, []);

  const exportPayments = useCallback(async (filters: PaymentFilters = {}) => {
    try {
      const paymentsData = await fetchPayments(filters);
      
      // Transform data for export
      const exportData = paymentsData.map(payment => ({
        'Payment ID': payment.id,
        'Booking ID': payment.bookingId,
        'Amount': payment.amount,
        'Payment Method': payment.paymentMethod,
        'Transaction Reference': payment.transactionRef || '',
        'Payment Date': new Date(payment.paymentDate).toLocaleDateString(),
        'Received By': payment.receivedBy || '',
        'Notes': payment.notes || '',
      }));

      return exportData;
    } catch (err) {
      console.error('Error exporting payments:', err);
      throw err;
    }
  }, [fetchPayments]);

  // Clear local state
  const clearPayments = useCallback(() => {
    setPayments([]);
    setError(null);
  }, []);

  // Refresh payments for a specific booking
  const refreshBookingPayments = useCallback(async (bookingId: string) => {
    return await fetchBookingPayments(bookingId, true); // Force refresh
  }, [fetchBookingPayments]);

  // Check authentication status
  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    return {
      isAuthenticated: !!token,
      token: token ? `${token.substring(0, 20)}...` : null
    };
  }, []);

  return {
    // State
    payments,
    loading,
    error,

    // Actions
    recordPayment,
    fetchBookingPayments,
    fetchPayments,
    updatePayment,
    deletePayment,
    processRefund,
    refreshBookingPayments,

    // Utilities
    getPaymentSummary,
    validatePayment,
    generatePaymentReceipt,
    exportPayments,
    clearPayments,
    setError,
    checkAuth, // Add this for debugging
  };
};