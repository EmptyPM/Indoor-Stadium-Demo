'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useSport, useUpdateSport } from '@/hooks/use-sports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const COMMON_ICONS = ['🏸','🎾','🏏','🏀','🏐','⚽','🏓','🥊','🏊','🎱','🏋️','🤸'];
const schema = z.object({ name: z.string().min(2), icon: z.string().optional(), description: z.string().optional() });
type Form = z.infer<typeof schema>;

export default function EditSportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sport, isLoading } = useSport(id);
  const { mutate: update, isPending } = useUpdateSport();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const selectedIcon = watch('icon');

  useEffect(() => { if (sport) reset({ name: sport.name, icon: sport.icon ?? '', description: sport.description ?? '' }); }, [sport, reset]);
  const onSubmit = (d: Form) => update({ id, ...d }, { onSuccess: () => router.push('/admin/sports') });

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/sports" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Sports</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Sport</h1>
      </div>
      <Card><CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Sport Name *</Label>
            <Input {...register('name')} className={errors.name ? 'border-red-400' : ''} />
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
            <Input {...register('description')} />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}{isPending ? 'Saving...' : 'Update Sport'}
          </Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
