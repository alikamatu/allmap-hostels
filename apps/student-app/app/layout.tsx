import { AuthProvider, ThemeProvider } from '@repo/shared/context';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeadScripts from "./head";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
const ogImageUrl = `${siteUrl}/og-image.jpg`;

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AllMap Hostels | Find & Book Student Accommodation",
    template: "%s | AllMap Hostels"
  },
  description: "Find and book verified student hostels in Ghana — Legon, KNUST, UCC, UEW, and more. Compare prices, amenities, and reviews. Hostel owners can list their property on admin.allmaphostels.com and earn GHC 35 on every confirmed booking.",
  keywords: [
    // Student-facing
    "student hostels",
    "hostel booking",
    "student accommodation",
    "university housing",
    "campus hostels",
    "cheap hostels for students",
    "best student accommodation",
    "hostel finder",
    "student dorms",
    "off-campus housing",
    "hostel comparison",
    "accommodation near campus",
    "hostels Ghana",
    "Accra hostels",
    "Legon hostels",
    "KNUST hostels",
    "UCC hostels",
    "UEW hostels",
    // Agent/owner-facing
    "list hostel Ghana",
    "hostel agent commission",
    "earn from hostel listings",
    "GHC 35 per booking",
    "admin.allmaphostels.com",
    "hostel owner portal Ghana",
    "AllMap Hostels"
  ],
  authors: [
    { name: "Osama Alikamatu", url: "https://allmap-hostels.com" }
  ],
  creator: "AllMap Hostels",
  publisher: "AllMap Hostels",
  applicationName: "AllMap Hostels",
  category: "Accommodation Booking",
  classification: "Student Accommodation Booking Platform",
  openGraph: {
    title: "AllMap Hostels | Find & Book Student Accommodation",
    description: "Discover and book student hostels near your campus. Compare prices, amenities, and reviews on AllMap Hostels.",
    url: siteUrl,
    siteName: "AllMap Hostels",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "AllMap Hostels - Student Hostel Booking Platform",
        type: "image/jpeg"
      },
      {
        url: `${siteUrl}/og-image-square.jpg`,
        width: 800,
        height: 800,
        alt: "AllMap Hostels"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AllMap Hostels | Find & Book Student Accommodation",
    description: "Discover and book student hostels near your campus. Compare prices, amenities, and reviews.",
    images: {
      url: ogImageUrl,
      alt: "AllMap Hostels"
    },
    creator: "@AllMapHostels",
    site: "@AllMapHostels"
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AllMap Hostels"
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
    date: true,
    url: true
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "AllMap",
    "x-ua-compatible": "ie=edge"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <HeadScripts />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://admin.allmaphostels.com" />
        {/* Help Google understand the agent portal is part of the same brand */}
        <link rel="alternate" href="https://admin.allmaphostels.com" hrefLang="en-gh" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}