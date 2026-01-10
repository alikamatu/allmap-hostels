'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X, Upload, Trash2, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import axios, { AxiosError } from 'axios';

// Components
import LocationPicker from '@/components/dashboard/components/_addhostels/LocationPicker';
import AmenitiesSelector from '@/components/dashboard/components/_addhostels/AmenitiesSelector';
import ImageUploader from '@/components/dashboard/components/_addhostels/ImageUploader';

interface HostelData {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  SecondaryNumber: string;
  address: string;
  base_price: number;
  payment_method: 'bank' | 'momo' | 'both';
  bank_details: {
    bank_name: string;
    account_name: string;
    account_number: string;
    branch: string;
  };
  momo_details: {
    provider: string;
    number: string;
    name: string;
  };
  max_occupancy: number;
  house_rules: string;
  check_in_time: string;
  check_out_time: string;
  nearby_facilities: string[];
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
    gym: boolean;
    studyRoom: boolean;
    kitchen: boolean;
    ac: boolean;
    generator: boolean;
  };
  location: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface LocationCoords {
  lng: number;
  lat: number;
}

const momoProviders = ['MTN', 'Vodafone', 'AirtelTigo'];
const ghanaianBanks = [
  'Ghana Commercial Bank (GCB)',
  'Ecobank Ghana',
  'Standard Chartered Bank Ghana',
  'Barclays Bank Ghana',
  'Stanbic Bank Ghana',
  'Zenith Bank Ghana',
  'United Bank for Africa (UBA)',
  'First National Bank Ghana',
  'Access Bank Ghana',
  'Fidelity Bank Ghana',
  'CalBank',
  'Agricultural Development Bank (ADB)',
  'National Investment Bank (NIB)',
  'GT Bank Ghana',
  'Prudential Bank',
  'Omni Bank'
];

export default function EditHostelPage() {
  const router = useRouter();
  const params = useParams();
  const hostelId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hostelData, setHostelData] = useState<HostelData | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [locationCoords, setLocationCoords] = useState<LocationCoords>({ lng: -0.1969, lat: 5.6037 });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [newFacility, setNewFacility] = useState('');

  const fetchHostelData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${hostelId}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      const data = response.data;
      
      // Parse location coordinates if available
      if (data.location) {
        console.log('Location data received:', data.location, typeof data.location);
        const coordinates = parseLocationString(data.location);
        if (coordinates) {
          setLocationCoords(coordinates);
        } else {
          console.warn('Could not parse location coordinates from:', data.location);
        }
      }

      // Parse nearby_facilities if it's a string
      if (data.nearby_facilities && typeof data.nearby_facilities === 'string') {
        try {
          data.nearby_facilities = JSON.parse(data.nearby_facilities);
        } catch {
          data.nearby_facilities = [];
        }
      }
      if (!Array.isArray(data.nearby_facilities)) {
        data.nearby_facilities = [];
      }

      // Ensure all required fields have default values
      const defaultHostelData: HostelData = {
        id: data.id || '',
        name: data.name || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        SecondaryNumber: data.SecondaryNumber || '',
        address: data.address || '',
        base_price: data.base_price || 0,
        payment_method: data.payment_method || 'both',
        bank_details: data.bank_details || {
          bank_name: '',
          account_name: '',
          account_number: '',
          branch: ''
        },
        momo_details: data.momo_details || {
          provider: '',
          number: '',
          name: ''
        },
        max_occupancy: data.max_occupancy || 0,
        house_rules: data.house_rules || '',
        check_in_time: data.check_in_time || '14:00',
        check_out_time: data.check_out_time || '12:00',
        nearby_facilities: data.nearby_facilities || [],
        amenities: {
          wifi: data.amenities?.wifi || false,
          laundry: data.amenities?.laundry || false,
          cafeteria: data.amenities?.cafeteria || false,
          parking: data.amenities?.parking || false,
          security: data.amenities?.security || false,
          gym: data.amenities?.gym || false,
          studyRoom: data.amenities?.studyRoom || false,
          kitchen: data.amenities?.kitchen || false,
          ac: data.amenities?.ac || false,
          generator: data.amenities?.generator || false,
        },
        location: data.location || '',
        images: data.images || [],
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      setHostelData(defaultHostelData);
      
    } catch (error) {
      console.error('Error fetching hostel data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load hostel data',
        confirmButtonColor: '#000',
      }).then(() => {
        router.push('/dashboard/manage-hostels');
      });
    } finally {
      setLoading(false);
    }
  }, [hostelId, router]);

  useEffect(() => {
    if (hostelId) {
      fetchHostelData();
    }
  }, [hostelId, fetchHostelData]);

  const parseLocationString = (locationStr: string): LocationCoords | null => {
    if (!locationStr) return null;

    if (
      typeof locationStr === 'object' &&
      locationStr !== null &&
      'coordinates' in locationStr &&
      Array.isArray((locationStr as { coordinates: [number, number] }).coordinates)
    ) {
      const coords = (locationStr as { coordinates: [number, number] }).coordinates;
      return { lng: coords[0], lat: coords[1] };
    }
    
    if (typeof locationStr === 'string') {
      const match = locationStr.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
      return match ? { lng: parseFloat(match[1]), lat: parseFloat(match[2]) } : null;
    }
    
    if (typeof locationStr === 'object' && 'lng' in locationStr && 'lat' in locationStr) {
      return { lng: (locationStr as { lng: number }).lng, lat: (locationStr as { lat: number }).lat };
    }
    
    console.warn('Unexpected location format:', locationStr);
    return null;
  };

  // Input handlers with data persistence
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHostelData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEmailChange = (email: string) => {
    setHostelData(prev => prev ? { ...prev, email } : null);
  };

  const handlePhoneChange = (phone: string) => {
    setHostelData(prev => prev ? { ...prev, phone } : null);
  };

  const handleSecondaryPhoneChange = (SecondaryNumber: string) => {
    setHostelData(prev => prev ? { ...prev, SecondaryNumber } : null);
  };

  const handleBasePriceChange = (base_price: number) => {
    setHostelData(prev => prev ? { ...prev, base_price } : null);
  };

  const handlePaymentMethodChange = (payment_method: 'bank' | 'momo' | 'both') => {
    setHostelData(prev => prev ? { ...prev, payment_method } : null);
  };

  const handleBankDetailsChange = (bank_details: any) => {
    setHostelData(prev => prev ? { ...prev, bank_details } : null);
  };

  const handleMomoDetailsChange = (momo_details: any) => {
    setHostelData(prev => prev ? { ...prev, momo_details } : null);
  };

  const handleMaxOccupancyChange = (max_occupancy: number) => {
    setHostelData(prev => prev ? { ...prev, max_occupancy } : null);
  };

  const handleNearbyFacilitiesChange = (nearby_facilities: string[]) => {
    setHostelData(prev => prev ? { ...prev, nearby_facilities } : null);
  };

  const handleAmenityChange = (amenity: string) => {
    setHostelData(prev => prev ? {
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity as keyof typeof prev.amenities]
      }
    } : null);
  };

  const handleLocationChange = (location: { lng: number; lat: number }) => {
    setLocationCoords(location);
  };

  const handleAddressChange = (address: string) => {
    setHostelData(prev => prev ? { ...prev, address } : null);
  };

  const addFacility = () => {
    if (newFacility.trim() && hostelData) {
      const currentFacilities = hostelData.nearby_facilities || [];
      if (!currentFacilities.includes(newFacility.trim())) {
        handleNearbyFacilitiesChange([...currentFacilities, newFacility.trim()]);
        setNewFacility('');
      }
    }
  };

  const removeFacility = (facility: string) => {
    if (hostelData) {
      const currentFacilities = hostelData.nearby_facilities || [];
      handleNearbyFacilitiesChange(currentFacilities.filter(f => f !== facility));
    }
  };

  const handleImageUpload = (files: File[]) => {
    setNewImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const removeExistingImage = async (imageUrl: string) => {
    try {
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${hostelId}/image`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        data: { imageUrl }
      });

      setHostelData(prev => prev ? {
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      } : null);

      Swal.fire({
        icon: 'success',
        title: 'Image Removed',
        text: 'Image has been successfully removed',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Error removing image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to remove image',
        confirmButtonColor: '#000',
      });
    }
  };

  const handleSubmit = async () => {
    if (!hostelData) return;
    
    try {
      setSaving(true);
      
      console.log('Submitting hostel update with location coords:', locationCoords);
      
      const formData = new FormData();
      formData.append('name', hostelData.name);
      formData.append('email', hostelData.email);
      formData.append('phone', hostelData.phone);
      formData.append('SecondaryNumber', hostelData.SecondaryNumber);
      formData.append('description', hostelData.description);
      formData.append('address', hostelData.address);
      formData.append('base_price', hostelData.base_price.toString());
      formData.append('payment_method', hostelData.payment_method);
      formData.append('max_occupancy', hostelData.max_occupancy.toString());
      formData.append('house_rules', hostelData.house_rules);
      formData.append('check_in_time', hostelData.check_in_time);
      formData.append('check_out_time', hostelData.check_out_time);
      
      if (hostelData.nearby_facilities) {
        formData.append('nearby_facilities', JSON.stringify(hostelData.nearby_facilities));
      }
      
      // Add payment details based on method
      if ((hostelData.payment_method === 'bank' || hostelData.payment_method === 'both') && hostelData.bank_details) {
        formData.append('bank_details', JSON.stringify(hostelData.bank_details));
      }
      
      if ((hostelData.payment_method === 'momo' || hostelData.payment_method === 'both') && hostelData.momo_details) {
        formData.append('momo_details', JSON.stringify(hostelData.momo_details));
      }
      
      // Ensure location coordinates are properly formatted
      const locationData = {
        lng: Number(locationCoords.lng),
        lat: Number(locationCoords.lat)
      };
      
      console.log('Location data being sent:', locationData);
      formData.append('location', JSON.stringify(locationData));
      formData.append('amenities', JSON.stringify(hostelData.amenities));
      
      newImages.forEach((file: File) => {
        formData.append('images', file);
      });

      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${hostelId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Hostel Updated!',
        text: 'Your hostel has been successfully updated',
        confirmButtonColor: '#000',
      }).then(() => {
        router.push('/dashboard/manage-hostels');
      });
      
    } catch (error: unknown) {
      console.error('Update error:', error);
      
      let errorMessage = 'An error occurred while updating';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: errorMessage,
        confirmButtonColor: '#000',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hostel data...</p>
        </div>
      </div>
    );
  }

  if (!hostelData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hostel Not Found</h2>
          <p className="text-gray-600 mb-4">The hostel you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/manage-hostels')}
            className="px-6 py-3 bg-[#FF6A00] text-white hover:bg-[#E55E00] transition-colors duration-150"
          >
            Back to Hostels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl mx-auto space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/manage-hostels')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-150"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </motion.button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Edit Hostel</h1>
              <p className="text-xs text-gray-600">Update your hostel information</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              BASIC INFORMATION
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Hostel Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={hostelData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter hostel name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={hostelData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter hostel email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={hostelData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter primary phone"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  name="SecondaryNumber"
                  value={hostelData.SecondaryNumber}
                  onChange={(e) => handleSecondaryPhoneChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter secondary phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={hostelData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                placeholder="Describe your hostel facilities, rooms, and unique features"
                required
              />
            </div>
          </motion.div>

          {/* Pricing & Capacity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              PRICING & CAPACITY
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Base Price (GHS) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={hostelData.base_price}
                  onChange={(e) => handleBasePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter base price"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Maximum Occupancy
                </label>
                <input
                  type="number"
                  min="1"
                  value={hostelData.max_occupancy}
                  onChange={(e) => handleMaxOccupancyChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter maximum occupancy"
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              PAYMENT INFORMATION
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Payment Methods *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(['bank', 'momo', 'both'] as const).map((method) => (
                  <div key={method} className="relative">
                    <input
                      type="radio"
                      id={method}
                      name="payment_method"
                      value={method}
                      checked={hostelData.payment_method === method}
                      onChange={(e) => handlePaymentMethodChange(e.target.value as any)}
                      className="sr-only"
                    />
                    <motion.label
                      htmlFor={method}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center p-2 border text-xs font-medium cursor-pointer transition-colors duration-150 ${
                        hostelData.payment_method === method
                          ? 'bg-[#FF6A00] border-[#FF6A00] text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="capitalize">
                        {method === 'momo' ? 'Mobile Money' : method === 'both' ? 'Bank & MoMo' : 'Bank Transfer'}
                      </span>
                    </motion.label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Details */}
            {(hostelData.payment_method === 'bank' || hostelData.payment_method === 'both') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="space-y-3 p-3 bg-gray-50"
              >
                <h4 className="text-xs font-semibold text-gray-900">BANK DETAILS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <select
                      value={hostelData.bank_details?.bank_name || ''}
                      onChange={(e) => handleBankDetailsChange({
                        ...hostelData.bank_details,
                        bank_name: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      required
                    >
                      <option value="">Select Bank</option>
                      {ghanaianBanks.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={hostelData.bank_details?.account_name || ''}
                      onChange={(e) => handleBankDetailsChange({
                        ...hostelData.bank_details,
                        account_name: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      placeholder="Enter account name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={hostelData.bank_details?.account_number || ''}
                      onChange={(e) => handleBankDetailsChange({
                        ...hostelData.bank_details,
                        account_number: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={hostelData.bank_details?.branch || ''}
                      onChange={(e) => handleBankDetailsChange({
                        ...hostelData.bank_details,
                        branch: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      placeholder="Enter branch"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mobile Money Details */}
            {(hostelData.payment_method === 'momo' || hostelData.payment_method === 'both') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="space-y-3 p-3 bg-gray-50"
              >
                <h4 className="text-xs font-semibold text-gray-900">MOBILE MONEY DETAILS</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Provider *
                    </label>
                    <select
                      value={hostelData.momo_details?.provider || ''}
                      onChange={(e) => handleMomoDetailsChange({
                        ...hostelData.momo_details,
                        provider: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      required
                    >
                      <option value="">Select Provider</option>
                      {momoProviders.map((provider) => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={hostelData.momo_details?.number || ''}
                      onChange={(e) => handleMomoDetailsChange({
                        ...hostelData.momo_details,
                        number: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={hostelData.momo_details?.name || ''}
                      onChange={(e) => handleMomoDetailsChange({
                        ...hostelData.momo_details,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-white text-sm focus:outline-none transition-colors duration-150"
                      placeholder="Enter account name"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              ADDITIONAL INFORMATION
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Check-in Time
                </label>
                <input
                  type="time"
                  name="check_in_time"
                  value={hostelData.check_in_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Check-out Time
                </label>
                <input
                  type="time"
                  name="check_out_time"
                  value={hostelData.check_out_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                House Rules
              </label>
              <textarea
                name="house_rules"
                value={hostelData.house_rules}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                placeholder="Enter house rules"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nearby Facilities
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                    className="flex-1 px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                    placeholder="Add nearby facility"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ backgroundColor: '#e55e00' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addFacility}
                    className="px-3 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150"
                  >
                    Add
                  </motion.button>
                </div>
                {hostelData.nearby_facilities && hostelData.nearby_facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hostelData.nearby_facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => removeFacility(facility)}
                          className="ml-1 text-gray-500 hover:text-red-500 text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.4 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              LOCATION
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={hostelData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 text-sm focus:bg-white focus:outline-none transition-colors duration-150"
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div>
                <motion.button
                  type="button"
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 border border-gray-300"
                >
                  <MapPin className="h-3 w-3" />
                  {showLocationPicker ? 'Hide Map' : 'Update Location on Map'}
                </motion.button>
              </div>

              {showLocationPicker && (
                <div className="border border-gray-200 p-3">
                  <LocationPicker 
                    location={locationCoords} 
                    address={hostelData.address}
                    onLocationChange={handleLocationChange}
                    onAddressChange={handleAddressChange}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.5 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4"
          >
            <AmenitiesSelector 
              amenities={hostelData.amenities} 
              onAmenityChange={handleAmenityChange} 
            />
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.6 }}
            className="bg-white border-t-4 border-t-[#FF6A00] p-4 space-y-4"
          >
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              HOSTEL IMAGES
            </h3>

            {/* Existing Images */}
            {hostelData.images.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Current Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {hostelData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group bg-gray-50">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Hostel image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <motion.button
                        whileHover={{ backgroundColor: '#e55e00' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeExistingImage(imageUrl)}
                        className="absolute top-1 right-1 p-1 bg-[#FF6A00] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      >
                        <Trash2 className="h-3 w-3" />
                      </motion.button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Add New Images</h4>
              <ImageUploader 
                images={newImages}
                onUpload={handleImageUpload}
                onRemove={removeNewImage}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.7 }}
            className="flex justify-between items-center pt-4 border-t border-gray-100"
          >
            <motion.button
              whileHover={{ backgroundColor: '#f3f4f6' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/manage-hostels')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors duration-150 border border-gray-300"
            >
              <ArrowLeft className="h-3 w-3" />
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ backgroundColor: '#e55e00' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white text-xs font-medium hover:bg-[#E55E00] transition-colors duration-150 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  Save Changes
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}