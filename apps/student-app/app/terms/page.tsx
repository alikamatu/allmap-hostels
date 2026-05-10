import Link from 'next/link';
import { AGENT_ECONOMICS, generateBreadcrumbSchema } from '@/lib/seo';
import { generateSchemaScript } from '@/lib/seo-components';
import { BRAND } from '@/_components/brand';

const siteUrl = BRAND.siteUrl;
const ADMIN_URL = AGENT_ECONOMICS.adminAppUrl;
const EFFECTIVE_DATE = '10 May 2026';

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Terms & Conditions', url: `${siteUrl}/terms` },
  ]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-black">
      {generateSchemaScript(breadcrumbSchema, 'terms-breadcrumb')}

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-500">Effective date: {EFFECTIVE_DATE}</p>
      </header>

      <p className="text-sm mb-6">
        These Terms & Conditions (&quot;Terms&quot;) govern your use of {BRAND.name}
        (&quot;AllMap Hostels&quot;, &quot;the Platform&quot;, &quot;we&quot;, &quot;our&quot;,
        or &quot;us&quot;), including the student site at{' '}
        <a className="underline" href={siteUrl}>{siteUrl}</a> and the hostel
        admin / agent portal at{' '}
        <a className="underline" href={ADMIN_URL} rel="noopener noreferrer">
          {ADMIN_URL}
        </a>. By creating an account or using the Platform you agree to these Terms.
      </p>

      <p className="text-sm mb-8">
        These Terms are governed by the laws of the Republic of Ghana, including
        the Ghana Data Protection Act, 2012 (Act 843).
      </p>

      <Section number="1" title="Definitions">
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Student / User</strong> — a tertiary student in Ghana using the Platform to find or book a hostel.</li>
          <li><strong>Hostel Admin / Agent</strong> — a person or entity that lists and manages a hostel on the admin portal.</li>
          <li><strong>Booking Fee</strong> — the GHC {AGENT_ECONOMICS.studentBookingFee} fee paid by a student to confirm a booking.</li>
          <li><strong>Agent Commission</strong> — GHC {AGENT_ECONOMICS.agentCommissionPerBooking} per confirmed booking, paid to the admin who onboarded the hostel.</li>
          <li><strong>Platform Share</strong> — GHC {AGENT_ECONOMICS.platformShare} retained by AllMap Hostels per confirmed booking.</li>
        </ul>
      </Section>

      <Section number="2" title="Eligibility">
        <p className="text-sm">
          You must be at least 18 years old (or have legal guardian consent) and
          provide accurate information to use the Platform. Hostel admins must be
          legally authorised to list and operate the property they register.
        </p>
      </Section>

      <Section number="3" title="Student Bookings & Booking Fee">
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>
            A non-refundable booking fee of <strong>GHC {AGENT_ECONOMICS.studentBookingFee}</strong> is
            charged per confirmed booking. This is separate from the room rent paid to the hostel.
          </li>
          <li>
            The booking fee secures your room and pays for platform operations,
            verification, and agent commissions.
          </li>
          <li>
            Room rent (semester / monthly fees) is paid directly to the hostel
            according to the schedule shown at checkout.
          </li>
          <li>
            Cancellations: the booking fee is non-refundable except where the
            hostel cancels, the room is unavailable, or AllMap Hostels approves a
            refund based on documented platform error.
          </li>
          <li>
            Bookings auto-cancel if the room balance is not paid by the due date
            communicated at checkout.
          </li>
        </ul>
      </Section>

      <Section number="4" title="Hostel Agent Earning Structure">
        <p className="text-sm mb-3">
          Hostel admins / agents who onboard a property to AllMap Hostels earn a
          commission for every confirmed student booking on a hostel they own or
          manage on the Platform. This is our partnership model in Ghana, designed
          to reward agents who bring real inventory to the platform.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4 text-sm">
          <p className="font-semibold mb-2">Per-booking economics</p>
          <ul className="space-y-1">
            <li>Student pays — <strong>GHC {AGENT_ECONOMICS.studentBookingFee}</strong></li>
            <li>Agent commission — <strong>GHC {AGENT_ECONOMICS.agentCommissionPerBooking}</strong></li>
            <li>Platform share — <strong>GHC {AGENT_ECONOMICS.platformShare}</strong></li>
          </ul>
        </div>

        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>
            Commissions are credited automatically when the student&apos;s booking fee clears.
          </li>
          <li>
            Each commission enters a <strong>{AGENT_ECONOMICS.holdHours}-hour hold window</strong> to
            allow for cancellations, refunds, or fraud review.
          </li>
          <li>
            After the hold expires the commission becomes <em>available</em> and can be requested for payout.
          </li>
          <li>
            Minimum payout request: <strong>GHC {AGENT_ECONOMICS.minimumPayoutAmount}</strong>.
            Payouts are made via {AGENT_ECONOMICS.payoutMethods.join(', ')}.
          </li>
          <li>
            Agents must submit verified payout details (MoMo or bank) during onboarding.
          </li>
          <li>
            Cancelled, refunded, or fraudulent bookings void the related commission.
          </li>
          <li>
            Commission rates may be revised with at least 30 days&apos; notice posted on this page.
          </li>
        </ul>

        <p className="text-sm mt-3">
          Manage your earnings and request payouts at{' '}
          <a className="underline font-medium" href={ADMIN_URL} rel="noopener noreferrer">
            {ADMIN_URL}
          </a>.
        </p>
      </Section>

      <Section number="5" title="Agent Conduct & Anti-Fraud">
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Listings must be accurate — real photos, real prices, real rooms.</li>
          <li>You may not create fake bookings or collude with students to inflate commissions.</li>
          <li>Each hostel must be onboarded by the legitimate owner / authorised manager.</li>
          <li>We may suspend agents and void commissions for breaches of these rules.</li>
          <li>Repeated fraud may be referred to the Ghana Police Service and Economic and Organised Crime Office.</li>
        </ul>
      </Section>

      <Section number="6" title="Platform Verification">
        <p className="text-sm">
          Hostels go through a verification process (ID, proof of authority,
          property details) before being marked as verified. Verification does not
          replace your responsibility to physically inspect or independently
          confirm details before paying any rent to a hostel.
        </p>
      </Section>

      <Section number="7" title="Payments">
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Booking fees are processed via Paystack and supported MoMo / bank channels.</li>
          <li>Agent payouts are issued by AllMap Hostels super-admin after review.</li>
          <li>You are responsible for any taxes payable on commissions you earn.</li>
          <li>We reserve the right to withhold payouts pending fraud review.</li>
        </ul>
      </Section>

      <Section number="8" title="Reviews & User Content">
        <p className="text-sm">
          Reviews must be honest, based on real experience, and follow our
          community standards. We may remove content that is fraudulent,
          defamatory, abusive, or violates the rights of others.
        </p>
      </Section>

      <Section number="9" title="Liability">
        <p className="text-sm">
          AllMap Hostels is a marketplace connecting students and hostels. We are
          not the landlord and do not own the listed properties. Rooms, services,
          and conditions are the responsibility of the hostel. To the maximum
          extent permitted by law, our liability for any claim is limited to the
          booking fee paid for the relevant booking.
        </p>
      </Section>

      <Section number="10" title="Termination">
        <p className="text-sm">
          We may suspend or terminate accounts that violate these Terms. You may
          delete your account at any time by contacting support; commissions
          earned but not yet paid will be honoured if conditions are met.
        </p>
      </Section>

      <Section number="11" title="Changes to These Terms">
        <p className="text-sm">
          We may update these Terms. Material changes will be announced by email
          or in the app. Continued use after the change means you accept the new
          Terms.
        </p>
      </Section>

      <Section number="12" title="Contact">
        <p className="text-sm">
          Email: <strong>{BRAND.supportEmail}</strong>
          <br />
          Hostel admin portal: <a className="underline" href={ADMIN_URL} rel="noopener noreferrer">{ADMIN_URL}</a>
        </p>
      </Section>

      <div className="flex gap-6 text-sm mt-8">
        <Link href="/" className="underline">Back to Home</Link>
        <Link href="/privacy" className="underline">Privacy Policy</Link>
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
