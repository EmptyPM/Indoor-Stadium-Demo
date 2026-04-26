'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCourt, useUpdateCourt } from '@/hooks/use-courts';
import { useSports } from '@/hooks/use-sports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const schema = z.object({
  sportId: z.string().min(1, 'Select a sport'),
  name: z.string().min(2),
  description: z.string().optional(),
  capacity: z.coerce.number().int().min(1),
  isIndoor: z.boolean(),
});
type Form = z.infer<typeof schema>;

export default function EditCourtPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: court, isLoading } = useCourt(id);
  const { data: sports } = useSports();
  const { mutate: update, isPending } = useUpdateCourt();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (court) reset({ sportId: court.sportId, name: court.name, description: court.description ?? '', capacity: court.capacity, isIndoor: court.isIndoor });
  }, [court, reset]);

  const onSubmit = (d: Form) => update({ id, ...d }, { onSuccess: () => router.push('/admin/courts') });

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/courts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Courts</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Court</h1>
        <p className="text-sm text-gray-500 mt-1">{court?.stadium?.name} — {court?.name}</p>
      </div>

      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="sportId">Sport *</Label>
            <select id="sportId" value={watch('sportId') ?? ''} onChange={e => setValue('sportId', e.target.value)}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.sportId ? 'border-red-400' : 'border-input'}`}>
              <option value="">Select sport...</option>
              {sports?.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
            {errors.sportId && <p className="text-red-500 text-xs">{errors.sportId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Court Name *</Label>
              <Input id="name" {...register('name')} className={errors.name ? 'border-red-400' : ''} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Max Players</Label>
              <Input id="capacity" {...register('capacity')} type="number" min={1} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isIndoor')} className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Indoor court</span>
          </label>

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}{isPending ? 'Saving...' : 'Update Court'}
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
