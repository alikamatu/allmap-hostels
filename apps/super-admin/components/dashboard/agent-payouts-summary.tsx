"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { payoutsApi, PayoutOverview, PayoutRow } from "@/services/payouts";

const cedi = (n: number | string) =>
  `GHS ${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor: Record<PayoutRow["status"], string> = {
  requested: "bg-blue-100 text-blue-700",
  approved: "bg-purple-100 text-purple-700",
  paid: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
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
          payoutsApi.list({ status: "requested" }),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setPending(list);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load payouts";
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
      label: "Pending Payouts",
      value: overview?.pendingPayoutsCount ?? 0,
      hint: cedi(overview?.pendingPayoutsAmount ?? 0),
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      tone: "bg-amber-50 border-amber-200",
    },
    {
      label: "Commissions Earned",
      value: cedi(overview?.totalCommissionsEarned ?? 0),
      hint: "All-time",
      icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
      tone: "bg-blue-50 border-blue-200",
    },
    {
      label: "Commissions Paid",
      value: cedi(overview?.totalCommissionsPaid ?? 0),
      hint: "Lifetime payouts to agents",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      tone: "bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Agent Payouts
          </h2>
        </div>
        <Link
          href="/dashboard/payouts"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff7a00] hover:underline"
        >
          Manage payouts <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/80 p-4 animate-pulse"
            >
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-2.5 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            {cards.map((c) => (
              <div key={c.label} className={`p-4 rounded-2xl border ${c.tone}`}>
                <div className="flex items-center gap-2 mb-2">
                  {c.icon}
                  <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {c.label}
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-950">
                  {c.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{c.hint}</p>
              </div>
            ))}
          </div>

          {/* Pending payouts queue */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                Pending Review{" "}
                {pending.length > 0 && (
                  <span className="text-gray-400 font-medium">
                    ({pending.length})
                  </span>
                )}
              </span>
              {pending.length > 0 && (
                <Link
                  href="/dashboard/payouts?status=requested"
                  className="text-xs font-medium text-[#ff7a00] hover:underline"
                >
                  Review all
                </Link>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-500">
                No pending payout requests.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pending.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/payouts?id=${p.id}`}
                    className="px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {p.agent?.name ?? p.agent?.email ?? "Unknown agent"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {p.method === "momo" ? "Mobile Money" : "Bank Transfer"}
                        {" · "}
                        {p.commissions.length} commission
                        {p.commissions.length === 1 ? "" : "s"}
                        {" · "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-950">
                        {cedi(p.amount)}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md capitalize ${statusColor[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </Link>
                ))}

                {pending.length > 5 && (
                  <Link
                    href="/dashboard/payouts?status=requested"
                    className="block px-4 py-2.5 text-center text-xs font-medium text-[#ff7a00] hover:bg-gray-50"
                  >
                    + {pending.length - 5} more pending
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* By-status breakdown */}
          {overview && overview.payoutsByStatus.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {overview.payoutsByStatus.map((s) => (
                <span
                  key={s.status}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                    statusColor[s.status as PayoutRow["status"]] ??
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className="capitalize">{s.status}</span>
                  <span className="opacity-50">·</span>
                  <span>{s.count}</span>
                  <span className="opacity-50">·</span>
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
