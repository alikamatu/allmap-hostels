import { 
  PaymentMethod, 
  PaymentStatus, 
  PaymentRequest, 
  PaymentResponse,
  Payment as BasePayment 
} from '@repo/types';

export { PaymentMethod, PaymentStatus };
export type { PaymentRequest, PaymentResponse };

export enum PaymentType {
  PAYMENT = 'payment',
  REFUND = 'refund',
}

export type Payment = BasePayment;