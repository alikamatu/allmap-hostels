import { LandingAgents } from "./LandingAgents";
import { LandingContact } from "./LandingContact";
import { LandingFaq } from "./LandingFaq";
import { LandingFeatures } from "./LandingFeatures";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingNav } from "./LandingNav";
import { LandingShell } from "./LandingShell";
import { LandingStats } from "./LandingStats";
import { LandingWhyChoose } from "./LandingWhyChoose";
import { ScrollReveal } from "./ScrollReveal";

export function LandingPageContent() {
  return (
    <LandingShell>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>
      <LandingNav />
      <main id="main-content" role="main">
        <header role="banner">
          <LandingHero />
        </header>
        <LandingStats />
        <LandingFeatures />
        <LandingAgents />
        <LandingHowItWorks />
        <LandingWhyChoose />
        <LandingFaq />
        <LandingContact />
        <LandingFooter />
      </main>
      <ScrollReveal />
    </LandingShell>
  );
}
