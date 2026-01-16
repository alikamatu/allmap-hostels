export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
