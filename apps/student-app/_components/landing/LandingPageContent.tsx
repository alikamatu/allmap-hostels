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

export function LandingPageContent() {
  return (
    <LandingShell>
      <LandingNav />
      <main id="main-content" role="main">
        <header role="banner">
          <LandingHero />
        </header>
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingWhyChoose />
        <LandingFaq />
        <LandingContact />
        <LandingFooter />
      </main>
    </LandingShell>
  );
}
