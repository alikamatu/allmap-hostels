/**
 * SEO Utilities for AllMap Hostels Student App
 * Provides helper functions for generating metadata and structured data
 */

import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
const adminAppUrl =
  process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'https://admin.allmaphostels.com';
const ogImageUrl = `${siteUrl}/og-image.jpg`;

/**
 * Single source of truth for the agent earning structure.
 * Used both in user-facing copy and in structured-data schemas so search
 * engines can surface "earn GHC 35 per booking" snippets.
 */
export const AGENT_ECONOMICS = {
  currency: 'GHS',
  studentBookingFee: 100,
  agentCommissionPerBooking: 35,
  platformShare: 65,
  minimumPayoutAmount: 35,
  holdHours: 48,
  payoutMethods: ['MTN MoMo', 'Vodafone Cash', 'AirtelTigo Money', 'Bank Transfer'],
  adminAppUrl,
} as const;

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
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  image?: string | string[];
  rating?: number;
  reviewCount?: number;
  url?: string;
  priceRange?: string;
  basePrice?: number;
  amenities?: string[];
  identifier?: string;
}) {
  const amenityFeatures = (hostel.amenities ?? []).map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: a,
    value: true,
  }));

  return {
    '@context': 'https://schema.org',
    // Use Lodging — the most accurate type for student hostels and well-supported by Google
    '@type': ['Lodging', 'LocalBusiness'],
    name: hostel.name,
    description: hostel.description,
    ...(hostel.identifier && { identifier: hostel.identifier }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: hostel.address,
      addressLocality: hostel.city ?? 'Accra',
      addressRegion: hostel.region ?? 'Greater Accra',
      addressCountry: hostel.country ?? 'GH',
    },
    ...(hostel.latitude != null && hostel.longitude != null && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: hostel.latitude,
        longitude: hostel.longitude,
      },
    }),
    ...(hostel.phone && { telephone: hostel.phone }),
    ...(hostel.email && { email: hostel.email }),
    ...(hostel.image && { image: hostel.image }),
    ...(hostel.url && { url: hostel.url }),
    ...(hostel.priceRange && { priceRange: hostel.priceRange }),
    ...(amenityFeatures.length > 0 && { amenityFeature: amenityFeatures }),
    ...(hostel.basePrice != null && {
      makesOffer: {
        '@type': 'Offer',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: hostel.basePrice,
          priceCurrency: 'GHS',
          unitText: 'per semester',
        },
        availability: 'https://schema.org/InStock',
        url: hostel.url,
      },
    }),
    ...(hostel.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: hostel.rating,
        reviewCount: hostel.reviewCount || 1,
        bestRating: 5,
        worstRating: 1,
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
  ],
  agents: [
    'list hostel on AllMap',
    'hostel agent Ghana',
    'earn money listing hostels',
    'hostel agent commission',
    'become a hostel agent',
    'hostel owner Ghana',
    'list my hostel online',
    'hostel admin platform',
    'hostel marketing platform Ghana',
    'GHC 35 per booking',
    'hostel referral earnings',
    'student housing partner program',
    'AllMap admin portal',
    'admin.allmaphostels.com',
    'manage hostel bookings online',
    'hostel listing platform Ghana',
  ],
  trust_signals: [
    'verified hostel listings',
    'secure payment Paystack',
    'mobile money payments Ghana',
    'protected booking',
    'Ghana Data Protection Act compliant',
    'student-verified reviews',
    '24/7 hostel support',
  ]
};

/**
 * Schema for the AllMap Hostels service marketplace + agent commission program.
 * Search engines can surface this in rich results (FAQs, JobPosting-like snippets).
 */
export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AllMap Hostels Student Booking & Agent Program',
    serviceType: 'Student Hostel Booking and Agent Commission Program',
    provider: {
      '@type': 'Organization',
      name: 'AllMap Hostels',
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Ghana',
    },
    audience: [
      { '@type': 'Audience', audienceType: 'Tertiary Students' },
      { '@type': 'Audience', audienceType: 'Hostel Owners and Agents' },
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Verified hostel booking',
        description:
          `Students pay a one-time GHC ${AGENT_ECONOMICS.studentBookingFee} ` +
          'booking fee to reserve a verified hostel room near their campus.',
        price: AGENT_ECONOMICS.studentBookingFee,
        priceCurrency: AGENT_ECONOMICS.currency,
        category: 'Student Accommodation Booking',
      },
      {
        '@type': 'Offer',
        name: 'Agent commission per booking',
        description:
          `Hostel admins earn GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} ` +
          'for every confirmed booking on a hostel they onboarded. Payouts via ' +
          AGENT_ECONOMICS.payoutMethods.join(', ') + '.',
        price: AGENT_ECONOMICS.agentCommissionPerBooking,
        priceCurrency: AGENT_ECONOMICS.currency,
        category: 'Agent Earnings',
        url: adminAppUrl,
      },
    ],
    url: siteUrl,
  };
}

/**
 * HowTo schema for agents — boosts visibility in Google for queries like
 * "how to become a hostel agent in Ghana".
 */
export function generateAgentHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to earn as a hostel agent on AllMap Hostels',
    description:
      `Onboard your hostel on AllMap Hostels and earn GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} ` +
      'on every confirmed student booking.',
    totalTime: 'P1D',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: AGENT_ECONOMICS.currency,
      value: '0',
    },
    yield: `GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} per confirmed booking`,
    tool: [
      { '@type': 'HowToTool', name: 'Mobile money or bank account' },
      { '@type': 'HowToTool', name: 'Hostel ownership or management documents' },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Sign up on the admin portal',
        text: `Create an account at ${adminAppUrl} and complete your profile.`,
        url: adminAppUrl,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Submit verification & payout details',
        text:
          'Upload your ID and provide your MoMo or bank details so we can pay your commissions directly.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'List your hostel',
        text: 'Add rooms, photos, amenities and prices once verification is approved.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Earn per booking',
        text:
          `Receive GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} for every confirmed student booking. ` +
          `Commissions clear after a ${AGENT_ECONOMICS.holdHours}-hour hold and are paid out by super-admin.`,
      },
    ],
  };
}
