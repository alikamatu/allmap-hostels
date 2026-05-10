import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/hostels/', '/agents', '/terms', '/privacy', '/feedback', '/login'],
        disallow: [
          '/dashboard/',
          '/api/',
          '/verify-email',
          '/reset-password',
          '/auth/',
          '/onboarding',
          '/payment',
          '/_next/',
          '/__next/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/hostels/', '/agents', '/terms', '/privacy'],
        disallow: ['/dashboard/', '/api/', '/auth/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/hostels/', '/agents', '/terms', '/privacy'],
        disallow: ['/dashboard/', '/api/', '/auth/'],
      },
      // Block known LLM scrapers if you want to opt out (commented by default)
      // { userAgent: 'GPTBot', disallow: '/' },
      // { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
