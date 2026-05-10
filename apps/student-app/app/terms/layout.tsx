import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms & Conditions',
  description:
    'AllMap Hostels Terms & Conditions covering student bookings, hostel agent commissions (GHC 35 per booking), payouts, refunds, and platform conduct in Ghana.',
  keywords: [
    'AllMap Hostels terms and conditions',
    'hostel booking terms Ghana',
    'agent commission terms',
    'hostel payout policy',
    'student booking refund policy Ghana',
    'platform terms of service',
  ],
  url: `${siteUrl}/terms`,
  canonicalUrl: `${siteUrl}/terms`,
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
