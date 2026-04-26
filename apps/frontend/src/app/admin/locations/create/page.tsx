'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateLocation } from '@/hooks/use-locations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const schema = z.object({ name: z.string().min(2), province: z.string().optional() });
type Form = z.infer<typeof schema>;

export default function CreateLocationPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const onSubmit = (d: Form) => create(d, { onSuccess: () => router.push('/admin/locations') });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/locations" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Locations</Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Location</h1>
      </div>
      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">City / Area Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Colombo" className={errors.name ? 'border-red-400' : ''} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province">Province</Label>
            <Input id="province" {...register('province')} placeholder="e.g. Western Province" />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}{isPending ? 'Saving...' : 'Create Location'}
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
