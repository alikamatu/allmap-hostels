import { z } from 'zod';

export const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

export const adminVerificationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileNumber: z.string().regex(phoneRegex, "Invalid phone number format"),
  alternatePhone: z.string().regex(phoneRegex, "Invalid phone number format").optional(),
  idType: z.enum(['RG', 'National ID', 'Driver License', 'Passport', 'Other']),
  idNumber: z.string().min(4, "ID number must be at least 4 characters"),
  hostelProofType: z.enum(['Lease Agreement', 'Utility Bill', 'Property Deed', 'Other']),
  termsAccepted: z.boolean().refine(val => val, "You must accept terms and conditions")
});

export type AdminVerificationFormData = z.infer<typeof adminVerificationSchema>;