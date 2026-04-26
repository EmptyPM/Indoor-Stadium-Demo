'use client';

import { useState } from 'react';
import {
  CreditCard, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, RefreshCw, TrendingUp,
  Search, Filter, Banknote, MoreVertical, Check,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type PayStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

const STATUS_CFG: Record<PayStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PAID:     { label: 'Paid',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  PENDING:  { label: 'Pending',  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: Clock },
  FAILED:   { label: 'Failed',   color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    icon: RefreshCw },
};

function formatPrice(n: number) { return `LKR ${(n ?? 0).toLocaleString()}`; }
function formatDate(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function formatDateTime(s: string) { return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function usePayments(params: any) {
  return useQuery({
    queryKey: ['admin-payments', params],
    queryFn: async () => { const { data } = await api.get('/payments', { params }); return data; },
  });
}

function usePayStats() {
  return useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => { const { data } = await api.get('/payments/stats'); return data; },
  });
}

function useMarkPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, method }: { id: string; method: string }) => {
      const { data } = await api.patch(`/payments/${id}/pay`, { method }); return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payments'] }); qc.invalidateQueries({ queryKey: ['payment-stats'] }); toast.success('Payment marked as paid'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
}

function useRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.patch(`/payments/${id}/refund`, { reason }); return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-payments'] }); qc.invalidateQueries({ queryKey: ['payment-stats'] }); toast.success('Payment refunded'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
}

// ── Actions dropdown ──────────────────────────────────────────────────────────
function PaymentActions({ payment }: { payment: any }) {
  const [open, setOpen] = useState(false);
  const { mutate: markPaid, isPending: paying } = useMarkPaid();
  const { mutate: refund, isPending: refunding } = useRefund();

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-44 text-sm">
            {payment.status === 'PENDING' && (
              <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-emerald-700 font-medium"
                onClick={() => { markPaid({ id: payment.id, method: payment.method }); setOpen(false); }}>
                <Check className="w-3.5 h-3.5" /> Mark as Paid
              </button>
            )}
            {payment.status === 'PAID' && (
              <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-red-600 font-medium"
                onClick={() => { refund({ id: payment.id, reason: 'Admin refund' }); setOpen(false); }}>
                <RefreshCw className="w-3.5 h-3.5" /> Refund
              </button>
            )}
            {payment.status !== 'PENDING' && payment.status !== 'PAID' && (
              <p className="px-3 py-2 text-gray-400 text-xs">No actions available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PayStatus | ''>('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePayments({ page, limit: 15, status: status || undefined });
  const { data: stats } = usePayStats();
  const payments = data?.data ?? [];

  const STAT_CARDS = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue ?? 0), sub: `${stats?.totalTransactions ?? 0} transactions`, color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '💰' },
    { label: 'Pending', value: formatPrice(stats?.pendingAmount ?? 0), sub: `${stats?.pendingCount ?? 0} awaiting`, color: 'text-amber-600', bg: 'bg-amber-50', emoji: '⏳' },
    { label: 'Refunded', value: formatPrice(stats?.refundedAmount ?? 0), sub: `${stats?.refundedCount ?? 0} refunds`, color: 'text-blue-600', bg: 'bg-blue-50', emoji: '↩️' },
  ];

  const filtered = search
    ? payments.filter((p: any) =>
        p.booking?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.booking?.court?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.booking?.court?.stadium?.name?.toLowerCase().includes(search.toLowerCase()))
    : payments;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-sm text-gray-500 mt-0.5">All transactions across every stadium and court</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-white`}>
            <p className="text-2xl mb-2">{s.emoji}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 h-9" placeholder="Search by user, court, stadium..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['', 'PENDING', 'PAID', 'REFUNDED', 'FAILED'] as const).map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${status === s ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {s === '' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No payments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Customer', 'Court / Stadium', 'Booking Date', 'Method', 'Amount', 'Paid At', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p: any) => {
                    const cfg = STATUS_CFG[p.status as PayStatus] ?? STATUS_CFG.PENDING;
                    const Icon = cfg.icon;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 text-sm">{p.booking?.user?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{p.booking?.user?.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-gray-800">{p.booking?.court?.name}</p>
                          <p className="text-xs text-gray-400">{p.booking?.court?.stadium?.name}</p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {p.booking?.bookingDate ? formatDate(p.booking.bookingDate) : '—'}
                          <br />
                          <span className="text-xs text-gray-400">{p.booking?.startTime} – {p.booking?.endTime}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{p.method}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-gray-900">{formatPrice(p.amount)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">
                          {p.paidAt ? formatDateTime(p.paidAt) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <PaymentActions payment={p} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(data?.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Showing {filtered.length} of {data?.total} payments</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-xs text-gray-500 flex items-center px-2">Page {page} / {data?.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === data?.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
