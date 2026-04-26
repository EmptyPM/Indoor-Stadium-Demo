'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Stadium } from '@/hooks/use-stadiums';
import { useLocations } from '@/hooks/use-locations';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface StadiumFormProps {
  defaultValues?: Partial<Stadium>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function StadiumForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Stadium' }: StadiumFormProps) {
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? []);
  const [imageInput, setImageInput] = useState('');
  const { data: locations } = useLocations();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      locationId: defaultValues?.locationId ?? '',
      address: defaultValues?.address ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      latitude: defaultValues?.latitude ?? undefined,
      longitude: defaultValues?.longitude ?? undefined,
    },
  });

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !images.includes(url)) { setImages([...images, url]); setImageInput(''); }
  };

  const handleFormSubmit = (data: FormData) => onSubmit({ ...data, images });

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Stadium Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Colombo Sports Arena" className={errors.name ? 'border-red-400' : ''} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="locationId">Location *</Label>
          <select id="locationId" {...register('locationId')}
            className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', errors.locationId ? 'border-red-400' : '')}>
            <option value="">Select a city...</option>
            {locations?.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
          {errors.locationId && <p className="text-red-500 text-xs">{errors.locationId.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Full Address *</Label>
        <Input id="address" {...register('address')} placeholder="123 Sports Avenue, Colombo 03" className={errors.address ? 'border-red-400' : ''} />
        {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" {...register('description')} rows={3} placeholder="Brief description of the stadium..."
          className="w-full border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" {...register('phone')} type="tel" placeholder="+94112345678" /></div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register('email')} type="email" placeholder="contact@stadium.lk" className={errors.email ? 'border-red-400' : ''} />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label htmlFor="latitude">Latitude <span className="text-gray-400 font-normal">(optional)</span></Label><Input id="latitude" {...register('latitude')} type="number" step="any" placeholder="6.9271" /></div>
        <div className="space-y-1.5"><Label htmlFor="longitude">Longitude <span className="text-gray-400 font-normal">(optional)</span></Label><Input id="longitude" {...register('longitude')} type="number" step="any" placeholder="79.8612" /></div>
      </div>

      <div className="space-y-3">
        <Label>Images (URLs)</Label>
        <div className="flex gap-2">
          <Input value={imageInput} onChange={e => setImageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} placeholder="https://example.com/image.jpg" className="flex-1" />
          <Button type="button" variant="outline" onClick={addImage} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x250?text=Invalid+URL'; }} />
                <button type="button" onClick={() => setImages(images.filter(x => x !== img))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {watch('latitude') && watch('longitude') && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm text-blue-700">Map pin: {watch('latitude')}, {watch('longitude')}</span>
          <a href={`https://maps.google.com/?q=${watch('latitude')},${watch('longitude')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline ml-auto">Preview ↗</a>
        </div>
      )}

      <Button type="submit" className="w-full gap-2" disabled={isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
