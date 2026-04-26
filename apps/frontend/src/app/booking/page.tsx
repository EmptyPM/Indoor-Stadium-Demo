'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { MapPin, Calendar, Clock, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { useStadiums } from '@/hooks/use-stadiums';
import { useCourtsByStadium, useCourtAvailability } from '@/hooks/use-courts';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const STEPS = ['Select Venue', 'Select Court', 'Date & Time', 'Confirm'];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(0);
  const [selectedStadium, setSelectedStadium] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(searchParams.get('courtId') || '');
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string; price: number } | null>(null);
  const [notes, setNotes] = useState('');

  const { data: stadiums } = useStadiums({ limit: 50 });
  const { data: courts, isLoading: courtsLoading } = useCourtsByStadium(selectedStadium);
  const { data: availability, isLoading: slotsLoading } = useCourtAvailability(selectedCourt, selectedDate);
  const { mutate: createBooking, isPending: booking } = useCreateBooking();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=/booking');
  }, [isAuthenticated, router]);

  const handleConfirmBooking = () => {
    if (!selectedCourt || !selectedDate || !selectedSlot) return;
    createBooking(
      { courtId: selectedCourt, bookingDate: selectedDate, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, notes },
      { onSuccess: () => router.push('/dashboard') },
    );
  };

  const selectedCourtData = courts?.find((c: any) => c.id === selectedCourt);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Indoor<span className="text-primary">Book</span></span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book a Court</h1>
          <p className="text-gray-500 text-sm mt-1">Complete the steps below to reserve your slot</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all flex-shrink-0',
                  i < step ? 'bg-primary text-white' :
                  i === step ? 'bg-primary text-white' :
                  'bg-gray-200 text-gray-400'
                )}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn('text-sm font-medium hidden sm:block', i <= step ? 'text-gray-900' : 'text-gray-400')}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-3', i < step ? 'bg-primary' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0 — Venue */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Venue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stadiums?.data?.map((s: any) => (
                <Card
                  key={s.id}
                  className={cn('cursor-pointer hover:border-primary/60 hover:shadow-sm transition-all', selectedStadium === s.id ? 'border-primary bg-primary/5' : '')}
                  onClick={() => { setSelectedStadium(s.id); setStep(1); }}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏟️</div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.location?.name ?? s.address}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">{s._count?.courts} courts</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Court */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep(0)} className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">← Back</button>
              <h2 className="text-lg font-semibold text-gray-900">Select a Court</h2>
            </div>
            {courtsLoading ? (
              <div className="flex justify-center py-14"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courts?.map((court: any) => (
                  <Card
                    key={court.id}
                    className={cn('cursor-pointer hover:border-primary/60 hover:shadow-sm transition-all', selectedCourt === court.id ? 'border-primary bg-primary/5' : '')}
                    onClick={() => { setSelectedCourt(court.id); setStep(2); }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">{court.sport?.icon ?? '🏅'}</div>
                        <div>
                          <p className="font-semibold text-gray-900">{court.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{court.sport?.name ?? 'Sport'}</p>
                        </div>
                      </div>
                      {court.pricings?.length > 0 && (
                        <p className="text-primary font-bold text-sm">From LKR {Math.min(...court.pricings.map((p: any) => p.pricePerHour))}/hr</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Date & Time */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-700">← Back</button>
              <h2 className="text-lg font-semibold text-gray-900">Pick Date & Time</h2>
            </div>

            <Card className="mb-5">
              <CardContent className="p-6">
                <div className="space-y-1.5 mb-6">
                  <Label className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Select Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 mb-3"><Clock className="w-4 h-4" />Available Time Slots</Label>
                  {slotsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {availability?.slots?.map((slot: any) => (
                        <button
                          key={slot.startTime}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'p-2.5 rounded-xl border text-sm transition-all text-center',
                            !slot.isAvailable ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' :
                            selectedSlot?.startTime === slot.startTime ? 'border-primary bg-primary text-white' :
                            'border-gray-200 bg-white hover:border-primary text-gray-700'
                          )}
                        >
                          <p className="font-semibold text-xs">{slot.startTime}</p>
                          <p className={cn('text-[10px] mt-0.5', selectedSlot?.startTime === slot.startTime ? 'text-white/70' : 'text-gray-400')}>
                            LKR {slot.price}
                          </p>
                          {!slot.isAvailable && <p className="text-[10px] text-red-400 mt-0.5">Booked</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedSlot && (
              <Button onClick={() => setStep(3)} className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && selectedSlot && selectedCourtData && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-700">← Back</button>
              <h2 className="text-lg font-semibold text-gray-900">Confirm Booking</h2>
            </div>

            <Card className="mb-5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">{selectedCourtData.sport?.icon ?? '🏅'}</div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedCourtData.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{selectedCourtData.sport?.name ?? 'Sport'}</p>
                  </div>
                </div>

                <Separator className="mb-5" />

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Date', value: selectedDate },
                    { label: 'Time', value: `${selectedSlot.startTime} – ${selectedSlot.endTime}` },
                    { label: 'Duration', value: '1 hour' },
                    { label: 'Total Price', value: formatCurrency(selectedSlot.price), bold: true, primary: true },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className={cn('text-sm', item.bold ? 'font-bold text-lg' : 'font-semibold text-gray-900', item.primary && 'text-primary')}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="mb-5" />

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests..."
                    rows={3}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full gap-2" onClick={handleConfirmBooking} disabled={booking}>
              {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {booking ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
