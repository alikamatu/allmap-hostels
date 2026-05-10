import {
  AGENT_ECONOMICS,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  generateServiceSchema,
} from '@/lib/seo';

export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://student.allmap-hostels.com';

  // Anchor the Organization schema with agent-portal subdomain so Google
  // associates admin.allmaphostels.com with the same entity (helps E-A-T).
  const organizationSchema = {
    ...generateOrganizationSchema(),
    sameAs: [
      'https://www.facebook.com/allmaphostels',
      'https://www.instagram.com/allmaphostels',
      'https://twitter.com/AllMapHostels',
      AGENT_ECONOMICS.adminAppUrl,
    ],
    subOrganization: {
      '@type': 'Organization',
      name: 'AllMap Hostels Agent Portal',
      url: AGENT_ECONOMICS.adminAppUrl,
      description:
        `Hostel admins and agents in Ghana onboard properties and earn GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} ` +
        'per confirmed student booking.',
    },
  };

  const websiteSchema = generateWebsiteSchema();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Browse Hostels', url: `${siteUrl}/dashboard` },
    { name: 'For Hostel Agents', url: `${siteUrl}/agents` },
    { name: 'Terms & Conditions', url: `${siteUrl}/terms` },
    { name: 'Privacy Policy', url: `${siteUrl}/privacy` },
  ]);

  const serviceSchema = generateServiceSchema();

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
