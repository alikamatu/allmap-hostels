'use client';

import { motion } from 'framer-motion';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import { FiCheck, FiUpload, FiFile, FiHome, FiArrowRight } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { adminVerificationSchema, AdminVerificationFormData } from '@/lib/validationSchemas';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Fixed FormInput component using useFormContext
const FormInput = ({ name, label, placeholder, required = false, type = 'text', ...props }: any) => {
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name)}
        {...props}
        placeholder={placeholder}
        className="w-full py-3 px-4 bg-white border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
};

// Fixed FormSelect component using useFormContext
const FormSelect = ({ name, label, options, required = false }: any) => {
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...register(name)}
        className="w-full py-3 px-4 bg-white border border-gray-300  focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
      >
        <option value="">Select {label}</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]?.message as string}</p>
      )}
    </div>
  );
};

// FileUploader component (keep as is)
const FileUploader = ({ label, description, accept, maxFiles, maxSize, onFilesChange }: any) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.slice(0, maxFiles - files.length);
    
    setFiles(prev => {
      const updated = [...prev, ...validFiles];
      onFilesChange(updated);
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange(updated);
      return updated;
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        className={`border-2 border-dashed  p-6 text-center transition-colors ${
          dragActive ? 'border-[#FF6A00] bg-orange-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Drag and drop files here or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">
          {description}
        </p>
        <input
          type="file"
          multiple
          accept={Object.keys(accept).join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-[#FF6A00] text-white text-sm font-medium  hover:bg-[#E55E00] cursor-pointer transition-colors"
        >
          <FiUpload className="mr-2" />
          Choose Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 ">
              <div className="flex items-center">
                <FiFile className="text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 text-lg font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminVerification() {
  const router = useRouter();
  const [idFiles, setIdFiles] = useState<File[]>([]);
  const [hostelProofFiles, setHostelProofFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AdminVerificationFormData>({
    resolver: zodResolver(adminVerificationSchema),
    defaultValues: { 
      termsAccepted: false,
      idType: '',
      hostelProofType: ''
    }
  });

  const { handleSubmit, formState: { errors }, watch } = methods;

  const handleIdFilesChange = (files: File[]) => {
    setIdFiles(files);
  };

  const handleHostelProofFilesChange = (files: File[]) => {
    setHostelProofFiles(files);
  };

  const onSubmit = async (data: AdminVerificationFormData) => {
    console.log('Form submitted with data:', data);
    console.log('ID files:', idFiles);
    console.log('Hostel proof files:', hostelProofFiles);
    
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      
      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append files
      idFiles.forEach(file => {
        formData.append('idDocuments', file);
      });

      hostelProofFiles.forEach(file => {
        formData.append('hostelProofDocuments', file);
      });

      const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      console.log('Sending request to:', `${process.env.NEXT_PUBLIC_API_URL}/admin/verification`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/verification`, {
        method: 'POST',
        body: formData,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Verification request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      await Swal.fire({
        title: 'Submitted!',
        text: 'Your verification request has been sent to the super admin',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      router.push('/verification-status');
    } catch (error) {
      console.error('Submission error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'There was a problem submitting your verification request',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug logging
  const watchedValues = watch();
  console.log('Current form values:', watchedValues);
  console.log('Form errors:', errors);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Hero Section */}
      <div className="w-full md:w-1/2 bg-[#1a1a1a] p-8 md:p-12 flex flex-col justify-between">
        <div className="flex items-end">
          <img src="/logo/logo.png" className='w-12' alt="" />
          <span className="text-white font-bold text-xl">AllmapHostels</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Admin Verification
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-md">
            Complete your verification to access the full administrator dashboard and manage your hostels.
          </p>
          
          <div className="space-y-4">
            {[
              "Full dashboard access",
              "Manage multiple hostels",
              "Real-time booking system",
              "Advanced reporting tools",
              "24/7 customer support"
            ].map((text, i) => (
              <div key={i} className="flex items-center">
                <div className="w-5 h-5 bg-[#FF6A00] mr-3 flex items-center justify-center ">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-gray-500 text-sm">
          © 2025 AllmapHostels. All rights reserved.
        </div>
      </div>

      {/* Verification Form Section */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 overflow-y-auto">
        <FormProvider {...methods}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Verification</h2>
              <p className="text-gray-600">
                Provide the required information to get verified as a hostel administrator
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput 
                    name="firstName" 
                    label="First Name" 
                    placeholder="John" 
                    required 
                  />
                  <FormInput 
                    name="lastName" 
                    label="Last Name" 
                    placeholder="Doe" 
                    required 
                  />
                  <FormInput 
                    name="mobileNumber" 
                    label="Mobile Number" 
                    placeholder="+1234567890" 
                    type="tel"
                    required 
                  />
                  <FormInput 
                    name="alternatePhone" 
                    label="Alternate Phone" 
                    placeholder="+0987654321" 
                    type="tel"
                  />
                </div>
              </div>

              {/* Identity Verification */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Identity Verification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormSelect
                    name="idType"
                    label="ID Type"
                    options={[
                      { value: 'RG', label: 'RG (General Registry)' },
                      { value: 'National ID', label: 'National ID' },
                      { value: 'Driver License', label: 'Driver License' },
                      { value: 'Passport', label: 'Passport' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    required
                  />
                  
                  {watchedValues.idType === 'Other' && (
                    <FormInput
                      name="otherIdType"
                      label="Specify ID Type"
                      placeholder="Enter ID type"
                      required
                    />
                  )}
                  
                  <FormInput
                    name="idNumber"
                    label="ID Number"
                    placeholder="Enter ID number"
                    required
                  />
                </div>
                
                <FileUploader
                  label="Upload ID Document"
                  description="Upload clear images of your ID document (front and back)"
                  accept={{ 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] }}
                  maxFiles={3}
                  maxSize={10 * 1024 * 1024}
                  onFilesChange={handleIdFilesChange}
                />
              </div>

              {/* Hostel Verification */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Hostel Verification</h3>
                
                <div className="mb-6">
                  <FormSelect
                    name="hostelProofType"
                    label="Proof Type"
                    options={[
                      { value: 'Lease Agreement', label: 'Lease Agreement' },
                      { value: 'Utility Bill', label: 'Utility Bill' },
                      { value: 'Property Deed', label: 'Property Deed' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    required
                  />
                </div>
                
                <FileUploader
                  label="Upload Proof Documents"
                  description="Upload documents proving your hostel existence"
                  accept={{ 
                    'image/*': ['.jpeg', '.jpg', '.png'], 
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                  }}
                  maxFiles={5}
                  maxSize={15 * 1024 * 1024}
                  onFilesChange={handleHostelProofFilesChange}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 ">
                <input
                  id="terms"
                  type="checkbox"
                  {...methods.register('termsAccepted')}
                  className="w-4 h-4 text-[#FF6A00] border-gray-300  focus:ring-[#FF6A00] mt-1"
                />
                <div className="text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    I agree to the terms and conditions
                  </label>
                  <p className="text-gray-500 mt-1">
                    By submitting this form, I confirm that all information provided is accurate and complete.
                  </p>
                  {errors.termsAccepted && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.termsAccepted.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col gap-4 pt-6">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`flex items-center justify-center gap-2 py-3 px-6 text-white font-medium  transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#FF6A00] hover:bg-[#E55E00]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Submit for Verification
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => router.push('/')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 font-medium transition-colors "
                >
                  <FiHome />
                  Back to Home
                </motion.button>
              </div>
            </form>
          </motion.div>
        </FormProvider>
      </div>
    </div>
  );
}