import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description:
    'How AllMap Hostels collects, uses, and protects your personal information — for students and hostel agents in Ghana. Compliant with the Data Protection Act, 2012 (Act 843).',
  keywords: [
    'privacy policy',
    'data protection',
    'Ghana Data Protection Act',
    'AllMap Hostels privacy',
    'student data privacy',
    'hostel agent data protection',
  ],
  url: `${siteUrl}/privacy`,
  canonicalUrl: `${siteUrl}/privacy`,
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
