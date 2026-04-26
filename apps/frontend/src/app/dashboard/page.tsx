'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays, MapPin, Clock, Loader2, Plus, X,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Timer, Ban, ArrowRight,
} from 'lucide-react';
import { useMyBookings, useCancelBooking, type Booking, type BookingStatus } from '@/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<BookingStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:   { label: 'Pending',   color: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200',  icon: Timer },
  CONFIRMED: { label: 'Confirmed', color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700',    bg: 'bg-red-50    border-red-200',    icon: Ban },
  COMPLETED: { label: 'Completed', color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200',   icon: CheckCircle2 },
  NO_SHOW:   { label: 'No Show',   color: 'text-gray-600',   bg: 'bg-gray-50   border-gray-200',   icon: XCircle },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(price: number) {
  return `LKR ${price.toLocaleString()}`;
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────
function CancelModal({ booking, open, onClose }: { booking: Booking | null; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const { mutate: cancel, isPending } = useCancelBooking();
  if (!open || !booking) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center">Cancel Booking?</h3>
          <p className="text-gray-500 text-sm text-center mt-1 mb-4">
            {booking.court?.name} · {formatDate(booking.bookingDate)}
          </p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for cancellation (optional)"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Keep Booking</Button>
          <Button variant="destructive" className="flex-1 gap-2" disabled={isPending}
            onClick={() => cancel({ id: booking.id, reason }, { onSuccess: () => { onClose(); setReason(''); } })}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const court = booking.court;
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const isPast = new Date(booking.bookingDate) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden">
      {/* Coloured top strip by status */}
      <div className={`h-1 ${booking.status === 'CONFIRMED' ? 'bg-emerald-400' : booking.status === 'CANCELLED' ? 'bg-red-400' : booking.status === 'COMPLETED' ? 'bg-blue-400' : 'bg-amber-400'}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {court?.sport?.icon ?? '🏅'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{court?.name ?? 'Court'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{court?.sport?.name}</p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Date</p>
              <p className="text-sm font-semibold text-gray-700">{formatDate(booking.bookingDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Time</p>
              <p className="text-sm font-semibold text-gray-700">{booking.startTime} – {booking.endTime}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Venue</p>
              <p className="text-sm font-semibold text-gray-700 truncate">{court?.stadium?.name}</p>
              <p className="text-xs text-gray-400">{court?.stadium?.location?.name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Amount</p>
            <p className="text-sm font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
            <p className="text-xs text-gray-400">{booking.totalHours}h · {court?.isIndoor ? '🏠 Indoor' : '🌳 Outdoor'}</p>
          </div>
        </div>

        {/* Payment status */}
        {booking.payment && (
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium mb-4 ${
            booking.payment.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' :
            booking.payment.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
          }`}>
            <span>Payment · {booking.payment.method}</span>
            <span className="font-bold">{booking.payment.status}</span>
          </div>
        )}

        {/* Actions */}
        {canCancel && !isPast && (
          <Button variant="outline" size="sm" className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={onCancel}>
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const { data, isLoading } = useMyBookings({ page, limit: 9, status: statusFilter || undefined });
  const bookings = data?.data ?? [];

  const upcoming = bookings.filter(b => (b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.bookingDate) >= new Date());
  const totalSpent = bookings.filter(b => b.payment?.status === 'PAID').reduce((s, b) => s + b.payment!.amount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {upcoming.length > 0
              ? `You have ${upcoming.length} upcoming booking${upcoming.length > 1 ? 's' : ''}`
              : 'No upcoming bookings — book a court now!'}
          </p>
        </div>
        <Link href="/stadiums">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Book a Court</Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: data?.total ?? 0, color: 'text-gray-900', emoji: '📋' },
          { label: 'Upcoming', value: upcoming.length, color: 'text-emerald-600', emoji: '🗓️' },
          { label: 'Total Spent', value: `LKR ${totalSpent.toLocaleString()}`, color: 'text-primary', emoji: '💳' },
          { label: 'Courts Visited', value: new Set(bookings.map(b => b.court?.id)).size, color: 'text-violet-600', emoji: '🏟️' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-2xl mb-1">{s.emoji}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}>
            {s === '' ? '🗂 All' : s === 'PENDING' ? '⏳ Pending' : s === 'CONFIRMED' ? '✅ Confirmed' : s === 'COMPLETED' ? '🏅 Completed' : '❌ Cancelled'}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : !bookings.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <CalendarDays className="w-14 h-14 text-gray-200 mb-4" />
          <p className="text-gray-500 font-semibold">No bookings yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Find a court and make your first booking</p>
          <Link href="/stadiums">
            <Button className="gap-2">Browse Venues <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(b => (
              <BookingCard key={b.id} booking={b} onCancel={() => setCancelTarget(b)} />
            ))}
          </div>

          {(data?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {data!.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === data!.totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <CancelModal booking={cancelTarget} open={!!cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  );
}
