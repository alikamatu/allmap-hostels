/**
 * SEO Component Utilities
 * Helper functions for adding SEO-friendly features to React components
 */

import Head from 'next/head';
import Script from 'next/script';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  schemaMarkup?: Record<string, any>;
}

/**
 * Generate JSON-LD script tag for structured data
 */
export function generateSchemaScript(schema: Record<string, any>, id: string) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Image alt text patterns for different hostel features
 */
export const IMAGE_ALT_PATTERNS = {
  hostelThumbnail: (hostelName: string) => `${hostelName} hostel - exterior view`,
  room: (roomType: string, hostelName: string) => `${roomType} room at ${hostelName}`,
  amenity: (amenityName: string, hostelName: string) => `${amenityName} amenity at ${hostelName}`,
  review: (reviewerName: string) => `Review from ${reviewerName}`,
  map: (hostelName: string, location: string) => `Map location of ${hostelName} near ${location}`,
  profile: (userName: string) => `Profile picture of ${userName}`,
  logo: () => 'AllMap Hostels logo',
  badge: (badgeName: string) => `${badgeName} badge`,
};

/**
 * SEO-friendly class names for accessibility and semantic HTML
 */
export const SEO_CLASSES = {
  heading: 'text-2xl font-bold md:text-3xl lg:text-4xl',
  subheading: 'text-lg font-semibold md:text-xl lg:text-2xl',
  card: 'p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
  button: 'px-4 py-2 rounded-lg font-medium transition-colors',
  link: 'text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded',
};

/**
 * Generate breadcrumb navigation for better SEO and UX
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${baseUrl}${item.href}` })
    }))
  };
}

/**
 * Keywords for different hostel features for content optimization
 */
export const HOSTEL_FEATURE_KEYWORDS = {
  location: ['walking distance', 'near campus', 'central location', 'convenient location'],
  price: ['affordable', 'budget-friendly', 'competitive price', 'value for money'],
  amenities: ['Wi-Fi', 'laundry', 'common area', 'kitchen', 'parking', 'study room'],
  reviews: ['highly rated', 'positive reviews', 'student approved', '5-star'],
  accessibility: ['accessible', 'wheelchair friendly', 'disability access', 'inclusive'],
};

/**
 * Meta tags for different page types
 */
export const PAGE_TYPE_META = {
  listing: {
    og_type: 'website',
    schema: 'WebSite'
  },
  product: {
    og_type: 'product',
    schema: 'Product'
  },
  article: {
    og_type: 'article',
    schema: 'Article'
  },
  profile: {
    og_type: 'profile',
    schema: 'Person'
  }
};

/**
 * Generate performance hints for better Core Web Vitals
 */
export function getPerformanceHints() {
  return {
    lazy: true,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    srcSet: [
      '(max-width: 640px) /images/[name]-sm.[ext]',
      '(max-width: 1024px) /images/[name]-md.[ext]',
      '/images/[name]-lg.[ext]'
    ].join(', ')
  };
}

/**
 * Sanitize and optimize text for meta descriptions
 */
export function optimizeMetaDescription(text: string, maxLength: number = 160): string {
  // Remove extra whitespace and HTML tags
  let clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  
  // Truncate to max length while preserving words
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
    // Remove last incomplete word
    clean = clean.substring(0, clean.lastIndexOf(' ')) + '...';
  }
  
  return clean;
}

/**
 * Generate optimized page title
 */
export function generatePageTitle(primaryKeyword: string, secondaryKeyword?: string, brandName: string = 'AllMap Hostels'): string {
  const title = secondaryKeyword 
    ? `${primaryKeyword} ${secondaryKeyword} | ${brandName}`
    : `${primaryKeyword} | ${brandName}`;
  
  // Keep title under 60 characters for optimal display
  return title.length > 60 
    ? `${primaryKeyword} | ${brandName}` 
    : title;
}

/**
 * Validate SEO compliance for content
 */
export interface SeoValidation {
  hasH1: boolean;
  hasMetaDescription: boolean;
  hasImages: boolean;
  hasImageAlt: boolean;
  hasInternalLinks: boolean;
  readabilityScore: number;
}

export function validatePageSEO(content: string): Partial<SeoValidation> {
  return {
    hasH1: /<h1/i.test(content),
    hasMetaDescription: /content="[^"]{50,160}"/i.test(content),
    hasImages: /<img|<Image/i.test(content),
    hasImageAlt: /alt="[^"]+"/i.test(content),
    hasInternalLinks: /<a href="\//i.test(content)
  };
}
