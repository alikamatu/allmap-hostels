import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import OnboardingGuard from "./sign-up/OnboardingGuard";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
const ogImageUrl = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AllMap Hostels | Find & Book Student Accommodation",
    template: "%s | AllMap Hostels"
  },
  description: "Discover and book student hostels near your campus. Compare prices, amenities, and reviews. Find your perfect student accommodation with AllMap Hostels - the #1 hostel booking platform for students.",
  keywords: [
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
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AllMap Hostels",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "Student hostel booking platform",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@allmap-hostels.com",
      "url": siteUrl
    },
    "sameAs": [
      "https://www.facebook.com/allmaphostels",
      "https://www.instagram.com/allmaphostels",
      "https://twitter.com/AllMapHostels"
    ]
  };

  // Website structured data for search
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AllMap Hostels",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/dashboard?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Browse Hostels",
        "item": `${siteUrl}/dashboard`
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Additional Performance & SEO Meta Tags */}
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="AllMap" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        
        {/* Structured Data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <OnboardingGuard>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </OnboardingGuard>
        </AuthProvider>
      </body>
    </html>
  );
}