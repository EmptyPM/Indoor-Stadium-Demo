'use client';

import { useState } from 'react';
import {
  CalendarDays, Loader2, ChevronLeft, ChevronRight, Search,
  CheckCircle2, XCircle, Clock, Ban, AlertCircle, Building2,
  LayoutGrid, List, ChevronDown, ChevronUp, Check, X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStadiums } from '@/hooks/use-stadiums';

type BStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

const B_CFG: Record<BStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING:   { label: 'Pending',   color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     icon: Ban },
  COMPLETED: { label: 'Completed', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    icon: CheckCircle2 },
  NO_SHOW:   { label: 'No Show',   color: 'text-gray-600',    bg: 'bg-gray-50',    border: 'border-gray-200',    icon: XCircle },
};

function fDate(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fPrice(n: number) { return `LKR ${(n ?? 0).toLocaleString()}`; }

function useAllBookings(params: any) {
  return useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: async () => { const { data } = await api.get('/bookings', { params }); return data; },
  });
}

function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.patch(`/bookings/${id}/confirm`); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Booking confirmed'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
}

function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.patch(`/bookings/${id}/cancel`, { reason }); return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-bookings'] }); toast.success('Booking cancelled'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });
}

// ── Booking Row ───────────────────────────────────────────────────────────────
function BookingRow({ booking }: { booking: any }) {
  const cfg = B_CFG[booking.status as BStatus] ?? B_CFG.PENDING;
  const Icon = cfg.icon;
  const { mutate: confirm, isPending: confirming } = useConfirmBooking();
  const { mutate: cancel, isPending: cancelling } = useCancelBooking();

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-4 py-3.5">
        <p className="font-semibold text-gray-900 text-sm">{booking.user?.name ?? '—'}</p>
        <p className="text-xs text-gray-400">{booking.user?.email}</p>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-medium text-gray-800">{booking.court?.name}</p>
        <p className="text-xs text-gray-400">{booking.court?.sport?.name ?? booking.court?.stadium?.name}</p>
      </td>
      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
        {fDate(booking.bookingDate)}
        <br />
        <span className="text-xs text-gray-400">{booking.startTime} – {booking.endTime}</span>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-bold text-gray-900">{fPrice(booking.totalPrice)}</p>
        <p className="text-xs text-gray-400">{booking.totalHours}h</p>
      </td>
      <td className="px-4 py-3.5">
        {booking.payment ? (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {booking.payment.status}
          </span>
        ) : <span className="text-xs text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          <Icon className="w-3 h-3" /> {cfg.label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {booking.status === 'PENDING' && (
            <button
              disabled={confirming}
              onClick={() => confirm(booking.id)}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Confirm">
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <button
              disabled={cancelling}
              onClick={() => cancel({ id: booking.id, reason: 'Cancelled by admin' })}
              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Stadium Accordion ─────────────────────────────────────────────────────────
function StadiumAccordion({ stadium, statusFilter, search }: { stadium: any; statusFilter: BStatus | ''; search: string }) {
  const [expanded, setExpanded] = useState(true);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAllBookings({
    stadiumId: stadium.id, page, limit: 8,
    status: statusFilter || undefined,
  });

  const bookings = (data?.data ?? []).filter((b: any) =>
    !search || b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.court?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const total = data?.total ?? 0;
  const pending = (data?.data ?? []).filter((b: any) => b.status === 'PENDING').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Stadium header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900">{stadium.name}</p>
            <p className="text-xs text-gray-400">{stadium.location?.name ?? stadium.address}</p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{total} bookings</span>
            {pending > 0 && (
              <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">{pending} pending</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : !bookings.length ? (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <CalendarDays className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">No bookings found for this stadium</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Customer', 'Court', 'Date & Time', 'Amount', 'Payment', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((b: any) => <BookingRow key={b.id} booking={b} />)}
                  </tbody>
                </table>
              </div>

              {(data?.totalPages ?? 1) > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Page {page} of {data?.totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                    <Button variant="outline" size="sm" disabled={page === data?.totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BStatus | ''>('');
  const [search, setSearch] = useState('');
  const { data: stadiumsData, isLoading: loadingStadiums } = useStadiums({ limit: 100 });
  const stadiums = stadiumsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bookings organized by stadium and court</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 h-9" placeholder="Search by customer or court..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {s === '' ? '🗂 All' : s === 'PENDING' ? '⏳ Pending' : s === 'CONFIRMED' ? '✅ Confirmed' : s === 'COMPLETED' ? '🏅 Completed' : '❌ Cancelled'}
            </button>
          ))}
        </div>
      </div>

      {/* Stadium accordions */}
      {loadingStadiums ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : !stadiums.length ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Building2 className="w-14 h-14 mb-3 opacity-20" />
          <p className="font-medium">No stadiums found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stadiums.map((stadium: any) => (
            <StadiumAccordion key={stadium.id} stadium={stadium} statusFilter={statusFilter} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}
