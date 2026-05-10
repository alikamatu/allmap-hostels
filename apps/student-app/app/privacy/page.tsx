import Link from 'next/link';
import { AGENT_ECONOMICS, generateBreadcrumbSchema } from '@/lib/seo';
import { generateSchemaScript } from '@/lib/seo-components';
import { BRAND } from '@/_components/brand';

const siteUrl = BRAND.siteUrl;
const ADMIN_URL = AGENT_ECONOMICS.adminAppUrl;
const EFFECTIVE_DATE = '10 May 2026';

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Privacy Policy', url: `${siteUrl}/privacy` },
  ]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-black">
      {generateSchemaScript(breadcrumbSchema, 'privacy-breadcrumb')}

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Effective date: {EFFECTIVE_DATE}</p>
      </header>

      <p className="text-sm mb-6">
        This Privacy Policy explains how {BRAND.name} (&quot;AllMap Hostels&quot;,
        &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, discloses, and
        protects your personal information when you use the student site at{' '}
        <a className="underline" href={siteUrl}>{siteUrl}</a> and the hostel admin / agent
        portal at{' '}
        <a className="underline" href={ADMIN_URL} rel="noopener noreferrer">
          {ADMIN_URL}
        </a>.
      </p>

      <p className="text-sm mb-8">
        This policy is written in accordance with the Ghana Data Protection Act,
        2012 (Act 843).
      </p>

      <Section number="1" title="Information We Collect">
        <p className="text-sm">We may collect the following types of information:</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
          <li>Account information such as name, phone number, email address, gender, and school</li>
          <li>Login and authentication details (including Google Sign-In if used)</li>
          <li>For hostel admins / agents: ID documents, hostel ownership / authority documents, and payout details (MoMo number or bank account)</li>
          <li>Booking history, payments, deposits, and reviews</li>
          <li>Search activity, filters, and preferences within the app</li>
          <li>Communication data when you contact us</li>
          <li>Technical data such as device type, browser, IP address, and analytics events</li>
        </ul>
      </Section>

      <Section number="2" title="How We Use Your Information">
        <p className="text-sm">We use your information to:</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
          <li>Create and manage user accounts</li>
          <li>Provide hostel listings, bookings, and payment features</li>
          <li>Verify hostel admins / agents and process commission payouts</li>
          <li>Improve platform performance and user experience</li>
          <li>Communicate booking, payment, and support messages</li>
          <li>Detect and prevent fraud or abuse</li>
        </ul>
      </Section>

      <Section number="3" title="Legal Basis for Processing">
        <p className="text-sm">We process personal data based on one or more of the following lawful grounds:</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
          <li>Your consent</li>
          <li>Performance of a contract (your booking or agent agreement)</li>
          <li>Compliance with legal obligations under Ghanaian law</li>
          <li>Legitimate business interests (fraud prevention, platform security)</li>
        </ul>
      </Section>

      <Section number="4" title="Sharing of Information">
        <p className="text-sm">We do not sell your personal data. We may share information only when necessary with:</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
          <li>Hostel admins for booking or enquiry purposes (limited to what they need to host you)</li>
          <li>
            Payment providers (Paystack and supported MoMo / bank channels) to
            process student booking fees and agent payouts
          </li>
          <li>Service providers who help operate the platform (hosting, email, analytics, error monitoring)</li>
          <li>Law enforcement or regulators when required by law</li>
        </ul>
      </Section>

      <Section number="5" title="Data Retention">
        <p className="text-sm">
          We retain personal data only for as long as necessary to fulfil the purposes outlined
          in this policy or as required by Ghanaian law. Booking and payment records are
          retained for accounting and audit purposes.
        </p>
      </Section>

      <Section number="6" title="Your Rights Under Ghana Law">
        <p className="text-sm">Under the Data Protection Act, you have the right to:</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
          <li>Request access to your personal data</li>
          <li>Request correction or deletion of inaccurate data</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Object to processing in certain circumstances</li>
          <li>Lodge a complaint with the Data Protection Commission of Ghana</li>
        </ul>
      </Section>

      <Section number="7" title="Data Security">
        <p className="text-sm">
          We implement reasonable technical and organisational measures (encryption in transit,
          access controls, audited infrastructure) to protect personal data against unauthorised
          access, loss, or misuse.
        </p>
      </Section>

      <Section number="8" title="Cookies and Analytics">
        <p className="text-sm">
          We use cookies and similar technologies to keep you signed in, remember preferences,
          and understand how the platform is used. Analytics is provided by Vercel Analytics and
          Speed Insights. You can control cookies through your browser settings.
        </p>
      </Section>

      <Section number="9" title="International Transfers">
        <p className="text-sm">
          Some of our service providers may store data outside Ghana. Where this happens, we
          rely on contractual safeguards equivalent to Ghanaian standards.
        </p>
      </Section>

      <Section number="10" title="Children">
        <p className="text-sm">
          The Platform is intended for tertiary students aged 18 or older. If you believe a
          minor has provided us personal data, contact us and we will delete it.
        </p>
      </Section>

      <Section number="11" title="Changes to This Policy">
        <p className="text-sm">
          We may update this Privacy Policy from time to time. Material changes will be
          announced in the app or by email and reflected in the effective date above.
        </p>
      </Section>

      <Section number="12" title="Contact Us">
        <p className="text-sm">
          If you have questions about this Privacy Policy or how we handle your data, please contact us at:
        </p>
        <p className="text-sm mt-2">
          <strong>Email:</strong> {BRAND.supportEmail}
          <br />
          <strong>Hostel admin portal:</strong>{' '}
          <a className="underline" href={ADMIN_URL} rel="noopener noreferrer">{ADMIN_URL}</a>
        </p>
      </Section>

      <div className="flex gap-6 text-sm mt-8">
        <Link href="/" className="underline">Back to Home</Link>
        <Link href="/terms" className="underline">Terms & Conditions</Link>
        <Link href="/agents" className="underline">For Hostel Agents</Link>
      </div>
    </main>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 mb-8" aria-labelledby={`section-${number}`}>
      <h2 id={`section-${number}`} className="text-lg font-bold">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
