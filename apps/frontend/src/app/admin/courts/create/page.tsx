'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateCourt } from '@/hooks/use-courts';
import { useLocations } from '@/hooks/use-locations';
import { useSports } from '@/hooks/use-sports';
import { useStadiums } from '@/hooks/use-stadiums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const schema = z.object({
  locationId: z.string().min(1, 'Select a location'),
  stadiumId: z.string().min(1, 'Select a stadium'),
  sportId: z.string().min(1, 'Select a sport'),
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  capacity: z.coerce.number().int().min(1).default(2),
  isIndoor: z.boolean().default(true),
});
type Form = z.infer<typeof schema>;

function SelectField({ id, label, value, onChange, options, placeholder, error, disabled }: any) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${error ? 'border-red-400' : 'border-input'}`}>
        <option value="">{placeholder}</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export default function CreateCourtPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateCourt();
  const [locationId, setLocationId] = useState('');
  const [stadiumId, setStadiumId] = useState('');

  const { data: locations } = useLocations();
  const { data: stadiumsData } = useStadiums({ locationId, limit: 100 });
  const { data: sports } = useSports();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 2, isIndoor: true },
  });

  const onLocationChange = (id: string) => { setLocationId(id); setStadiumId(''); setValue('locationId', id); setValue('stadiumId', ''); };
  const onStadiumChange = (id: string) => { setStadiumId(id); setValue('stadiumId', id); };

  const onSubmit = (d: Form) => {
    const { locationId: _l, ...payload } = d;
    create(payload, { onSuccess: () => router.push('/admin/courts') });
  };

  const stadiumOptions = stadiumsData?.data?.map((s: any) => ({ value: s.id, label: s.name })) ?? [];
  const sportOptions = sports?.map(s => ({ value: s.id, label: `${s.icon ?? ''} ${s.name}` })) ?? [];
  const locationOptions = locations?.map(l => ({ value: l.id, label: l.name })) ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/courts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Courts</Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Court</h1>
        <p className="text-sm text-gray-500 mt-1">Select a location, then stadium, then configure the court</p>
      </div>

      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Step 1: Location */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 1 — Choose Location & Stadium</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField id="locationId" label="Location *" value={locationId} onChange={onLocationChange}
                options={locationOptions} placeholder="Select location..." error={errors.locationId?.message} />
              <SelectField id="stadiumId" label="Stadium *" value={stadiumId} onChange={onStadiumChange}
                options={stadiumOptions} placeholder={locationId ? 'Select stadium...' : 'Select location first'}
                error={errors.stadiumId?.message} disabled={!locationId} />
            </div>
          </div>

          {/* Step 2: Sport & Details */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 2 — Court Details</p>
            <SelectField id="sportId" label="Sport *" value={watch('sportId') ?? ''} onChange={(v: string) => setValue('sportId', v)}
              options={sportOptions} placeholder="Select sport..." error={errors.sportId?.message} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Court Name *</Label>
                <Input id="name" {...register('name')} placeholder="e.g. Court A, Net 1" className={errors.name ? 'border-red-400' : ''} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Max Players</Label>
                <Input id="capacity" {...register('capacity')} type="number" min={1} max={50} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="e.g. Professional wooden flooring" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isIndoor')} className="w-4 h-4 rounded border-gray-300" defaultChecked />
              <span className="text-sm text-gray-700">Indoor court</span>
            </label>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}{isPending ? 'Creating...' : 'Create Court'}
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
