'use client';

import { useState } from 'react';
import { CreditCard, Loader2, ChevronLeft, ChevronRight, Receipt, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useMyBookings, type Booking } from '@/hooks/use-bookings';
import { Button } from '@/components/ui/button';

function formatPrice(n: number) { return `LKR ${n.toLocaleString()}`; }
function formatDate(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

const PAY_CFG: Record<string, { color: string; bg: string; icon: any }> = {
  PAID:     { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
  PENDING:  { color: 'text-amber-700',   bg: 'bg-amber-50',   icon: Clock },
  FAILED:   { color: 'text-red-700',     bg: 'bg-red-50',     icon: XCircle },
  REFUNDED: { color: 'text-blue-700',    bg: 'bg-blue-50',    icon: Receipt },
};

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyBookings({ page, limit: 15 });
  const bookings = (data?.data ?? []).filter(b => !!b.payment);

  const totalPaid = bookings.filter(b => b.payment?.status === 'PAID').reduce((s, b) => s + (b.payment?.amount ?? 0), 0);
  const totalPending = bookings.filter(b => b.payment?.status === 'PENDING').reduce((s, b) => s + (b.payment?.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-sm text-gray-500 mt-0.5">All transactions for your bookings</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: formatPrice(totalPaid), color: 'text-emerald-600', emoji: '✅', bg: 'bg-emerald-50' },
          { label: 'Pending', value: formatPrice(totalPending), color: 'text-amber-600', emoji: '⏳', bg: 'bg-amber-50' },
          { label: 'Transactions', value: bookings.length, color: 'text-primary', emoji: '🧾', bg: 'bg-primary/5' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-white`}>
            <p className="text-2xl mb-2">{s.emoji}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !bookings.length ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No payment records yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Court / Venue</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Method</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(b => {
                    const pay = b.payment!;
                    const cfg = PAY_CFG[pay.status] ?? PAY_CFG.PENDING;
                    const Icon = cfg.icon;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                              {b.court?.sport?.icon ?? '🏅'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{b.court?.name}</p>
                              <p className="text-xs text-gray-400">{b.court?.stadium?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-gray-600 text-xs">
                          {formatDate(b.bookingDate)}<br />
                          <span className="text-gray-400">{b.startTime} – {b.endTime}</span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{pay.method}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-gray-900">{formatPrice(pay.amount)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3 h-3" /> {pay.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {(data?.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Showing page {page} of {data!.totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" disabled={page === data!.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
