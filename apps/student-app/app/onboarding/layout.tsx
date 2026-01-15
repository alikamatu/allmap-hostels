import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

export const metadata: Metadata = {
  title: 'Complete Your Profile | AllMap Hostels',
  description: 'Tell us about yourself and your accommodation preferences to get personalized hostel recommendations.',
  keywords: [
    'onboarding',
    'profile setup',
    'student profile',
    'school selection',
    'emergency contact'
  ],
  openGraph: {
    title: 'Complete Your Profile | AllMap Hostels',
    description: 'Set up your profile to get started with AllMap Hostels.',
    url: `${siteUrl}/onboarding`,
    type: 'website'
  },
  robots: {
    index: false, // Protected page
    follow: false
  }
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
