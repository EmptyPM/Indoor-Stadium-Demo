'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Edit, Trash2, Loader2, MapPin, Phone, Mail,
  LayoutGrid, Users, Building2, AlertTriangle, ChevronRight,
  Globe, UserPlus, X as XIcon, Clock,
} from 'lucide-react';
import { useStadium } from '@/hooks/use-stadiums';
import { useCourtsByStadium, useDeleteCourt, type Court } from '@/hooks/use-courts';
import { useManagers, useAssignManagerToStadium, useRemoveManagerFromStadium } from '@/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ── Add Manager Modal ─────────────────────────────────────────────────────────
function AddManagerModal({ stadiumId, open, onClose, existingManagerIds }: {
  stadiumId: string; open: boolean; onClose: () => void; existingManagerIds: string[];
}) {
  const { data: allManagers } = useManagers();
  const { mutate: add, isPending } = useAssignManagerToStadium();
  const [selectedId, setSelectedId] = useState('');

  if (!open) return null;
  const available = allManagers?.filter(m => !existingManagerIds.includes(m.id)) ?? [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">Assign an additional manager to this stadium</p>
        </div>
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          {!available.length ? (
            <p className="text-center text-gray-400 text-sm py-8">All managers already assigned</p>
          ) : available.map(m => (
            <label key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedId === m.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="mgr" value={m.id} className="hidden" checked={selectedId === m.id} onChange={() => setSelectedId(m.id)} />
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                <p className="text-xs text-gray-400">{m.email} · {String(m.role).replace('_', ' ')}</p>
              </div>
              {selectedId === m.id && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
            </label>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { onClose(); setSelectedId(''); }}>Cancel</Button>
          <Button className="flex-1 gap-2" disabled={!selectedId || isPending}
            onClick={() => add({ stadiumId, managerId: selectedId }, { onSuccess: () => { onClose(); setSelectedId(''); } })}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Add Manager
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StadiumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deleteCourt, setDeleteCourt] = useState<Court | null>(null);
  const [showAddManager, setShowAddManager] = useState(false);

  const { data: stadium, isLoading: loadingStadium, refetch: refetchStadium } = useStadium(id);
  const { data: courts, isLoading: loadingCourts, refetch } = useCourtsByStadium(id);
  const { mutate: removeCourt, isPending: removing } = useDeleteCourt();
  const { mutate: removeManager, isPending: removingMgr } = useRemoveManagerFromStadium();

  if (loadingStadium) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>;
  }
  if (!stadium) {
    return (
      <div className="text-center py-32 text-gray-400">
        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Stadium not found</p>
        <Link href="/admin/stadiums" className="text-primary text-sm mt-2 inline-block hover:underline">← Back</Link>
      </div>
    );
  }

  const managers = (stadium as any).managers ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/stadiums" className="hover:text-gray-900 transition-colors">Stadiums</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{stadium.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">🏟️</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stadium.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{stadium.location?.name}</span>
              {stadium.phone && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{stadium.phone}</span>}
              {stadium.email && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{stadium.email}</span>}
            </div>
            {stadium.description && <p className="text-sm text-gray-500 mt-2 max-w-xl">{stadium.description}</p>}
          </div>
        </div>
        <Link href={`/admin/stadiums/${id}/edit`}>
          <Button variant="outline" className="gap-2 flex-shrink-0"><Edit className="w-4 h-4" /> Edit</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Courts</p>
            <p className="text-2xl font-bold text-gray-900">{courts?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Address</p>
            <p className="text-xs text-gray-600 leading-relaxed">{stadium.address}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Status</p>
            <Badge variant={stadium.isActive ? 'success' : 'destructive'}>{stadium.isActive ? 'Active' : 'Inactive'}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* ── Managers Section ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Managers</h2>
            <p className="text-xs text-gray-500 mt-0.5">{managers.length} manager{managers.length !== 1 ? 's' : ''} assigned</p>
          </div>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddManager(true)}>
            <UserPlus className="w-4 h-4" /> Add Manager
          </Button>
        </div>

        {managers.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No managers assigned</p>
            <Button size="sm" className="mt-3 gap-2" onClick={() => setShowAddManager(true)}><UserPlus className="w-4 h-4" /> Assign First Manager</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {managers.map((mgr: any) => (
              <div key={mgr.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                  {mgr.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{mgr.name}</p>
                  <p className="text-xs text-gray-400 truncate">{mgr.email}</p>
                  <span className={`text-xs font-medium ${mgr.role === 'SUPER_ADMIN' ? 'text-purple-600' : 'text-blue-600'}`}>
                    {mgr.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🏟️ Manager'}
                  </span>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-all"
                  onClick={() => removeManager({ stadiumId: id, managerId: mgr.id })}
                  title="Remove manager"
                >
                  <XIcon className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {stadium.images && stadium.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stadium.images.slice(0, 3).map((img, i) => (
            <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={img} alt={`${stadium.name} ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* ── Courts Section ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Courts</h2>
            <p className="text-sm text-gray-500 mt-0.5">Playable courts inside {stadium.name}</p>
          </div>
          <Link href={`/admin/stadiums/${id}/courts/create`}>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Court</Button>
          </Link>
        </div>

        {loadingCourts ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : !courts?.length ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4"><LayoutGrid className="w-7 h-7 text-gray-300" /></div>
              <p className="text-gray-500 font-medium text-sm mb-1">No courts yet</p>
              <p className="text-gray-400 text-xs mb-5">Add the first court to this stadium</p>
              <Link href={`/admin/stadiums/${id}/courts/create`}><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add First Court</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courts.map((court) => (
              <CourtCard key={court.id} court={court} stadiumId={id} onDelete={() => setDeleteCourt(court)} />
            ))}
          </div>
        )}
      </div>

      {stadium.latitude && stadium.longitude && (
        <a href={`https://maps.google.com/?q=${stadium.latitude},${stadium.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Globe className="w-4 h-4" /> View on Google Maps
        </a>
      )}

      {/* Delete Court Dialog */}
      {deleteCourt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Deactivate Court?</h3>
            <p className="text-gray-500 text-sm text-center mb-6"><strong>{deleteCourt.name}</strong> will be hidden from booking.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteCourt(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" disabled={removing}
                onClick={() => removeCourt(deleteCourt.id, { onSuccess: () => { setDeleteCourt(null); refetch(); } })}>
                {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      <AddManagerModal
        stadiumId={id}
        open={showAddManager}
        onClose={() => setShowAddManager(false)}
        existingManagerIds={managers.map((m: any) => m.id)}
      />
    </div>
  );
}

// ── Court Card ────────────────────────────────────────────────────────────────
function CourtCard({ court, stadiumId, onDelete }: { court: Court; stadiumId: string; onDelete: () => void }) {
  const router = useRouter();
  return (
    <Card className="border-gray-100 hover:shadow-md transition-shadow group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{court.sport?.icon ?? '🏅'}</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{court.name}</p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">{court.sport?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/admin/stadiums/${stadiumId}/courts/${court.id}/edit`)}><Edit className="w-3.5 h-3.5 text-gray-400" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
          </div>
        </div>
        {court.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{court.description}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {court.capacity} players</span>
          <span>{court.isIndoor ? '🏠 Indoor' : '🌳 Outdoor'}</span>
        </div>
        {(court.openingTime || court.closingTime) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-gray-400" />
            {court.openingTime ?? '—'} – {court.closingTime ?? '—'}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => router.push(`/admin/stadiums/${stadiumId}/courts/${court.id}/edit`)}>
            <Edit className="w-3 h-3 mr-1.5" /> Edit Court
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
