import { Metadata } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://student.allmap-hostels.com';

export const metadata: Metadata = {
  title: 'Sign Up | AllMap Hostels',
  description:
    'Create your AllMap Hostels account and start finding the perfect student accommodation near your campus today.',
  openGraph: {
    title: 'Sign Up | AllMap Hostels',
    description: 'Create your account and start your hostel search journey.',
    url: `${siteUrl}/sign-up`,
    type: 'website',
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}