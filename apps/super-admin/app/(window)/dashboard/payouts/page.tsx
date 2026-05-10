'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  payoutsApi,
  PayoutOverview,
  PayoutRow,
  PayoutDetail,
  CommissionRow,
  HostelRollupRow,
} from '@/services/payouts';

const cedi = (n: number | string) =>
  `GHS ${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    requested: 'bg-blue-100 text-blue-700',
    approved: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
    pending: 'bg-yellow-100 text-yellow-700',
    available: 'bg-emerald-100 text-emerald-700',
    reserved: 'bg-blue-100 text-blue-700',
    voided: 'bg-red-100 text-red-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
};

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'All' },
  { key: 'requested', label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'paid', label: 'Paid' },
  { key: 'rejected', label: 'Rejected' },
];

const COMMISSION_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending (in hold)' },
  { key: 'available', label: 'Available' },
  { key: 'reserved', label: 'In Payout' },
  { key: 'paid', label: 'Paid' },
  { key: 'voided', label: 'Voided' },
];

export default function AgentPayoutsPage() {
  const [tab, setTab] = useState<'payouts' | 'commissions' | 'hostels'>('payouts');
  const [overview, setOverview] = useState<PayoutOverview | null>(null);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [filter, setFilter] = useState<string>('requested');
  const [methodFilter, setMethodFilter] = useState<'' | 'momo' | 'bank'>('');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<PayoutDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkPaidDialog, setBulkPaidDialog] = useState(false);
  const [bulkRef, setBulkRef] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');

  // Commissions tab state
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [commissionFilter, setCommissionFilter] = useState<string>('');
  const [commissionLoading, setCommissionLoading] = useState(false);

  // By-hostel tab state
  const [hostels, setHostels] = useState<HostelRollupRow[]>([]);
  const [hostelsLoading, setHostelsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [o, p] = await Promise.all([
        payoutsApi.overview(),
        payoutsApi.list({
          status: filter || undefined,
          method: methodFilter || undefined,
          search: search || undefined,
          minAmount: minAmount ? Number(minAmount) : undefined,
          maxAmount: maxAmount ? Number(maxAmount) : undefined,
        }),
      ]);
      setOverview(o);
      setPayouts(p);
      setSelectedIds(new Set()); // Reset selections after reload
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const loadCommissions = async () => {
    setCommissionLoading(true);
    try {
      const list = await payoutsApi.listCommissions(commissionFilter || undefined);
      setCommissions(list);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load commissions');
    } finally {
      setCommissionLoading(false);
    }
  };

  const loadHostels = async () => {
    setHostelsLoading(true);
    try {
      const list = await payoutsApi.byHostel();
      setHostels(list);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to load by-hostel rollup');
    } finally {
      setHostelsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, methodFilter]);

  // Debounced reload when text/amount filters change
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minAmount, maxAmount]);

  // Selection helpers
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => {
    const eligible = payouts.filter((p) => p.status === 'requested' || p.status === 'approved');
    if (selectedIds.size === eligible.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligible.map((p) => p.id)));
    }
  };

  const selectedRows = payouts.filter((p) => selectedIds.has(p.id));
  const selectedTotal = selectedRows.reduce((sum, r) => sum + Number(r.amount), 0);

  const onBulkApprove = async () => {
    if (!confirm(`Approve ${selectedIds.size} payout request${selectedIds.size === 1 ? '' : 's'}?`)) return;
    setBulkActionLoading(true);
    try {
      const r = await payoutsApi.bulkApprove(Array.from(selectedIds));
      alert(`Approved ${r.approved} of ${r.requested} payouts.`);
      await load();
    } catch (e: any) {
      alert(e.message ?? 'Bulk approve failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const onBulkMarkPaid = async () => {
    if (!bulkRef.trim()) return;
    setBulkActionLoading(true);
    try {
      const r = await payoutsApi.bulkMarkPaid(Array.from(selectedIds), bulkRef.trim(), bulkNotes || undefined);
      alert(`Marked ${r.paid} of ${r.requested} payouts as paid.`);
      setBulkPaidDialog(false);
      setBulkRef('');
      setBulkNotes('');
      await load();
    } catch (e: any) {
      alert(e.message ?? 'Bulk mark-paid failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  /**
   * Export selected payouts as CSV — generic format that's easy to paste into
   * Paystack bulk transfer, MoMo merchant tools, or a bank's bulk transfer file.
   */
  const onExportCsv = () => {
    const rows = selectedRows.length > 0 ? selectedRows : payouts;
    if (rows.length === 0) {
      alert('No payouts to export');
      return;
    }

    const headers = [
      'payout_id',
      'agent_name',
      'agent_email',
      'agent_phone',
      'method',
      'momo_provider',
      'momo_number',
      'bank_name',
      'bank_account_number',
      'account_name',
      'amount_ghs',
      'commission_count',
      'requested_at',
      'status',
    ];

    const csvRows = rows.map((p) => {
      const d = p.destination ?? {};
      return [
        p.id,
        p.agent?.name ?? '',
        p.agent?.email ?? '',
        p.agent?.phone ?? '',
        p.method,
        p.method === 'momo' ? d.provider ?? '' : '',
        p.method === 'momo' ? d.phone ?? '' : '',
        p.method === 'bank' ? d.bankName ?? '' : '',
        p.method === 'bank' ? d.accountNumber ?? '' : '',
        d.accountName ?? '',
        Number(p.amount).toFixed(2),
        p.commissions.length,
        new Date(p.createdAt).toISOString(),
        p.status,
      ];
    });

    const escape = (v: any) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [headers, ...csvRows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (tab === 'commissions') loadCommissions();
    if (tab === 'hostels') loadHostels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, commissionFilter]);

  const onReleaseCommission = async (id: string) => {
    if (!confirm('Release this commission immediately? The hold window will be skipped.')) return;
    try {
      await payoutsApi.releaseCommission(id);
      await Promise.all([loadCommissions(), load()]);
    } catch (e: any) {
      alert(e.message ?? 'Failed to release commission');
    }
  };

  const onVoidCommission = async (id: string) => {
    const reason = prompt('Reason for voiding this commission?');
    if (!reason) return;
    try {
      await payoutsApi.voidCommission(id, reason);
      await Promise.all([loadCommissions(), load()]);
    } catch (e: any) {
      alert(e.message ?? 'Failed to void commission');
    }
  };

  const openDetail = async (id: string) => {
    try {
      const detail = await payoutsApi.get(id);
      setSelected(detail);
    } catch (e: any) {
      alert(e.message ?? 'Failed to load payout');
    }
  };

  const refreshAfterAction = async () => {
    setSelected(null);
    await load();
  };

  const onApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await payoutsApi.approve(selected.id);
      await refreshAfterAction();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const onReject = async () => {
    if (!selected) return;
    const reason = prompt('Rejection reason:');
    if (!reason || reason.length < 3) return;
    setActionLoading(true);
    try {
      await payoutsApi.reject(selected.id, reason);
      await refreshAfterAction();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const onMarkPaid = async () => {
    if (!selected) return;
    const ref = prompt('Transaction reference (MoMo / bank transfer ref):');
    if (!ref) return;
    setActionLoading(true);
    try {
      await payoutsApi.markPaid(selected.id, ref);
      await refreshAfterAction();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !payouts.length) {
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
        <button onClick={load} className="mt-4 px-4 py-2 bg-black text-white text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Agent Payouts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve commission payouts to hostel agents.
        </p>
      </div>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Wallet className="w-5 h-5 text-green-600" />}
            label="Total Earned"
            amount={overview.totalCommissionsEarned}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-gray-700" />}
            label="Total Paid Out"
            amount={overview.totalCommissionsPaid}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            label="Awaiting Action"
            amount={overview.pendingPayoutsAmount}
            hint={`${overview.pendingPayoutsCount} requests`}
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-yellow-600" />}
            label="Outstanding"
            amount={overview.totalCommissionsEarned - overview.totalCommissionsPaid}
          />
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {(['payouts', 'commissions', 'hostels'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            {t === 'payouts'
              ? 'Payout Requests'
              : t === 'commissions'
                ? 'Commissions Ledger'
                : 'By Hostel'}
          </button>
        ))}
      </div>

      {tab === 'payouts' && (
        <>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key || 'all'}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  filter === f.key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Advanced filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            <input
              type="text"
              placeholder="Search agent or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-sm col-span-2"
            />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as '' | 'momo' | 'bank')}
              className="px-3 py-2 border border-gray-300 text-sm"
            >
              <option value="">All methods</option>
              <option value="momo">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
            </select>
            <input
              type="number"
              placeholder="Min amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-sm"
            />
            <input
              type="number"
              placeholder="Max amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="px-3 py-2 border border-gray-300 text-sm"
            />
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="bg-gray-900 text-white px-4 py-3 mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">
                <strong>{selectedIds.size}</strong> selected · {cedi(selectedTotal)}
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={onExportCsv}
                  disabled={bulkActionLoading}
                  className="px-3 py-1.5 bg-white text-black text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                >
                  Export CSV
                </button>
                <button
                  onClick={onBulkApprove}
                  disabled={bulkActionLoading}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => setBulkPaidDialog(true)}
                  disabled={bulkActionLoading}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Mark Paid (with batch ref)
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-xs text-gray-300 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <PayoutsTable
            payouts={payouts}
            onClick={openDetail}
            selectedIds={selectedIds}
            onToggle={toggleRow}
            onToggleAll={toggleAll}
          />
        </>
      )}

      {tab === 'commissions' && (
        <>
          {/* Commission filter chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {COMMISSION_FILTERS.map((f) => (
              <button
                key={f.key || 'all'}
                onClick={() => setCommissionFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  commissionFilter === f.key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <CommissionsTable
            commissions={commissions}
            loading={commissionLoading}
            onRelease={onReleaseCommission}
            onVoid={onVoidCommission}
          />
        </>
      )}

      {tab === 'hostels' && (
        <ByHostelTable hostels={hostels} loading={hostelsLoading} />
      )}

      {/* Detail dialog */}
      {selected && (
        <DetailDialog
          payout={selected}
          actionLoading={actionLoading}
          onClose={() => setSelected(null)}
          onApprove={onApprove}
          onReject={onReject}
          onMarkPaid={onMarkPaid}
        />
      )}

      {/* Bulk mark-paid dialog */}
      {bulkPaidDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !bulkActionLoading && setBulkPaidDialog(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Mark {selectedIds.size} payout{selectedIds.size === 1 ? '' : 's'} as paid</h3>
            <p className="text-sm text-gray-500 mb-4">
              Total: <strong>{cedi(selectedTotal)}</strong>. Send the money externally first
              (Paystack / MoMo / bank), then enter the batch reference below to record it.
            </p>

            <label className="text-xs font-medium text-gray-700 block mb-1">
              Batch transaction reference *
            </label>
            <input
              autoFocus
              value={bulkRef}
              onChange={(e) => setBulkRef(e.target.value)}
              placeholder="e.g. paystack_batch_2026_05_10 or 0500123456"
              className="w-full px-3 py-2 border border-gray-300 mb-3 text-sm font-mono"
            />

            <label className="text-xs font-medium text-gray-700 block mb-1">
              Notes (optional)
            </label>
            <textarea
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              rows={2}
              placeholder="Internal note attached to all selected payouts"
              className="w-full px-3 py-2 border border-gray-300 mb-4 text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                disabled={bulkActionLoading}
                onClick={() => setBulkPaidDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={bulkActionLoading || !bulkRef.trim()}
                onClick={onBulkMarkPaid}
                className="px-4 py-2 text-sm bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700"
              >
                {bulkActionLoading ? 'Marking…' : 'Confirm Mark Paid'}
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
  hint?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-black">{cedi(amount)}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function PayoutsTable({
  payouts,
  onClick,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  payouts: PayoutRow[];
  onClick: (id: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  if (payouts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm border border-gray-200">
        No payouts to display.
      </div>
    );
  }

  const eligibleCount = payouts.filter((p) => p.status === 'requested' || p.status === 'approved').length;
  const allSelected = eligibleCount > 0 && selectedIds.size === eligibleCount;

  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
          <tr>
            <th className="px-3 py-2.5 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                title={allSelected ? 'Deselect all' : 'Select all eligible'}
                className="cursor-pointer"
              />
            </th>
            <th className="px-3 py-2.5">Agent</th>
            <th className="px-3 py-2.5">Date</th>
            <th className="px-3 py-2.5">Amount</th>
            <th className="px-3 py-2.5">Method</th>
            <th className="px-3 py-2.5">Destination</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payouts.map((p) => {
            const eligible = p.status === 'requested' || p.status === 'approved';
            const dest = p.destination ?? {};
            const destSummary =
              p.method === 'momo'
                ? `${(dest.provider ?? '').toUpperCase()} · ${dest.phone ?? ''}`
                : `${dest.bankName ?? ''} · ${dest.accountNumber ?? ''}`;

            return (
              <tr
                key={p.id}
                className={`hover:bg-gray-50 ${selectedIds.has(p.id) ? 'bg-emerald-50/30' : ''}`}
              >
                <td className="px-3 py-2.5 w-8" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => onToggle(p.id)}
                    disabled={!eligible}
                    title={
                      eligible
                        ? 'Select for bulk action'
                        : `Cannot bulk-action a ${p.status} payout`
                    }
                    className={`${eligible ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'}`}
                  />
                </td>
                <td className="px-3 py-2.5 cursor-pointer" onClick={() => onClick(p.id)}>
                  <div className="font-medium text-gray-900">
                    {p.agent?.name ?? p.agent?.email ?? 'Unknown'}
                  </div>
                  {p.agent?.name && p.agent.email && (
                    <div className="text-[11px] text-gray-500">{p.agent.email}</div>
                  )}
                </td>
                <td
                  className="px-3 py-2.5 text-gray-500 cursor-pointer"
                  onClick={() => onClick(p.id)}
                >
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td
                  className="px-3 py-2.5 font-medium cursor-pointer"
                  onClick={() => onClick(p.id)}
                >
                  {cedi(p.amount)}
                </td>
                <td
                  className="px-3 py-2.5 capitalize text-gray-500 cursor-pointer"
                  onClick={() => onClick(p.id)}
                >
                  {p.method}
                </td>
                <td
                  className="px-3 py-2.5 text-gray-500 text-xs font-mono cursor-pointer truncate max-w-[200px]"
                  onClick={() => onClick(p.id)}
                  title={destSummary}
                >
                  {destSummary}
                </td>
                <td className="px-3 py-2.5 cursor-pointer" onClick={() => onClick(p.id)}>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${statusBadge(
                      p.status,
                    )}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td
                  className="px-3 py-2.5 text-right text-xs text-gray-400 cursor-pointer"
                  onClick={() => onClick(p.id)}
                >
                  View →
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailDialog({
  payout,
  actionLoading,
  onClose,
  onApprove,
  onReject,
  onMarkPaid,
}: {
  payout: PayoutDetail;
  actionLoading: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => !actionLoading && onClose()}
    >
      <div
        className="bg-white w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Payout Request</p>
            <h2 className="text-xl font-bold mt-0.5">{cedi(payout.amount)}</h2>
            <span className={`inline-block mt-2 px-2 py-0.5 text-[11px] font-medium rounded ${statusBadge(payout.status)}`}>
              {payout.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Agent info */}
          <Section title="Agent">
            <Row label="Name" value={payout.agent?.name ?? '—'} />
            <Row label="Email" value={payout.agent?.email ?? '—'} />
            <Row label="Phone" value={payout.agent?.phone ?? '—'} />
          </Section>

          {/* Destination on the payout request */}
          <Section title={`Requested ${payout.method === 'momo' ? 'Mobile Money' : 'Bank'} Destination`}>
            {Object.entries(payout.destination).map(([k, v]) => (
              <Row key={k} label={k} value={String(v)} />
            ))}
          </Section>

          {/* Verified destination on file (from agent verification approval) */}
          {payout.agent?.payoutMethod && payout.agent?.payoutDetails && (() => {
            const verifiedJson = JSON.stringify(payout.agent.payoutDetails ?? {});
            const requestJson = JSON.stringify(payout.destination ?? {});
            const matches =
              payout.agent.payoutMethod === payout.method && verifiedJson === requestJson;

            return (
              <Section
                title={`Verified ${payout.agent.payoutMethod === 'momo' ? 'Mobile Money' : 'Bank'} Details on File`}
              >
                {Object.entries(payout.agent.payoutDetails ?? {}).map(([k, v]) => (
                  <Row key={k} label={k} value={String(v)} />
                ))}
                <div
                  className={`mt-3 px-3 py-2 text-xs font-medium rounded ${
                    matches
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {matches
                    ? '✓ Request matches verified payout details on file.'
                    : '⚠ Request differs from the agent\'s verified payout details. Confirm with the agent before paying.'}
                </div>
              </Section>
            );
          })()}

          {/* Commissions breakdown */}
          <Section title={`Bundled Commissions (${payout.commissions.length})`}>
            <div className="border border-gray-200 max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {payout.commissions.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2 text-gray-700">{c.booking.studentName}</td>
                      <td className="px-3 py-2 text-right font-medium">{cedi(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Notes / metadata */}
          {payout.notes && (
            <Section title="Notes">
              <p className="text-sm text-gray-700">{payout.notes}</p>
            </Section>
          )}

          {payout.rejectionReason && (
            <Section title="Rejection Reason">
              <p className="text-sm text-red-600">{payout.rejectionReason}</p>
            </Section>
          )}

          {payout.transactionRef && (
            <Section title="Transaction Reference">
              <p className="text-sm font-mono text-gray-700">{payout.transactionRef}</p>
            </Section>
          )}
        </div>

        {/* Actions */}
        {(payout.status === 'requested' || payout.status === 'approved') && (
          <div className="p-5 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
            {payout.status === 'requested' && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={onReject}
                  className="px-4 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={actionLoading}
                  onClick={onApprove}
                  className="px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </>
            )}
            <button
              disabled={actionLoading}
              onClick={onMarkPaid}
              className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Mark as Paid'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-gray-500 capitalize">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function CommissionsTable({
  commissions,
  loading,
  onRelease,
  onVoid,
}: {
  commissions: CommissionRow[];
  loading: boolean;
  onRelease: (id: string) => void;
  onVoid: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (commissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm border border-gray-200">
        No commissions to display.
      </div>
    );
  }

  const now = Date.now();

  return (
    <div className="border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2.5">Agent</th>
            <th className="px-4 py-2.5">Hostel</th>
            <th className="px-4 py-2.5">Booking</th>
            <th className="px-4 py-2.5">Amount</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Available</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {commissions.map((c) => {
            const availableTs = new Date(c.availableAt).getTime();
            const inHold = c.status === 'pending' && availableTs > now;
            const hoursRemaining = inHold ? Math.ceil((availableTs - now) / 3600000) : 0;

            return (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-900">
                    {c.agent?.name ?? c.agent?.email ?? 'Unknown'}
                  </div>
                  {c.agent?.name && (
                    <div className="text-[11px] text-gray-500">{c.agent.email}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{c.booking.hostel.name}</td>
                <td className="px-4 py-2.5 text-gray-600">{c.booking.studentName}</td>
                <td className="px-4 py-2.5 font-medium">{cedi(c.amount)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded ${statusBadge(
                      c.status,
                    )}`}
                  >
                    {c.status}
                  </span>
                  {inHold && (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      ~{hoursRemaining}h left in hold
                    </p>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500">
                  {new Date(c.availableAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-right space-x-2 whitespace-nowrap">
                  {c.status === 'pending' && (
                    <button
                      onClick={() => onRelease(c.id)}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      Release now
                    </button>
                  )}
                  {(c.status === 'pending' || c.status === 'available') && (
                    <button
                      onClick={() => onVoid(c.id)}
                      className="text-[11px] font-medium text-red-600 hover:text-red-800 hover:underline"
                    >
                      Void
                    </button>
                  )}
                  {c.status === 'paid' && c.payout?.paidAt && (
                    <span className="text-[11px] text-gray-400">
                      Paid {new Date(c.payout.paidAt).toLocaleDateString()}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ByHostelTable({
  hostels,
  loading,
}: {
  hostels: HostelRollupRow[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (hostels.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm border border-gray-200">
        No hostels with commission activity yet.
      </div>
    );
  }

  // Aggregate totals across all hostels for the summary strip
  const totals = hostels.reduce(
    (acc, h) => {
      acc.weeklyBookings += h.bookingsThisWeek;
      acc.totalBookings += h.bookingsTotal;
      acc.pending += h.commissions.pending;
      acc.available += h.commissions.available;
      acc.reserved += h.commissions.reserved;
      acc.paid += h.commissions.paid;
      return acc;
    },
    { weeklyBookings: 0, totalBookings: 0, pending: 0, available: 0, reserved: 0, paid: 0 },
  );

  return (
    <>
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-xs">
        <SummaryStat label="Hostels" value={hostels.length.toString()} hint="Earning commissions" />
        <SummaryStat
          label="Bookings This Week"
          value={totals.weeklyBookings.toString()}
          hint={`${totals.totalBookings} all-time`}
        />
        <SummaryStat label="Pending Ledger" value={cedi(totals.pending)} hint="In hold window" />
        <SummaryStat label="Available" value={cedi(totals.available)} hint="Ready to pay" />
        <SummaryStat label="Reserved" value={cedi(totals.reserved)} hint="In payout requests" />
      </div>

      <div className="border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2.5">Hostel</th>
              <th className="px-3 py-2.5">Agent</th>
              <th className="px-3 py-2.5 text-center" title="Bookings created in the last 7 days">
                Week
              </th>
              <th className="px-3 py-2.5 text-center">Total</th>
              <th className="px-3 py-2.5 text-right">Pending</th>
              <th className="px-3 py-2.5 text-right">Available</th>
              <th className="px-3 py-2.5 text-right">Reserved</th>
              <th className="px-3 py-2.5 text-right">Paid</th>
              <th className="px-3 py-2.5 text-right">Total Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hostels.map((h) => (
              <tr key={h.hostelId} className="hover:bg-gray-50">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {h.hostelName}
                    {!h.isVerified && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                        unverified
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate max-w-[260px]">
                    {h.hostelAddress}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="text-gray-700">{h.agent?.name ?? h.agent?.email ?? '—'}</div>
                  {h.agent && (
                    <div className="text-[11px] text-gray-500">
                      {h.agent.payoutMethod ? (
                        <span className="capitalize">{h.agent.payoutMethod} on file</span>
                      ) : (
                        <span className="text-amber-600">No payout details</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                      h.bookingsThisWeek > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {h.bookingsThisWeek}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center text-gray-600">{h.bookingsTotal}</td>
                <td className="px-3 py-2.5 text-right">
                  {h.commissions.pending > 0 ? (
                    <span className="text-yellow-700">{cedi(h.commissions.pending)}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                  {h.counts.pending > 0 && (
                    <div className="text-[10px] text-gray-400">{h.counts.pending}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {h.commissions.available > 0 ? (
                    <span className="text-emerald-700 font-medium">
                      {cedi(h.commissions.available)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {h.commissions.reserved > 0 ? (
                    <span className="text-blue-700">{cedi(h.commissions.reserved)}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-600">
                  {h.commissions.paid > 0 ? cedi(h.commissions.paid) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                  {cedi(h.totalEarned)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white border border-gray-200 px-3 py-2">
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
      <p className="text-[10px] text-gray-400">{hint}</p>
    </div>
  );
}
