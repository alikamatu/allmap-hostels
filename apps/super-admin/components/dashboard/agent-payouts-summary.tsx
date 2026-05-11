'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { payoutsApi, PayoutOverview, PayoutRow } from '@/services/payouts';

const cedi = (n: number | string) =>
  `GHS ${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor: Record<PayoutRow['status'], string> = {
  requested: 'bg-blue-100 text-blue-700',
  approved: 'bg-purple-100 text-purple-700',
  paid: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function AgentPayoutsSummary() {
  const [overview, setOverview] = useState<PayoutOverview | null>(null);
  const [pending, setPending] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ov, list] = await Promise.all([
          payoutsApi.overview(),
          payoutsApi.list({ status: 'requested' }),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setPending(list);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load payouts';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: 'Pending Payouts',
      value: overview?.pendingPayoutsCount ?? 0,
      hint: cedi(overview?.pendingPayoutsAmount ?? 0),
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      tone: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Commissions Earned',
      value: cedi(overview?.totalCommissionsEarned ?? 0),
      hint: 'All-time',
      icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
      tone: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Commissions Paid',
      value: cedi(overview?.totalCommissionsPaid ?? 0),
      hint: 'Lifetime payouts to agents',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      tone: 'bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-700" />
          <h2 className="text-12 font-semibold text-gray-700">AGENT PAYOUTS</h2>
        </div>
        <Link
          href="/dashboard/payouts"
          className="inline-flex items-center gap-1 text-11 font-medium text-[#ff7a00] hover:underline"
        >
          Manage payouts <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 p-3">
          <p className="text-11 text-red-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 animate-pulse">
              <div className="h-3 bg-gray-200 w-1/3 mb-3" />
              <div className="h-6 bg-gray-200 w-1/2 mb-2" />
              <div className="h-2 bg-gray-100 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {cards.map((c) => (
              <div key={c.label} className={`p-4 border ${c.tone}`}>
                <div className="flex items-center gap-2 mb-2">
                  {c.icon}
                  <span className="text-10 font-semibold text-gray-600 uppercase tracking-wide">
                    {c.label}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">{c.value}</p>
                <p className="text-10 text-gray-500 mt-0.5">{c.hint}</p>
              </div>
            ))}
          </div>

          {/* Pending payouts queue */}
          <div className="bg-white border border-gray-200">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-11 font-semibold text-gray-700">
                Pending Review {pending.length > 0 && <span className="text-gray-400">({pending.length})</span>}
              </span>
              {pending.length > 0 && (
                <Link
                  href="/dashboard/payouts?status=requested"
                  className="text-10 text-[#ff7a00] hover:underline"
                >
                  Review all
                </Link>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="px-4 py-8 text-center text-11 text-gray-500">
                No pending payout requests. ✓
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pending.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/payouts?id=${p.id}`}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-12 font-medium text-gray-900 truncate">
                        {p.agent?.name ?? p.agent?.email ?? 'Unknown agent'}
                      </p>
                      <p className="text-10 text-gray-500">
                        {p.method === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
                        {' · '}
                        {p.commissions.length} commission{p.commissions.length === 1 ? '' : 's'}
                        {' · '}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-12 font-semibold text-gray-900">
                        {cedi(p.amount)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${statusColor[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </Link>
                ))}

                {pending.length > 5 && (
                  <Link
                    href="/dashboard/payouts?status=requested"
                    className="block px-4 py-2.5 text-center text-11 text-[#ff7a00] hover:bg-gray-50"
                  >
                    + {pending.length - 5} more pending
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* By-status breakdown */}
          {overview && overview.payoutsByStatus.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {overview.payoutsByStatus.map((s) => (
                <span
                  key={s.status}
                  className={`inline-flex items-center gap-1.5 text-10 font-medium px-2.5 py-1 ${
                    statusColor[s.status as PayoutRow['status']] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="capitalize">{s.status}</span>
                  <span className="text-gray-500">·</span>
                  <span>{s.count}</span>
                  <span className="text-gray-500">·</span>
                  <span>{cedi(s.amount)}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </motion.section>
  );
}
