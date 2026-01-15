import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

export const metadata: Metadata = {
  title: 'Privacy Policy | AllMap Hostels',
  description: 'Learn about how AllMap Hostels collects, uses, and protects your personal information.',
  keywords: [
    'privacy policy',
    'data protection',
    'privacy',
    'terms',
    'legal'
  ],
  openGraph: {
    title: 'Privacy Policy | AllMap Hostels',
    description: 'Our privacy policy and data protection practices.',
    url: `${siteUrl}/privacy`,
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
