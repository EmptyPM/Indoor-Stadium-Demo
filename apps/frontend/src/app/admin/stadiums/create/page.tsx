'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { StadiumForm } from '@/components/stadiums/stadium-form';
import { useCreateStadium } from '@/hooks/use-stadiums';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CreateStadiumPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateStadium();

  const handleSubmit = (data: any) => {
    create(data, { onSuccess: () => router.push('/admin/stadiums') });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/stadiums" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Stadiums
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Stadium</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new indoor sports venue to the platform</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <StadiumForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            submitLabel="Create Stadium"
          />
        </CardContent>
      </Card>
    </div>
  );
}
