'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, MapPin, Edit, Trash2, LayoutGrid,
  ChevronLeft, ChevronRight, Loader2, Building2, AlertTriangle, Eye,
} from 'lucide-react';
import { useStadiums, useDeleteStadium, type Stadium } from '@/hooks/use-stadiums';
import { useLocations } from '@/hooks/use-locations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminStadiumsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Stadium | null>(null);

  const { data, isLoading } = useStadiums({ page, limit: 10, search, locationId });
  const { data: locations } = useLocations();
  const { mutate: deleteStadium, isPending: deleting } = useDeleteStadium();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stadiums</h1>
          <p className="text-gray-500 text-sm mt-0.5">Click a stadium to manage its courts</p>
        </div>
        <Link href="/admin/stadiums/create">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Stadium</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search stadiums..." className="pl-9 bg-white" />
        </div>
        <select
          value={locationId}
          onChange={e => { setLocationId(e.target.value); setPage(1); }}
          className="h-10 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-48"
        >
          <option value="">All Locations</option>
          {locations?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !data?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Building2 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No stadiums found</p>
              <p className="text-xs mt-1">Try adjusting filters or create a new stadium</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stadium</th>
                    <th className="px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Manager</th>
                    <th className="px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Courts</th>
                    <th className="px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.map((stadium) => (
                    <tr
                      key={stadium.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/stadiums/${stadium.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">🏟️</div>
                          <div>
                            <p className="font-semibold text-gray-900 hover:text-primary transition-colors">{stadium.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{stadium.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {stadium.location?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-gray-600 text-xs">
                          {(stadium as any).managers?.length
                            ? (stadium as any).managers.slice(0, 2).map((m: any) => m.name).join(', ') + ((stadium as any).managers.length > 2 ? ` +${(stadium as any).managers.length - 2}` : '')
                            : <span className="text-gray-300 italic">Unassigned</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <Link href={`/admin/stadiums/${stadium.id}`}>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">
                            <LayoutGrid className="w-3 h-3" /> {stadium._count?.courts ?? 0} courts
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={stadium.isActive ? 'success' : 'destructive'}>
                          {stadium.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            title="View & manage courts"
                            onClick={() => router.push(`/admin/stadiums/${stadium.id}`)}
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => router.push(`/admin/stadiums/${stadium.id}/edit`)}
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50"
                            onClick={() => setDeleteTarget(stadium)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of {data.total} stadiums
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-gray-600 px-1">Page {page} of {data.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Deactivate Stadium?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              <strong>{deleteTarget.name}</strong> and all its courts will be hidden from booking.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive" className="flex-1"
                onClick={() => deleteStadium(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
