import { PaystackPop } from '@repo/types';

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

export {};
