import { z } from 'zod';

export const adminVerificationSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    alternatePhone: z.string().optional(),
    idType: z.string().min(1, 'ID type is required'),
    otherIdType: z.string().optional(),
    idNumber: z.string().min(1, 'ID number is required'),

    // Payout / payment details — required for the GHC 35 commission payouts
    payoutMethod: z.enum(['momo', 'bank'], {
      message: 'Payout method is required',
    }),

    // Mobile money fields
    momoProvider: z.string().optional(),
    momoNumber: z.string().optional(),
    momoAccountName: z.string().optional(),

    // Bank fields
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
        ctx.addIssue({ code: 'custom', path: ['momoProvider'], message: 'Provider is required' });
      if (!data.momoNumber)
        ctx.addIssue({ code: 'custom', path: ['momoNumber'], message: 'MoMo number is required' });
      if (!data.momoAccountName)
        ctx.addIssue({ code: 'custom', path: ['momoAccountName'], message: 'Account holder name is required' });
    }
    if (data.payoutMethod === 'bank') {
      if (!data.bankName)
        ctx.addIssue({ code: 'custom', path: ['bankName'], message: 'Bank name is required' });
      if (!data.bankAccountNumber)
        ctx.addIssue({ code: 'custom', path: ['bankAccountNumber'], message: 'Account number is required' });
      if (!data.bankAccountName)
        ctx.addIssue({ code: 'custom', path: ['bankAccountName'], message: 'Account holder name is required' });
    }
  });

export type AdminVerificationFormData = z.infer<typeof adminVerificationSchema>;
