import type { Metadata } from "next";
import { BRAND } from "@/_components/brand";
import { LandingPageContent } from "@/_components/landing/LandingPageContent";
import { ownerFaqs, studentFaqs } from "@/_components/landing/landing-content";
import {
  generateFAQSchema,
  generatePageMetadata,
  SEO_KEYWORDS,
} from "@/lib/seo";
import { generateSchemaScript } from "@/lib/seo-components";

const siteUrl = BRAND.siteUrl;

export const metadata: Metadata = generatePageMetadata({
  title: "Find & book verified student hostels",
  description: BRAND.description,
  keywords: [
    ...SEO_KEYWORDS.general,
    ...SEO_KEYWORDS.searching.slice(0, 8),
    ...SEO_KEYWORDS.ghana_intents.slice(0, 6),
  ],
  url: siteUrl,
  canonicalUrl: siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`,
});

function homeOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: siteUrl,
    logo: `${siteUrl}${BRAND.logo.src}`,
    description: BRAND.description,
    sameAs: [
      BRAND.socials.facebook,
      BRAND.socials.instagram,
      BRAND.socials.twitter,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: BRAND.supportEmail,
      url: siteUrl,
    },
  };
}

function homeWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: siteUrl,
    description: BRAND.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl.replace(/\/$/, "")}/hostels?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export default function HomePage() {
  const faqItems = [
    ...studentFaqs.map((f) => ({ question: f.question, answer: f.answer })),
    ...ownerFaqs.map((f) => ({ question: f.question, answer: f.answer })),
  ];

  return (
    <>
      {generateSchemaScript(homeOrganizationSchema(), "ld-json-org")}
      {generateSchemaScript(homeWebSiteSchema(), "ld-json-website")}
      {generateSchemaScript(generateFAQSchema(faqItems), "ld-json-faq")}
      <LandingPageContent />
    </>
  );
}
