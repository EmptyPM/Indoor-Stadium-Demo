'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Trophy, Loader2, AlertTriangle } from 'lucide-react';
import { useSports, useDeleteSport, type Sport } from '@/hooks/use-sports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AdminSportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Sport | null>(null);
  const { data: sports, isLoading } = useSports(search);
  const { mutate: remove, isPending: deleting } = useDeleteSport();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Sports</h1><p className="text-sm text-gray-500 mt-0.5">Manage available sports</p></div>
        <Link href="/admin/sports/create"><Button className="gap-2"><Plus className="w-4 h-4" />Add Sport</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sports..." className="pl-9 bg-white" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !sports?.length ? (
            <div className="text-center py-16 text-gray-400"><Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No sports found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="px-6 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Sport</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Courts</th>
                <th className="px-6 py-3.5 text-right font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {sports.map(sport => (
                  <tr key={sport.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-xl">{sport.icon || '🏅'}</div>
                        <span className="font-semibold text-gray-900">{sport.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-500 text-sm">{sport.description || '—'}</td>
                    <td className="px-6 py-4"><Badge variant="secondary">{sport._count?.courts ?? 0}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/admin/sports/${sport.id}/edit`)}><Edit className="w-4 h-4 text-gray-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => setDeleteTarget(sport)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Sport?</h3>
            <p className="text-gray-500 text-sm text-center mb-6"><strong>{deleteTarget.name}</strong> will be deleted. This fails if courts use this sport.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" disabled={deleting} onClick={() => remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
