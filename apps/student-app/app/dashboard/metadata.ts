import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Hostels',
  description: 'Browse and filter student hostels near your campus. Compare prices, amenities, and reviews to find the perfect accommodation.',
  keywords: [
    'browse hostels',
    'hostel search',
    'find accommodation',
    'student hostels near me',
    'hostel comparison',
    'affordable student housing',
    'campus accommodation'
  ],
  openGraph: {
    title: 'Browse Hostels | AllMap Hostels',
    description: 'Browse and filter student hostels near your campus.',
    type: 'website'
  },
  robots: {
    index: false, // Protected page - don't index
    follow: false
  }
};

export default function MetadataLayout() {
  return null;
}
