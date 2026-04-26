'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Building2, ChevronRight, Clock } from 'lucide-react';
import { useStadium } from '@/hooks/use-stadiums';
import { useCreateCourt } from '@/hooks/use-courts';
import { useSports } from '@/hooks/use-sports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const timeRegex = /^\d{2}:\d{2}$/;

const schema = z.object({
  sportId: z.string().min(1, 'Please select a sport'),
  name: z.string().min(2, 'Court name must be at least 2 characters'),
  description: z.string().optional(),
  capacity: z.coerce.number().int().min(1, 'Must be at least 1').default(2),
  isIndoor: z.boolean().default(true),
  imageUrl: z.string().optional(),
  openingTime: z.string().regex(timeRegex, 'Use HH:mm format').optional().or(z.literal('')),
  closingTime: z.string().regex(timeRegex, 'Use HH:mm format').optional().or(z.literal('')),
});
type Form = z.infer<typeof schema>;

// Common time presets for quick select
const TIME_PRESETS = ['05:00','06:00','07:00','08:00','09:00','10:00','18:00','20:00','21:00','22:00','23:00','00:00'];

export default function StadiumCreateCourtPage() {
  const { id: stadiumId } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: stadium, isLoading: loadingStadium } = useStadium(stadiumId);
  const { data: sports } = useSports();
  const { mutate: createCourt, isPending } = useCreateCourt();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 2, isIndoor: true, openingTime: '06:00', closingTime: '22:00' },
  });

  const openingTime = watch('openingTime');
  const closingTime = watch('closingTime');

  const onSubmit = (data: Form) => {
    const payload = {
      ...data,
      stadiumId,
      openingTime: data.openingTime || undefined,
      closingTime: data.closingTime || undefined,
    };
    createCourt(payload, { onSuccess: () => router.push(`/admin/stadiums/${stadiumId}`) });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/stadiums" className="hover:text-gray-900 transition-colors">Stadiums</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/admin/stadiums/${stadiumId}`} className="hover:text-gray-900 transition-colors">
          {loadingStadium ? '...' : stadium?.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Add Court</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Court</h1>
        {stadium && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Building2 className="w-4 h-4" />
            Adding to <strong className="text-gray-700 ml-1">{stadium.name}</strong>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Sport selector */}
            <div className="space-y-2">
              <Label htmlFor="sportId">Sport *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sports?.map((sport) => {
                  const selected = watch('sportId') === sport.id;
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => setValue('sportId', sport.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{sport.icon ?? '🏅'}</span>
                      <span>{sport.name}</span>
                    </button>
                  );
                })}
              </div>
              {errors.sportId && <p className="text-red-500 text-xs">{errors.sportId.message}</p>}
            </div>

            {/* Court name & capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g. Court A, Net 1, Court 2"
                  className={errors.name ? 'border-red-400' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Max Players</Label>
                <Input id="capacity" {...register('capacity')} type="number" min={1} max={50} />
              </div>
            </div>

            {/* ── Opening & Closing Times ───────────────────────────── */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">Operating Hours</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening time */}
                <div className="space-y-1.5">
                  <Label htmlFor="openingTime" className="text-xs text-gray-600">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    {...register('openingTime')}
                    className="bg-white"
                  />
                  {errors.openingTime && <p className="text-red-500 text-xs">{errors.openingTime.message}</p>}
                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['05:00','06:00','07:00','08:00','09:00'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setValue('openingTime', t)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-all ${openingTime === t ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Closing time */}
                <div className="space-y-1.5">
                  <Label htmlFor="closingTime" className="text-xs text-gray-600">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    {...register('closingTime')}
                    className="bg-white"
                  />
                  {errors.closingTime && <p className="text-red-500 text-xs">{errors.closingTime.message}</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['20:00','21:00','22:00','23:00','00:00'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setValue('closingTime', t)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-all ${closingTime === t ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual indicator */}
              {openingTime && closingTime && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-primary font-medium">
                    Open {openingTime} → {closingTime} · {(() => {
                      const [oh, om] = openingTime.split(':').map(Number);
                      const [ch, cm] = closingTime.split(':').map(Number);
                      const diff = (ch * 60 + cm) - (oh * 60 + om);
                      const hrs = Math.floor(Math.abs(diff) / 60);
                      const mins = Math.abs(diff) % 60;
                      return `${hrs}h${mins > 0 ? ` ${mins}m` : ''} daily`;
                    })()}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input id="description" {...register('description')} placeholder="e.g. Professional wooden flooring, climate controlled" />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Court Image URL <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/court.jpg" />
            </div>

            {/* Indoor toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                {...register('isIndoor')}
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Indoor Court</p>
                <p className="text-xs text-gray-400">Court is inside a covered facility</p>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push(`/admin/stadiums/${stadiumId}`)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Creating...' : 'Create Court'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
