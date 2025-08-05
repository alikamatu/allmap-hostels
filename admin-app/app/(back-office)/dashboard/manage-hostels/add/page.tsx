'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

// Components
import HostelForm from '@/components/dashboard/components/_addhostels/HostelForm';
import LocationPicker from '@/components/dashboard/components/_addhostels/LocationPicker';
import AmenitiesSelector from '@/components/dashboard/components/_addhostels/AmenitiesSelector';
import ImageUploader from '@/components/dashboard/components/_addhostels/ImageUploader';

export default function AddHostelPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hostelData, setHostelData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    SecondaryNumber: '',
    address: '',
    amenities: {
      wifi: false,
      laundry: false,
      cafeteria: false,
      parking: false,
      security: false
    },
    location: { lng: -0.1969, lat: 5.6037 }, // Default to Accra, Ghana
    images: [] as File[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHostelData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (email: string) => {
    setHostelData(prev => ({ ...prev, email }));
  };

  const handlePhoneChange = (phone: string) => {
    setHostelData(prev => ({ ...prev, phone }));
  };

  const handleSecondaryPhoneChange = (SecondaryNumber: string) => {
    setHostelData(prev => ({ ...prev, SecondaryNumber }));
  };

  const handleAmenityChange = (amenity: string) => {
    setHostelData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity as keyof typeof prev.amenities]
      }
    }));
  };

  const handleLocationChange = (location: { lng: number; lat: number }) => {
    setHostelData(prev => ({ ...prev, location }));
  };

  const handleImageUpload = (files: File[]) => {
    setHostelData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setHostelData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!hostelData.name.trim() || !hostelData.description.trim() || !hostelData.email.trim() || !hostelData.phone.trim() || !hostelData.SecondaryNumber.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          text: 'Please fill in all required fields',
          confirmButtonColor: '#000',
        });
        return false;
      }
    }
    
    if (step === 2) {
      if (!hostelData.address.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Address Required',
          text: 'Please enter a valid address',
          confirmButtonColor: '#000',
        });
        return false;
      }
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    try {
      setLoading(true);
      
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('name', hostelData.name);
      formData.append('email', hostelData.email);
      formData.append('phone', hostelData.phone);
      formData.append('SecondaryNumber', hostelData.SecondaryNumber);
      formData.append('description', hostelData.description);
      formData.append('address', hostelData.address);
      formData.append('location', JSON.stringify(hostelData.location));
      formData.append('amenities', JSON.stringify(hostelData.amenities));
      
      hostelData.images.forEach((file: File) => {
        formData.append(`images`, file);
      });

      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // Submit to backend
      await axios.post('http://localhost:1000/hostels/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      });

      // Success notification
      Swal.fire({
        icon: 'success',
        title: 'Hostel Created!',
        text: 'Your hostel has been successfully added',
        confirmButtonColor: '#000',
      }).then(() => {
        router.push('/dashboard');
      });
      
    } catch (error: unknown) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: (error as Error).message || 'An error occurred',
        confirmButtonColor: '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Hostel</h1>
          <p className="text-gray-600">Fill in the details to list your hostel on our platform</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= num ? 'bg-black border-black' : 'border-gray-300'
                }`}>
                  <span className={`font-medium ${step >= num ? 'text-white' : 'text-gray-400'}`}>
                    {num}
                  </span>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {['Details', 'Location', 'Amenities', 'Images'][num - 1]}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <motion.div 
              className="h-full bg-black rounded-full"
              initial={{ width: `${(step - 1) * 33}%` }}
              animate={{ width: `${(step - 1) * 33}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step > 1 ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          {step === 1 && (
            <HostelForm 
              hostelData={hostelData} 
              handleInputChange={handleInputChange} 
              handleEmailChange={handleEmailChange}
              handlePhoneChange={handlePhoneChange}
              handleSecondaryPhoneChange={handleSecondaryPhoneChange}
            />
          )}
          
          {step === 2 && (
            <LocationPicker 
              location={hostelData.location} 
              address={hostelData.address}
              onLocationChange={handleLocationChange}
              onAddressChange={(value: string) => setHostelData(prev => ({ ...prev, address: value }))}
            />
          )}
          
          {step === 3 && (
            <AmenitiesSelector 
              amenities={hostelData.amenities} 
              onAmenityChange={handleAmenityChange} 
            />
          )}
          
          {step === 4 && (
            <ImageUploader 
              images={hostelData.images} 
              onUpload={handleImageUpload} 
              onRemove={removeImage} 
            />
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl border ${
                step === 1 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-gray-800 border-gray-800 hover:bg-gray-50'
              } font-medium transition-colors`}
            >
              Back
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center"
              >
                Next
                <Plus className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center disabled:opacity-70"
              >
                {loading ? 'Submitting...' : 'Create Hostel'}
                {!loading && <Plus className="ml-2 h-4 w-4" />}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}