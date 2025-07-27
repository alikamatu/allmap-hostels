'use client';

import { motion } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import { Check, Loader2 } from 'lucide-react';

import { adminVerificationSchema, AdminVerificationFormData } from '@/lib/validationSchemas';
import { useState } from 'react';
import FormInput from '@/components/dashboard/components/setting/FormInput';
import FormSelect from '@/components/dashboard/components/setting/FormSelect';
import FileUploader from '@/components/dashboard/components/setting/FileUploader';

export default function Settings() {

  const [idFiles, setIdFiles] = useState<File[]>([]);
  const [hostelProofFiles, setHostelProofFiles] = useState<File[]>([]);
  const [otherIdType, setOtherIdType] = useState('');

  const handleIdFilesChange = (files: File[]) => {
    setIdFiles(files);
  };

  const handleHostelProofFilesChange = (files: File[]) => {
    setHostelProofFiles(files);
  };

  const methods = useForm<AdminVerificationFormData>({
    resolver: zodResolver(adminVerificationSchema),
    defaultValues: { termsAccepted: false }
  });

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = methods;
   

  const onSubmit = async (data: AdminVerificationFormData) => {
    try {
      // Prepare form data for file uploads
      const formData = new FormData();
      
      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'idFiles' && key !== 'hostelProofFiles') {
          formData.append(key, value.toString());
        }
      });

      // Append ID files
      idFiles.forEach(file => {
        formData.append('idDocuments', file);
      });

      // Append hostel proof files
      hostelProofFiles.forEach(file => {
        formData.append('hostelProofDocuments', file);
      });

      // Send to backend
      const response = await fetch('/api/verification', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Verification request failed');
      }

      // Show success message
      Swal.fire({
        title: 'Submitted!',
        text: 'Your verification request has been sent to the super admin',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'There was a problem submitting your verification request',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
      console.error('Submission error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Verification</h1>
            <p className="mt-2 text-gray-600">
              Complete your profile to get verified by the super admin
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
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
                  required 
                />
                <FormInput 
                  name="alternatePhone" 
                  label="Alternate Phone" 
                  placeholder="+0987654321" 
                />
              </div>
            </div>

            {/* Identity Verification Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Identity Verification</h2>
              
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
                
                {watch('idType') === 'Other' && (
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
                maxSize={10 * 1024 * 1024} // 10MB
                onFilesChange={handleIdFilesChange}
              />
            </div>

            {/* Hostel Verification Section */}
            <div className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Hostel Verification</h2>
              
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
                maxSize={15 * 1024 * 1024} // 15MB
                onFilesChange={handleHostelProofFilesChange}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('termsAccepted')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the terms and conditions
                </label>
                <p className="text-gray-500">
                  By submitting this form, I confirm that all information provided is accurate and complete.
                </p>
                {errors.termsAccepted && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit for Verification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
    </FormProvider>
  );
}