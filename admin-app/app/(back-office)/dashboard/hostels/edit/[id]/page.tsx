'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X, Upload, Trash2, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import axios, { AxiosError } from 'axios';

// Components
import LocationPicker from '@/components/dashboard/components/_addhostels/LocationPicker';

interface HostelData {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  SecondaryNumber: string;
  address: string;
  amenities: {
    wifi: boolean;
    laundry: boolean;
    cafeteria: boolean;
    parking: boolean;
    security: boolean;
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

  const fetchHostelData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${hostelId}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      const data = response.data;
      setHostelData(data);
      
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
    // Handle null or undefined
    if (!locationStr) return null;

    
    
    // If it's already an object with coordinates
    if (
      typeof locationStr === 'object' &&
      locationStr !== null &&
      'coordinates' in locationStr &&
      Array.isArray((locationStr as { coordinates: [number, number] }).coordinates)
    ) {
      const coords = (locationStr as { coordinates: [number, number] }).coordinates;
      return { lng: coords[0], lat: coords[1] };
    }
    
    // If it's a string in POINT format
    if (typeof locationStr === 'string') {
      const match = locationStr.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
      return match ? { lng: parseFloat(match[1]), lat: parseFloat(match[2]) } : null;
    }
    
    // If it's an object with lng/lat properties
    if (typeof locationStr === 'object' && 'lng' in locationStr && 'lat' in locationStr) {
      return { lng: (locationStr as { lng: number }).lng, lat: (locationStr as { lat: number }).lat };
    }
    
    console.warn('Unexpected location format:', locationStr);
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHostelData(prev => prev ? { ...prev, [name]: value } : null);
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
        title: 'img Removed',
        text: 'img has been successfully removed',
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
      
      // Use PUT instead of PATCH to match your controller
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hostel data...</p>
        </div>
      </div>
    );
  }

  if (!hostelData) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hostel Not Found</h2>
          <p className="text-gray-600 mb-4">The hostel you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/manage-hostels')}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Back to Hostels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/dashboard/manage-hostels')}
              className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Hostel</h1>
              <p className="text-gray-600">Update your hostel information</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=" rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={hostelData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter hostel name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={hostelData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter hostel email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={hostelData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter primary phone"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  name="SecondaryNumber"
                  value={hostelData.SecondaryNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter secondary phone"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={hostelData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                placeholder="Describe your hostel facilities, rooms, and unique features"
                required
              />
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=" rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={hostelData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-black focus:border-black"
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {showLocationPicker ? 'Hide Map' : 'Update Location on Map'}
                </button>
              </div>

              {showLocationPicker && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <LocationPicker 
                    location={locationCoords} 
                    address={hostelData.address}
                    onLocationChange={handleLocationChange}
                    onAddressChange={(value: string) => setHostelData(prev => prev ? { ...prev, address: value } : null)}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className=" rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(hostelData.amenities).map(([amenity, isActive]) => (
                <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleAmenityChange(amenity)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className=" rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
            
            {/* Existing Images */}
            {hostelData.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hostelData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={`Hostel image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeExistingImage(imageUrl)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Images</h3>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleImageUpload(files);
                }}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
              </label>
            </div>

            {/* Preview New Images */}
            {newImages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">New Images Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center"
          >
            <button
              onClick={() => router.push('/dashboard/manage-hostels')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center disabled:opacity-70"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}