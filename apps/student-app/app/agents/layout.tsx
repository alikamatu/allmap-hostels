import { Metadata } from 'next';
import { generatePageMetadata, SEO_KEYWORDS } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

export const metadata: Metadata = generatePageMetadata({
  title: 'List Your Hostel & Earn GHC 35 Per Booking — AllMap Hostels Agents',
  description:
    'Hostel owners and agents in Ghana: list your property on AllMap Hostels and earn GHC 35 for every confirmed student booking. Free to join, secure payouts via MoMo or bank.',
  keywords: [
    ...SEO_KEYWORDS.agents,
    ...SEO_KEYWORDS.ghana_universities.slice(0, 6),
    ...SEO_KEYWORDS.ghana_cities_neighbourhoods.slice(0, 8),
    'list hostel Ghana',
    'hostel agent Ghana',
    'earn from hostel',
    'GHC 35 commission',
  ],
  url: `${siteUrl}/agents`,
  canonicalUrl: `${siteUrl}/agents`,
});

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
