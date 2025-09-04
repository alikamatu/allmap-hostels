import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Head from "next/head";

const fontMont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400"]
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
})

export const metadata: Metadata = {
  title: {
    default: "AllMap Hostel Admin Dashboard",
    template: "%s | AllMap Hostel Admin"
  },
  description: "Admin dashboard for managing hostels, rooms, bookings, and student accommodation on AllMap Hostels.",
  keywords: [
    "hostel admin",
    "hostel management",
    "booking management",
    "student accommodation",
    "AllMap Hostels",
    "admin dashboard"
  ],
  authors: [
    { name: "AllMap Hostels Team", url: "https://allmap-hostels.com" }
  ],
  creator: "AllMap Hostels",
  openGraph: {
    title: "AllMap Hostel Admin Dashboard",
    description: "Admin dashboard for managing hostels, rooms, bookings, and student accommodation on AllMap Hostels.",
    url: "https://allmap-hostels.com/admin",
    siteName: "AllMap Hostels Admin",
    images: [
      {
        url: "https://allmap-hostels.com/og-image-admin.png",
        width: 1200,
        height: 630,
        alt: "AllMap Hostels Admin"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AllMap Hostel Admin Dashboard",
    description: "Admin dashboard for managing hostels, rooms, bookings, and student accommodation on AllMap Hostels.",
    images: ["https://allmap-hostels.com/og-image-admin.png"]
  },
  robots: {
    index: false,
    follow: false,
    nocache: true
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval' 'unsafe-inline'; 
          style-src 'self' 'unsafe-inline'; 
          media-src *; 
          connect-src *"
        />
      </Head>
      <body
        className={`${fontMont.variable} ${interFont.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
