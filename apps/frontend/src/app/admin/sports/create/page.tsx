'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateSport } from '@/hooks/use-sports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const COMMON_ICONS = ['🏸','🎾','🏏','🏀','🏐','⚽','🏓','🥊','🏊','🎱','🏋️','🤸'];
const schema = z.object({ name: z.string().min(2), icon: z.string().optional(), description: z.string().optional() });
type Form = z.infer<typeof schema>;

export default function CreateSportPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateSport();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const selectedIcon = watch('icon');
  const onSubmit = (d: Form) => create(d, { onSuccess: () => router.push('/admin/sports') });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/sports" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Sports</Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Sport</h1>
      </div>
      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Sport Name *</Label>
            <Input {...register('name')} placeholder="e.g. Badminton" className={errors.name ? 'border-red-400' : ''} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Icon (emoji)</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ICONS.map(em => (
                <button key={em} type="button" onClick={() => setValue('icon', em)}
                  className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center transition-all ${selectedIcon === em ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}`}
                >{em}</button>
              ))}
            </div>
            <Input {...register('icon')} placeholder="Or type custom emoji" value={selectedIcon || ''} onChange={e => setValue('icon', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input {...register('description')} placeholder="Brief description..." />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}{isPending ? 'Saving...' : 'Create Sport'}
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
