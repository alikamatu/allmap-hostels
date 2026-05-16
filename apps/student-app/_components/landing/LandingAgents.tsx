import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Clock,
  Smartphone,
  Wallet,
  ChevronRight,
} from "lucide-react";
import {
  ADMIN_APP_URL,
  AGENT_EARNINGS,
  agentValueProps,
  agentPayoutSteps,
} from "./landing-content";
import { SectionHeader } from "./SectionHeader";

const valuePropIcons = [Wallet, Smartphone, Clock, BadgeCheck];

export function LandingAgents() {
  const { currency, studentFee, commission, platformShare, holdHours, minimumPayout, payoutMethods } =
    AGENT_EARNINGS;

  return (
    <section
      id="agents"
      aria-labelledby="agents-heading"
      className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div data-reveal>
          <SectionHeader
            id="agents-heading"
            eyebrow="For hostel owners & agents"
            title={`Earn ${currency} ${commission} every time a student books your hostel`}
            description={`Students pay a one-time ${currency} ${studentFee} access fee. ${currency} ${commission} of that goes straight to your agent wallet — paid out to MoMo or bank within hours of clearance.`}
            icon={<Banknote className="h-4 w-4" aria-hidden />}
          />
        </div>

        {/* Earnings split card */}
        <div
          data-reveal
          className="mt-10 grid gap-4 rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-white p-6 sm:grid-cols-3 sm:p-8"
        >
          <SplitRow
            label="Student pays"
            value={`${currency} ${studentFee}`}
            sub="One-time access fee"
            accent="text-gray-900"
          />
          <SplitRow
            label="You earn"
            value={`${currency} ${commission}`}
            sub="Per confirmed booking"
            accent="text-orange-700"
            highlight
          />
          <SplitRow
            label="Platform"
            value={`${currency} ${platformShare}`}
            sub="Verification, support, ops"
            accent="text-gray-900"
          />
        </div>

        {/* Value props grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agentValueProps.map((prop, idx) => {
            const Icon = valuePropIcons[idx] ?? Wallet;
            return (
              <article
                key={prop.title}
                data-reveal
                style={{ transitionDelay: `${idx * 60}ms` }}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_8px_30px_rgb(0_0_0/0.04)]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700 transition-colors group-hover:bg-orange-100">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {prop.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {prop.body}
                </p>
              </article>
            );
          })}
        </div>

        {/* How payouts work */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div data-reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              How payouts work
            </p>
            <h3 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              From listing to payout in four steps
            </h3>
            <ol className="space-y-5">
              {agentPayoutSteps.map((step, idx) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {step.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ADMIN_APP_URL}
                rel="noopener"
                className="group inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-700"
              >
                Start earning
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/agents"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-orange-600 hover:text-orange-700"
              >
                Full agent guide
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Payout summary card */}
          <aside
            data-reveal
            className="rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-8"
            aria-label="Payout summary"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Payout at a glance
            </p>
            <dl className="space-y-4">
              <KV
                label="Commission per booking"
                value={`${currency} ${commission}`}
              />
              <KV label="Clearance hold" value={`${holdHours} hours`} />
              <KV label="Minimum payout" value={`${currency} ${minimumPayout}`} />
              <KV label="Setup or monthly fees" value="None" />
              <div className="pt-2">
                <dt className="text-xs font-medium text-gray-500">
                  Supported payout methods
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {payoutMethods.map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      <Smartphone className="h-3 w-3 text-orange-600" aria-hidden />
                      {method}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

function SplitRow({
  label,
  value,
  sub,
  accent,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl p-5 transition-colors ${
        highlight ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wider ${
          highlight ? "text-orange-300" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight ${
          highlight ? "text-orange-300" : accent
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${
          highlight ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
