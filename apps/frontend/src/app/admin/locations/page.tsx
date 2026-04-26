'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { useLocations, useDeleteLocation, type Location } from '@/hooks/use-locations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AdminLocationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const { data: locations, isLoading } = useLocations(search);
  const { mutate: remove, isPending: deleting } = useDeleteLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Locations</h1><p className="text-sm text-gray-500 mt-0.5">Manage cities and areas</p></div>
        <Link href="/admin/locations/create"><Button className="gap-2"><Plus className="w-4 h-4" />Add Location</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search locations..." className="pl-9 bg-white" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !locations?.length ? (
            <div className="text-center py-16 text-gray-400"><MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No locations found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="px-6 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Province</th>
                <th className="px-6 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Stadiums</th>
                <th className="px-6 py-3.5 text-right font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{loc.name}</span></td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-500 text-sm">{loc.province || '—'}</td>
                    <td className="px-6 py-4"><Badge variant="secondary">{loc._count?.stadiums ?? 0}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/admin/locations/${loc.id}/edit`)}><Edit className="w-4 h-4 text-gray-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => setDeleteTarget(loc)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
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
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Location?</h3>
            <p className="text-gray-500 text-sm text-center mb-6"><strong>{deleteTarget.name}</strong> will be permanently deleted. This fails if it has stadiums.</p>
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
