import type { Metadata } from "next";
import { BRAND } from "@/_components/brand";
import { LandingPageContent } from "@/_components/landing/LandingPageContent";
import { ownerFaqs, studentFaqs } from "@/_components/landing/landing-content";
import {
  AGENT_ECONOMICS,
  generateFAQSchema,
  generatePageMetadata,
  generateServiceSchema,
  generateAgentHowToSchema,
  SEO_KEYWORDS,
} from "@/lib/seo";
import { generateSchemaScript } from "@/lib/seo-components";

const siteUrl = BRAND.siteUrl;
const canonical = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

export const metadata: Metadata = generatePageMetadata({
  title: "Find & book verified student hostels in Ghana",
  description: `Discover, compare, and book verified student hostels near UPSA, Legon, KNUST, UCC and UEW on ${BRAND.name}. Hostel agents earn ${AGENT_ECONOMICS.currency} ${AGENT_ECONOMICS.agentCommissionPerBooking} per confirmed booking — paid directly to MoMo or bank.`,
  keywords: [
    ...SEO_KEYWORDS.general,
    ...SEO_KEYWORDS.searching.slice(0, 8),
    ...SEO_KEYWORDS.ghana_intents.slice(0, 6),
    ...SEO_KEYWORDS.agents.slice(0, 8),
    `earn GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} per booking`,
    "hostel agent commission Ghana",
    "MTN MoMo hostel payout",
  ],
  url: siteUrl,
  canonicalUrl: canonical,
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
      areaServed: "GH",
      availableLanguage: ["en"],
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
    inLanguage: "en-GH",
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
      {generateSchemaScript(generateServiceSchema(), "ld-json-service")}
      {generateSchemaScript(generateAgentHowToSchema(), "ld-json-howto-agent")}
      {generateSchemaScript(generateFAQSchema(faqItems), "ld-json-faq")}
      <LandingPageContent />
    </>
  );
}
