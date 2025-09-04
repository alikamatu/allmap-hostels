import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AllMap Hostels | Student Hostel Booking Platform",
    template: "%s | AllMap Hostels"
  },
  description: "Find, compare, and book student hostels easily. AllMap Hostels helps students discover the best accommodation options near their campus.",
  keywords: [
    "student hostels",
    "hostel booking",
    "accommodation",
    "university housing",
    "student accommodation",
    "campus hostels",
    "AllMap Hostels"
  ],
  authors: [
    { name: "Osama Alikamatu", url: "https://allmap-hostels.com" }
  ],
  creator: "AllMap Hostels",
  openGraph: {
    title: "AllMap Hostels | Student Hostel Booking Platform",
    description: "Find, compare, and book student hostels easily. AllMap Hostels helps students discover the best accommodation options near their campus.",
    url: "https://allmap-hostels.com",
    siteName: "AllMap Hostels",
    images: [
      {
        url: "https://allmap-hostels.com/students.jpg",
        width: 1200,
        height: 630,
        alt: "AllMap Hostels"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AllMap Hostels | Student Hostel Booking Platform",
    description: "Find, compare, and book student hostels easily. AllMap Hostels helps students discover the best accommodation options near their campus.",
    images: ["https://student.allmap-hostels.com/students.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            {/* <Navbar /> */}
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
