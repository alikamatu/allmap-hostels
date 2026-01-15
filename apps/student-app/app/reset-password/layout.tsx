import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | AllMap Hostels',
  description: 'Reset your AllMap Hostels account password securely.',
  robots: {
    index: false,
    follow: false
  }
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
