import Image from "next/image";

// ─── Brand Constants ─────────────────────────────────────────────
export const BRAND = {
  name: "AllMap Hostels",
  shortName: "AllMap",
  tagline: "Find & Book Student Accommodation",
  description:
    "Discover verified hostels near your campus. Compare prices, amenities, and reviews. Find your perfect student accommodation with AllMap Hostels.",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "https://student.allmap-hostels.com",
  supportEmail: "support@allmap-hostels.com",
  socials: {
    twitter: "https://twitter.com/AllMapHostels",
    instagram: "https://www.instagram.com/allmaphostels",
    facebook: "https://www.facebook.com/allmaphostels",
  },
  logo: {
    src: "/allmaphostelslogo.png",
    alt: "AllMap Hostels Logo",
    faviconIco: "/favicon.ico",
    favicon16: "/favicon-16x16.png",
    favicon32: "/favicon-32x32.png",
    appleTouchIcon: "/apple-touch-icon.png",
    android192: "/android-chrome-192x192.png",
    android512: "/android-chrome-512x512.png",
  },
  heroImage: "/students.jpg",
  copyright: `© ${new Date().getFullYear()} AllMap Hostels. All rights reserved.`,
} as const;

// ─── Reusable Logo Component ────────────────────────────────────
interface BrandLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function BrandLogo({
  size = 32,
  className = "",
  showText = true,
  textClassName = "",
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={BRAND.logo.src}
        alt={BRAND.logo.alt}
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      {showText && (
        <span
          className={`text-xl font-bold tracking-tight ${textClassName}`}
        >
          {BRAND.name}
        </span>
      )}
    </span>
  );
}

// ─── Brand Mark (icon only, no text) ─────────────────────────────
interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 24, className = "" }: BrandMarkProps) {
  return (
    <Image
      src={BRAND.logo.src}
      alt={BRAND.logo.alt}
      width={size}
      height={size}
      className={`rounded-md ${className}`}
    />
  );
}
