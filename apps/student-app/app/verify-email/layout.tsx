import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email | AllMap Hostels',
  description: 'Verify your email address to activate your AllMap Hostels account.',
  robots: {
    index: false,
    follow: false
  }
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
