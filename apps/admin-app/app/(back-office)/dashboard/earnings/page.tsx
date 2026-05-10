'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Pencil,
} from 'lucide-react';
import {
  commissionsApi,
  AgentSummary,
  AgentCommission,
  AgentPayout,
} from '@/service/commissions';

const cedi = (n: number | string) =>
  `GHS ${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    available: 'bg-green-100 text-green-700',
    reserved: 'bg-blue-100 text-blue-700',
    paid: 'bg-gray-100 text-gray-700',
    voided: 'bg-red-100 text-red-600',
    requested: 'bg-blue-100 text-blue-700',
    approved: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
};

interface OverrideForm {
  method: 'momo' | 'bank';
  provider: 'mtn' | 'vodafone' | 'airteltigo';
  phone: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}

const emptyOverride: OverrideForm = {
  method: 'momo',
  provider: 'mtn',
  phone: '',
  accountName: '',
  bankName: '',
  accountNumber: '',
};

export default function EarningsPage() {
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [commissions, setCommissions] = useState<AgentCommission[]>([]);
  const [payouts, setPayouts] = useState<AgentPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<'commissions' | 'payouts'>('commissions');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [useOverride, setUseOverride] = useState(false);
  const [override, setOverride] = useState<OverrideForm>(emptyOverride);
  const [notes, setNotes] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [s, c, p] = await Promise.all([
        commissionsApi.summary(),
        commissionsApi.list(),
        commissionsApi.payouts(),
      ]);
      setSummary(s);
      setCommissions(c);
      setPayouts(p);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const hasVerifiedDestination =
    !!summary?.verifiedPayoutMethod && !!summary?.verifiedPayoutDetails;

  const submitPayout = async () => {
    setSubmitting(true);
    try {
      let body: { method?: 'momo' | 'bank'; destination?: Record<string, any>; notes?: string } = {
        notes: notes || undefined,
      };

      if (useOverride) {
        body.method = override.method;
        body.destination =
          override.method === 'momo'
            ? {
                provider: override.provider,
                phone: override.phone,
                accountName: override.accountName,
              }
            : {
                bankName: override.bankName,
                accountNumber: override.accountNumber,
                accountName: override.accountName,
              };
      }
      // else: omit method+destination → backend pulls from verified user record

      await commissionsApi.requestPayout(body);

      setDialogOpen(false);
      setUseOverride(false);
      setOverride(emptyOverride);
      setNotes('');
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const verifiedPretty = useMemo(() => {
    if (!summary?.verifiedPayoutMethod || !summary?.verifiedPayoutDetails) return null;
    const d = summary.verifiedPayoutDetails;
    if (summary.verifiedPayoutMethod === 'momo') {
      return {
        title: `${(d.provider ?? '').toUpperCase()} Mobile Money`,
        subtitle: d.phone ?? '',
        accountName: d.accountName ?? '',
      };
    }
    return {
      title: d.bankName ?? 'Bank Transfer',
      subtitle: d.accountNumber ?? '',
      accountName: d.accountName ?? '',
    };
  }, [summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <AlertTriangle className="w-10 h-10 mx-auto text-red-500 mb-3" />
        <p className="text-gray-700">{err}</p>
        <button onClick={loadAll} className="mt-4 px-4 py-2 bg-black text-white text-sm">
          Retry
        </button>
      </div>
    );
  }

  const canRequest = (summary?.availableAmount ?? 0) >= 35;

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Earnings & Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">
            You earn GHS 35 every time a student books a room at one of your hostels.
          </p>
        </div>

        <button
          disabled={!canRequest}
          onClick={() => setDialogOpen(true)}
          title={!canRequest ? 'Available balance must be at least GHS 35' : 'Request a payout'}
          className="px-4 py-2 bg-black text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
        >
          Request Payout
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Wallet className="w-5 h-5 text-green-600" />}
          label="Available"
          amount={summary?.availableAmount ?? 0}
          hint="Ready to withdraw"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          label="Pending"
          amount={summary?.pendingAmount ?? 0}
          hint="In 48-hour hold"
        />
        <StatCard
          icon={<Loader2 className="w-5 h-5 text-blue-600" />}
          label="In Payout"
          amount={summary?.reservedAmount ?? 0}
          hint="Awaiting review"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-gray-700" />}
          label="Lifetime Paid"
          amount={summary?.paidAmount ?? 0}
          hint="Total received"
        />
      </div>

      {/* Verified destination on file */}
      {verifiedPretty ? (
        <div className="bg-emerald-50/60 border border-emerald-200 px-4 py-3 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-0.5">
              Payout destination on file
            </p>
            <p className="text-sm text-gray-800 truncate">
              <span className="font-semibold">{verifiedPretty.title}</span>
              {verifiedPretty.subtitle && (
                <span className="text-gray-500"> · {verifiedPretty.subtitle}</span>
              )}
              {verifiedPretty.accountName && (
                <span className="text-gray-500"> · {verifiedPretty.accountName}</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            No verified payout destination on file. Submit your payment details via verification first
            so super-admin can pay you out.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {(['commissions', 'payouts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'commissions' ? (
        <CommissionsTable commissions={commissions} />
      ) : (
        <PayoutsTable payouts={payouts} />
      )}

      {/* Payout request dialog */}
      {dialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !submitting && setDialogOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Request Payout</h3>
            <p className="text-sm text-gray-500 mb-4">
              You'll receive {cedi(summary?.availableAmount ?? 0)} from your available balance.
            </p>

            {/* Verified destination */}
            {hasVerifiedDestination && !useOverride && (
              <div className="border border-emerald-200 bg-emerald-50/50 p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                    Sending To
                  </span>
                  <button
                    onClick={() => setUseOverride(true)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
                  >
                    <Pencil className="w-3 h-3" /> Use a different account
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-900">{verifiedPretty?.title}</p>
                {verifiedPretty?.subtitle && (
                  <p className="text-sm text-gray-700 font-mono">{verifiedPretty.subtitle}</p>
                )}
                {verifiedPretty?.accountName && (
                  <p className="text-sm text-gray-600">{verifiedPretty.accountName}</p>
                )}
              </div>
            )}

            {(!hasVerifiedDestination || useOverride) && (
              <>
                {useOverride && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      One-time destination
                    </span>
                    <button
                      onClick={() => {
                        setUseOverride(false);
                        setOverride(emptyOverride);
                      }}
                      className="text-xs text-gray-500 hover:text-black"
                    >
                      Use verified account
                    </button>
                  </div>
                )}

                <label className="text-xs font-medium text-gray-700 block mb-1">Method</label>
                <select
                  value={override.method}
                  onChange={(e) =>
                    setOverride({ ...override, method: e.target.value as 'momo' | 'bank' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                >
                  <option value="momo">Mobile Money</option>
                  <option value="bank">Bank Transfer</option>
                </select>

                {override.method === 'momo' ? (
                  <>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Network</label>
                    <select
                      value={override.provider}
                      onChange={(e) =>
                        setOverride({ ...override, provider: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                    >
                      <option value="mtn">MTN</option>
                      <option value="vodafone">Vodafone</option>
                      <option value="airteltigo">AirtelTigo</option>
                    </select>

                    <label className="text-xs font-medium text-gray-700 block mb-1">Phone Number</label>
                    <input
                      value={override.phone}
                      onChange={(e) => setOverride({ ...override, phone: e.target.value })}
                      placeholder="0XXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                    />

                    <label className="text-xs font-medium text-gray-700 block mb-1">Account Name</label>
                    <input
                      value={override.accountName}
                      onChange={(e) => setOverride({ ...override, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Bank Name</label>
                    <input
                      value={override.bankName}
                      onChange={(e) => setOverride({ ...override, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                    />

                    <label className="text-xs font-medium text-gray-700 block mb-1">Account Number</label>
                    <input
                      value={override.accountNumber}
                      onChange={(e) => setOverride({ ...override, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                    />

                    <label className="text-xs font-medium text-gray-700 block mb-1">Account Name</label>
                    <input
                      value={override.accountName}
                      onChange={(e) => setOverride({ ...override, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm"
                    />
                  </>
                )}
              </>
            )}

            <label className="text-xs font-medium text-gray-700 block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 mb-4 text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                disabled={submitting}
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 text-sm border border-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={submitPayout}
                className="px-4 py-2 text-sm bg-black text-white disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Payout Request'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  amount,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  hint: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-black">{cedi(amount)}</p>
      <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

function CommissionsTable({ commissions }: { commissions: AgentCommission[] }) {
  if (commissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm border border-gray-200">
        No commissions yet. Earnings appear here when a student books a room at one of your hostels.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2.5">Booking</th>
            <th className="px-4 py-2.5">Hostel</th>
            <th className="px-4 py-2.5">Amount</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Available</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {commissions.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2.5">{c.booking.studentName}</td>
              <td className="px-4 py-2.5 text-gray-500">{c.booking.hostel.name}</td>
              <td className="px-4 py-2.5 font-medium">{cedi(c.amount)}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${statusBadge(c.status)}`}>
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-gray-500">
                {new Date(c.availableAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoutsTable({ payouts }: { payouts: AgentPayout[] }) {
  if (payouts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm border border-gray-200">
        No payout requests yet.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2.5">Date</th>
            <th className="px-4 py-2.5">Amount</th>
            <th className="px-4 py-2.5">Method</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Reference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payouts.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2.5 text-gray-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2.5 font-medium">{cedi(p.amount)}</td>
              <td className="px-4 py-2.5 capitalize text-gray-500">{p.method}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${statusBadge(p.status)}`}>
                  {p.status}
                </span>
                {p.status === 'rejected' && p.rejectionReason && (
                  <p className="text-[11px] text-red-500 mt-0.5">{p.rejectionReason}</p>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{p.transactionRef ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
