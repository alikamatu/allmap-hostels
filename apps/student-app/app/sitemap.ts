import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  const now = new Date();

  // Main routes — order by SEO priority
  const mainRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/hostels`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch dynamic hostel routes (these are the high-value pages — students Google
  // a hostel by name and Google should land them on our public hostel page)
  try {
    const res = await fetch(`${apiUrl}/public/hostels`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (res.ok) {
      const hostels = (await res.json()) as Array<{ id: string; updated_at?: string }>;
      const hostelRoutes = hostels.map((hostel) => ({
        url: `${baseUrl}/hostels/${hostel.id}`,
        lastModified: new Date(hostel.updated_at || now),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

      return [...mainRoutes, ...hostelRoutes];
    }
  } catch (error) {
    console.error('Error fetching hostels for sitemap:', error);
  }

  return mainRoutes;
}
