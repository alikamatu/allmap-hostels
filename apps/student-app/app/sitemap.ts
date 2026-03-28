import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

  // Main routes
  const mainRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login?tab=signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reset-password`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch dynamic hostel routes
  try {
    const res = await fetch(`${apiUrl}/public/hostels`, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (res.ok) {
      const hostels = (await res.json()) as Array<{ id: string; updated_at?: string }>;
      const hostelRoutes = hostels.map((hostel) => ({
        url: `${baseUrl}/hostels/${hostel.id}`,
        lastModified: new Date(hostel.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      
      return [...mainRoutes, ...hostelRoutes];
    }
  } catch (error) {
    console.error('Error fetching hostels for sitemap:', error);
  }

  return mainRoutes;
}
