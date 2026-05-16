import { z } from 'zod';

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email')
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/\d/, 'At least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'At least one special character');

export const signupStep1Schema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .transform((v) => v.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email')
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

export const signupStep2Schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupStep1Data = z.infer<typeof signupStep1Schema>;
export type SignupStep2Data = z.infer<typeof signupStep2Schema>;

// ─── Admin verification schema ────────────────────────────────────────────────

export const adminVerificationSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    alternatePhone: z.string().optional(),
    idType: z.string().min(1, 'ID type is required'),
    otherIdType: z.string().optional(),
    idNumber: z.string().min(1, 'ID number is required'),
    payoutMethod: z.enum(['momo', 'bank'], {
      message: 'Payout method is required',
    }),
    momoProvider: z.string().optional(),
    momoNumber: z.string().optional(),
    momoAccountName: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankAccountName: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.payoutMethod === 'momo') {
      if (!data.momoProvider)
        ctx.addIssue({
          code: 'custom',
          path: ['momoProvider'],
          message: 'Provider is required',
        });
      if (!data.momoNumber)
        ctx.addIssue({
          code: 'custom',
          path: ['momoNumber'],
          message: 'MoMo number is required',
        });
      if (!data.momoAccountName)
        ctx.addIssue({
          code: 'custom',
          path: ['momoAccountName'],
          message: 'Account holder name is required',
        });
    }
    if (data.payoutMethod === 'bank') {
      if (!data.bankName)
        ctx.addIssue({
          code: 'custom',
          path: ['bankName'],
          message: 'Bank name is required',
        });
      if (!data.bankAccountNumber)
        ctx.addIssue({
          code: 'custom',
          path: ['bankAccountNumber'],
          message: 'Account number is required',
        });
      if (!data.bankAccountName)
        ctx.addIssue({
          code: 'custom',
          path: ['bankAccountName'],
          message: 'Account holder name is required',
        });
    }
  });

export type AdminVerificationFormData = z.infer<typeof adminVerificationSchema>;
