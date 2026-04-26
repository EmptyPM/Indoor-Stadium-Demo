'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { StadiumForm } from '@/components/stadiums/stadium-form';
import { useStadium, useUpdateStadium } from '@/hooks/use-stadiums';
import { Card, CardContent } from '@/components/ui/card';

export default function EditStadiumPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: stadium, isLoading } = useStadium(id);
  const { mutate: update, isPending } = useUpdateStadium();

  const handleSubmit = (data: any) => {
    update({ id, ...data }, { onSuccess: () => router.push(`/admin/stadiums/${id}`) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/stadiums" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Stadiums
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Stadium</h1>
        <p className="text-gray-500 text-sm mt-1">{stadium?.name}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {stadium && (
            <StadiumForm
              defaultValues={stadium}
              onSubmit={handleSubmit}
              isLoading={isPending}
              submitLabel="Update Stadium"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
