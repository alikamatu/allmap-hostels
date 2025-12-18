/**
 * SEO Utilities for AllMap Hostels Student App
 * Provides helper functions for generating metadata and structured data
 */

import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
const ogImageUrl = `${siteUrl}/og-image.jpg`;

interface PageMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  index?: boolean;
  canonicalUrl?: string;
}

/**
 * Generate metadata for a page
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = ogImageUrl,
    url = siteUrl,
    type = 'website',
    index = true,
    canonicalUrl
  } = options;

  return {
    title: `${title} | AllMap Hostels`,
    description,
    keywords: [...keywords, 'AllMap Hostels', 'student hostels'],
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
    openGraph: {
      title: `${title} | AllMap Hostels`,
      description,
      url,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | AllMap Hostels`,
      description,
      images: [image]
    },
    robots: {
      index,
      follow: true
    }
  };
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AllMap Hostels',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Student hostel booking platform helping students find perfect accommodation near their campus',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@allmap-hostels.com',
      url: siteUrl
    },
    sameAs: [
      'https://www.facebook.com/allmaphostels',
      'https://www.instagram.com/allmaphostels',
      'https://twitter.com/AllMapHostels'
    ]
  };
}

/**
 * Generate JSON-LD structured data for WebSite (with search functionality)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AllMap Hostels',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/dashboard?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    isAccessibleForFree: true
  };
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generate JSON-LD structured data for LocalBusiness (Hostel)
 */
export function generateHostelSchema(hostel: {
  name: string;
  description: string;
  address: string;
  phone?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  url?: string;
  priceRange?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Lodging',
    name: hostel.name,
    description: hostel.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hostel.address
    },
    ...(hostel.phone && { telephone: hostel.phone }),
    ...(hostel.image && { image: hostel.image }),
    ...(hostel.url && { url: hostel.url }),
    ...(hostel.priceRange && { priceRange: hostel.priceRange }),
    ...(hostel.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: hostel.rating,
        reviewCount: hostel.reviewCount || 1
      }
    })
  };
}

/**
 * Generate JSON-LD structured data for FAQPage
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate optimized meta tags for social sharing
 */
export function generateSocialMetaTags(options: PageMetadataOptions) {
  const {
    title,
    description,
    image = ogImageUrl,
    url = siteUrl
  } = options;

  return {
    og: {
      'og:title': `${title} | AllMap Hostels`,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': 'website',
      'og:site_name': 'AllMap Hostels'
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': `${title} | AllMap Hostels`,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:creator': '@AllMapHostels',
      'twitter:site': '@AllMapHostels'
    }
  };
}

/**
 * Get all meta tag names for an array of tags
 */
export function getMetaTagString(tags: Record<string, string>): string {
  return Object.entries(tags)
    .map(([name, content]) => `<meta name="${name}" content="${content}" />`)
    .join('\n');
}

/**
 * Keywords grouped by topic for content optimization
 */
export const SEO_KEYWORDS = {
  general: [
    'student hostels',
    'hostel booking',
    'student accommodation',
    'AllMap Hostels'
  ],
  housing: [
    'university housing',
    'campus accommodation',
    'off-campus housing',
    'student dorms',
    'student housing near campus',
    'affordable student accommodation'
  ],
  searching: [
    'hostel finder',
    'hostel search',
    'find hostels',
    'hostel comparison',
    'best hostels for students',
    'hostels near school'
  ],
  features: [
    'hostel reviews',
    'hostel ratings',
    'hostel prices',
    'hostel amenities',
    'hostel distance filter',
    'hostel map view'
  ],
  ghana_universities: [
    'University of Ghana', 'UG Legon', 'Legon',
    'KNUST', 'Kwame Nkrumah University of Science and Technology',
    'UCC', 'University of Cape Coast',
    'UEW', 'University of Education Winneba',
    'UDS', 'University for Development Studies',
    'UPSA', 'University of Professional Studies Accra',
    'GIMPA', 'Ashesi University', 'Central University',
    'Koforidua Technical University', 'Takoradi Technical University',
    'Ho Technical University', 'Sunyani Technical University'
  ],
  ghana_cities_neighbourhoods: [
    // Accra / UG
    'Accra hostels', 'East Legon hostels', 'North Legon hostels', 'Madina hostels', 'Adenta hostels', 'Haatso hostels', 'Atomic hostels', 'Bawaleshie hostels',
    // Kumasi / KNUST
    'Kumasi hostels', 'Ayeduase hostels', 'Bomso hostels', 'Kentinkrono hostels', 'Tech Junction hostels', 'Ayigya hostels', 'Tanoso hostels',
    // Cape Coast / UCC
    'Cape Coast hostels', 'Kwaprow hostels', 'Amamoma hostels', 'Apewosika hostels',
    // Winneba / UEW
    'Winneba hostels', 'North Campus hostels', 'South Campus hostels',
    // Tamale / UDS
    'Tamale hostels', 'Dungu hostels',
    // Other
    'Koforidua hostels', 'Adweso hostels', 'Takoradi hostels', 'Anaji hostels', 'Kwesimintsim hostels', 'Ho hostels', 'Bankoe hostels', 'Sunyani hostels', 'Fiapre hostels'
  ],
  ghana_intents: [
    'cheap student hostels Ghana', 'affordable hostels near campus', 'hostels near university Ghana', 'off campus hostels Ghana',
    'UG hostels off campus', 'KNUST private hostels', 'UCC hostels list', 'UEW hostels near campus',
    'best hostels for students Ghana', 'top student hostels Accra', 'secure student hostels', 'female only hostels', 'male only hostels'
  ],
  ghana_features: [
    'self-contained room', 'single room hostel', 'shared room hostel', 'chamber and hall', 'apartment near campus',
    'wifi hostel', 'constant water', 'constant light', 'CCTV', 'security', 'gated hostel', 'study area', 'kitchen', 'laundry', 'parking', 'air conditioning', 'fan', 'prepaid meter'
  ],
  ghana_price_terms: [
    'hostel price per semester', 'hostel price per month', 'hostel fees UG', 'KNUST hostel prices', 'UCC hostel fees', 'cheap hostels under 3000 GHS', 'hostel 1,500 GHS per semester',
    'deposit required hostel', 'installment payment hostel', 'mobile money hostel payment', 'momo hostel payment'
  ],
  ghana_booking_terms: [
    'how to book hostel', 'hostel booking online Ghana', 'reserve hostel room UG', 'KNUST hostel booking portal', 'UCC hostel registration', 'UEW hostel allocation'
  ],
  ghana_long_tail_templates: [
    'hostels near {university}',
    'cheap student hostels in {city}',
    '{neighbourhood} hostels near {university}',
    'self-contained hostels near {campus}',
    'female only hostels in {city}',
    'hostel with wifi near {university}',
    'secure gated hostels near {campus}',
    'hostel prices {university}',
    'best student hostels in {city}',
    'off-campus accommodation near {university}'
  ],
  ghana_entities_examples: [
    'Evandy hostel UG', 'TF hostel UG', 'Pent hall UG (private hostels)', 'Akuafo hall annex hostels',
    'Ayeduase hostels KNUST', 'Kentinkrono private hostels KNUST', 'Amamoma hostels UCC', 'Apewosika hostels UCC'
  ],
  ghana_misspellings_synonyms: [
    'hostle', 'hostels accomodation', 'accomodation near campus', 'student hostel accra', 'ug legon hostel', 'knust hostel', 'ucc hostel', 'uew hostel'
  ]
};
