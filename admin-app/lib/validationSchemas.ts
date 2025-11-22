import { z } from 'zod';

export const adminVerificationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  alternatePhone: z.string().optional(),
  idType: z.string().min(1, 'ID type is required'),
  otherIdType: z.string().optional(),
  idNumber: z.string().min(1, 'ID number is required'),
  hostelProofType: z.string().min(1, 'Hostel proof type is required'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

export type AdminVerificationFormData = z.infer<typeof adminVerificationSchema>;