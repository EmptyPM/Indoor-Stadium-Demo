'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle, LayoutGrid, MapPin } from 'lucide-react';
import { useCourts, useDeleteCourt, type Court } from '@/hooks/use-courts';
import { useLocations } from '@/hooks/use-locations';
import { useSports } from '@/hooks/use-sports';
import { useStadiums } from '@/hooks/use-stadiums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function Select({ value, onChange, options, placeholder, className = '' }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`h-10 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}>
      <option value="">{placeholder}</option>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default function AdminCourtsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState('');
  const [stadiumId, setStadiumId] = useState('');
  const [sportId, setSportId] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Court | null>(null);

  const { data: courtsData, isLoading } = useCourts({ search, locationId, stadiumId, sportId, page, limit: 15 });
  const { data: locations } = useLocations();
  const { data: sports } = useSports();
  const { data: stadiumsData } = useStadiums({ locationId, limit: 100 });
  const { mutate: remove, isPending: deleting } = useDeleteCourt();

  const courts = courtsData?.data ?? [];
  const total = courtsData?.total ?? 0;
  const totalPages = courtsData?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Courts</h1><p className="text-sm text-gray-500 mt-0.5">Manage playable courts across all stadiums</p></div>
        <Link href="/admin/courts/create"><Button className="gap-2"><Plus className="w-4 h-4" />Add Court</Button></Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search courts..." className="pl-9 bg-white w-52" />
        </div>
        <Select value={locationId} onChange={(v: string) => { setLocationId(v); setStadiumId(''); setPage(1); }}
          options={locations?.map(l => ({ value: l.id, label: l.name })) ?? []}
          placeholder="All Locations" className="w-44" />
        <Select value={stadiumId} onChange={(v: string) => { setStadiumId(v); setPage(1); }}
          options={stadiumsData?.data?.map((s: any) => ({ value: s.id, label: s.name })) ?? []}
          placeholder="All Stadiums" className="w-48" />
        <Select value={sportId} onChange={(v: string) => { setSportId(v); setPage(1); }}
          options={sports?.map(s => ({ value: s.id, label: `${s.icon ?? ''} ${s.name}` })) ?? []}
          placeholder="All Sports" className="w-44" />
        {(search || locationId || stadiumId || sportId) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setLocationId(''); setStadiumId(''); setSportId(''); setPage(1); }} className="text-gray-500">Clear</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !courts.length ? (
            <div className="text-center py-16 text-gray-400"><LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No courts found</p></div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase">Court</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Stadium</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase hidden lg:table-cell">Location</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase">Sport</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Capacity</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-500 text-xs uppercase">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {courts.map((court: Court) => (
                    <tr key={court.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4"><p className="font-semibold text-gray-900">{court.name}</p>{court.description && <p className="text-xs text-gray-400 mt-0.5">{court.description}</p>}</td>
                      <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-600">{court.stadium?.name}</td>
                      <td className="px-5 py-4 hidden lg:table-cell"><span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{court.stadium?.location?.name}</span></td>
                      <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{court.sport?.icon} {court.sport?.name}</span></td>
                      <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-500">{court.capacity} players</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/admin/courts/${court.id}/edit`)}><Edit className="w-4 h-4 text-gray-400" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => setDeleteTarget(court)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Showing {(page-1)*15+1}–{Math.min(page*15,total)} of {total}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p-1)} disabled={page===1}>‹</Button>
                    <span className="text-xs text-gray-600 px-2 leading-9">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>›</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Deactivate Court?</h3>
            <p className="text-gray-500 text-sm text-center mb-6"><strong>{deleteTarget.name}</strong> will be hidden from booking.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" disabled={deleting} onClick={() => remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
