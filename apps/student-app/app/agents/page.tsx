import Link from 'next/link';
import {
  AGENT_ECONOMICS,
  generateAgentHowToSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo';
import { generateSchemaScript } from '@/lib/seo-components';
import { BRAND, BrandLogo } from '@/_components/brand';
import { ownerFaqs } from '@/_components/landing/landing-content';

const siteUrl = BRAND.siteUrl;
const ADMIN_URL = AGENT_ECONOMICS.adminAppUrl;

const agentFaqs = [
  {
    question: 'How much do I earn per booking?',
    answer:
      `You earn GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} for every confirmed student booking on a hostel you onboarded. ` +
      `The student pays a GHC ${AGENT_ECONOMICS.studentBookingFee} platform booking fee, of which GHC ${AGENT_ECONOMICS.agentCommissionPerBooking} goes to you and ` +
      `GHC ${AGENT_ECONOMICS.platformShare} covers AllMap Hostels operations, verification, and student support.`,
  },
  {
    question: 'When do I get paid?',
    answer:
      `Each commission has a ${AGENT_ECONOMICS.holdHours}-hour hold to absorb refunds and fraud reviews. After the hold, the commission becomes ` +
      `available and you can request a payout from the admin portal at ${ADMIN_URL}. Minimum payout is GHC ${AGENT_ECONOMICS.minimumPayoutAmount}.`,
  },
  {
    question: 'How am I paid?',
    answer:
      `Via ${AGENT_ECONOMICS.payoutMethods.join(', ')}  whichever you registered during verification. ` +
      'You can change your payout method by contacting support.',
  },
  {
    question: 'Is there any cost to join?',
    answer:
      'No. Listing your hostel and managing bookings on the AllMap Hostels admin portal is free. ' +
      'Verification only requires standard ID and proof of authority over the hostel.',
  },
  {
    question: 'What if a booking is cancelled?',
    answer:
      'If a booking is cancelled before check-in, the related commission is voided. ' +
      'This protects students and keeps the platform fair.',
  },
  {
    question: 'Can I list multiple hostels?',
    answer:
      'Yes. Each verified hostel you onboard earns commissions independently when students book it.',
  },
  ...ownerFaqs.map((f) => ({ question: f.question, answer: f.answer })),
];

export default function AgentsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'For Hostel Agents', url: `${siteUrl}/agents` },
  ]);

  const faqSchema = generateFAQSchema(agentFaqs);
  const howToSchema = generateAgentHowToSchema();

  return (
    <main className="bg-white text-black font-sans">
      {generateSchemaScript(breadcrumbSchema, 'agents-breadcrumb')}
      {generateSchemaScript(faqSchema, 'agents-faq')}
      {generateSchemaScript(howToSchema, 'agents-howto')}

      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" aria-label="AllMap Hostels home">
            <BrandLogo size={32} />
          </Link>
          <div className="flex items-center space-x-4 text-sm">
            <Link href="/" className="hidden sm:inline text-gray-600 hover:text-black">
              For Students
            </Link>
            <a
              href={`${ADMIN_URL}/sign-up`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800"
            >
              Become an Agent
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="inline-block text-[11px] font-bold uppercase tracking-widest bg-orange-50 text-[#FF6A00] px-3 py-1 rounded-full mb-5">
            Hostel Agent Program  Ghana
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-5">
            List your hostel.
            <br />
            Earn{' '}
            <span className="text-[#FF6A00]">
              GHC {AGENT_ECONOMICS.agentCommissionPerBooking}
            </span>{' '}
            per booking.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            AllMap Hostels pays hostel owners and agents in Ghana for every confirmed student
            booking. Onboard your property in minutes, manage bookings online, and get paid
            directly to MoMo or bank.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`${ADMIN_URL}/sign-up`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-7 py-4 rounded-full font-bold hover:bg-gray-800 text-base"
            >
              Sign up at {ADMIN_URL.replace('https://', '')}
            </a>
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 text-black px-7 py-4 rounded-full font-bold hover:bg-gray-50 text-base"
            >
              I already have an account
            </a>
          </div>
        </div>
      </section>

      {/* Earning breakdown */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3">
            How the math works
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Transparent revenue split. No hidden fees, no commission tiers, no surprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              eyebrow="Student pays"
              amount={`GHC ${AGENT_ECONOMICS.studentBookingFee}`}
              caption="One-time booking fee"
            />
            <Card
              eyebrow="You earn"
              amount={`GHC ${AGENT_ECONOMICS.agentCommissionPerBooking}`}
              caption="Per confirmed booking"
              highlight
            />
            <Card
              eyebrow="AllMap operations"
              amount={`GHC ${AGENT_ECONOMICS.platformShare}`}
              caption="Platform, verification, support"
            />
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Room rent (semester / monthly) is paid by the student directly to your hostel.
            The booking fee above is separate.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">
            Get paid in 4 steps
          </h2>

          <ol className="space-y-6">
            <Step
              n="1"
              title="Sign up on the admin portal"
              body={
                <>
                  Create an account at{' '}
                  <a className="underline" href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
                    {ADMIN_URL}
                  </a>
                  . Verify your email and complete your profile.
                </>
              }
            />
            <Step
              n="2"
              title="Submit verification & payment details"
              body={
                <>
                  Upload your ID and proof of authority over the hostel. Add your{' '}
                  <strong>{AGENT_ECONOMICS.payoutMethods.join(' / ')}</strong> details so we know
                  where to send your earnings.
                </>
              }
            />
            <Step
              n="3"
              title="List your hostel"
              body="Add rooms, photos, amenities, prices. Verified listings appear on the student site and rank in Google for nearby hostel searches."
            />
            <Step
              n="4"
              title="Earn per booking"
              body={
                <>
                  Every confirmed booking credits <strong>GHC {AGENT_ECONOMICS.agentCommissionPerBooking}</strong> to your wallet.
                  After a {AGENT_ECONOMICS.holdHours}-hour clearance period, request a payout
                  minimum GHC {AGENT_ECONOMICS.minimumPayoutAmount}.
                </>
              }
            />
          </ol>
        </div>
      </section>

      {/* Why list with us */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">
            Why agents pick AllMap Hostels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              title="Real commission per booking"
              body="Most platforms only give you a listing slot. We pay you cash for every booking on your hostel."
            />
            <Feature
              title="Direct payouts"
              body={`MoMo (MTN, Vodafone, AirtelTigo) or bank transfer. No middleman, no agent cuts.`}
            />
            <Feature
              title="Built for Ghana"
              body="Designed around Ghanaian universities, payment habits, and the hostel market  not a generic global tool."
            />
            <Feature
              title="Verified students"
              body="Students verify before booking, so you deal with serious tenants, not casual browsers."
            />
            <Feature
              title="Anti-fraud built in"
              body="Hold windows, void rules, and dispute reviews protect honest agents and keep the marketplace clean."
            />
            <Feature
              title="Free to join"
              body="No setup fee, no monthly subscription. You only earn  we cover the rest."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {agentFaqs.map((faq, i) => (
              <details
                key={`faq-${i}`}
                className="group border border-gray-200 rounded-xl px-5 py-4 cursor-pointer hover:border-gray-300"
              >
                <summary className="font-semibold text-base list-none flex justify-between items-center">
                  {faq.question}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-black text-white text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-4">
          Start earning this week
        </h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Onboarding takes less than a day. Your first booking pays out within{' '}
          {AGENT_ECONOMICS.holdHours} hours of confirmation.
        </p>
        <a
          href={`${ADMIN_URL}/sign-up`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#FF6A00] text-white px-8 py-4 rounded-full font-bold hover:bg-[#E55E00] text-base"
        >
          Become an Agent
        </a>
        <p className="text-xs text-gray-500 mt-4">
          Or visit{' '}
          <a className="underline" href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
            {ADMIN_URL}
          </a>{' '}
          directly
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-gray-500">
          <BrandLogo size={20} />
          <div className="flex gap-5">
            <Link href="/" className="hover:text-black">For Students</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-black">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Card({
  eyebrow,
  amount,
  caption,
  highlight,
}: {
  eyebrow: string;
  amount: string;
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${highlight
          ? 'bg-black text-white shadow-xl shadow-black/10'
          : 'bg-white border border-gray-200'
        }`}
    >
      <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${highlight ? 'text-[#FF6A00]' : 'text-gray-500'}`}>
        {eyebrow}
      </p>
      <p className="text-3xl font-black mb-2">{amount}</p>
      <p className={`text-sm ${highlight ? 'text-gray-300' : 'text-gray-500'}`}>{caption}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex gap-5 items-start">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF6A00] text-white font-black flex items-center justify-center">
        {n}
      </span>
      <div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}
