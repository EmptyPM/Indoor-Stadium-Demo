'use client';

import { useState } from 'react';
import {
  Plus, Search, ShieldCheck, UserX, UserCheck,
  KeyRound, ChevronLeft, ChevronRight, Loader2, Users as UsersIcon,
  Building2, MoreVertical, CheckSquare, Square, Info,
} from 'lucide-react';
import {
  useUsers, useCreateUser, useChangeRole, useToggleActive,
  useResetPassword, useAssignStadiums, type User, type UserRole,
} from '@/hooks/use-users';
import { useStadiums } from '@/hooks/use-stadiums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700', icon: '👑' },
  MANAGER:     { label: 'Manager',     color: 'bg-blue-100 text-blue-700',   icon: '🏟️' },
  USER:        { label: 'User',        color: 'bg-gray-100 text-gray-600',   icon: '👤' },
};

function RoleBadge({ role }: { role: UserRole }) {
  const c = ROLE_CONFIG[role] ?? ROLE_CONFIG.USER;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.color}`}>{c.icon} {c.label}</span>;
}

function Avatar({ name, role }: { name: string; role: UserRole }) {
  const colors: Record<UserRole, string> = { SUPER_ADMIN: 'bg-purple-100 text-purple-700', MANAGER: 'bg-blue-100 text-blue-700', USER: 'bg-gray-100 text-gray-600' };
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colors[role]}`}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Modal: Create User ────────────────────────────────────────────────────────
function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: create, isPending } = useCreateUser();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'USER' as UserRole });
  const [err, setErr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr('Name, email and password are required'); return; }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters'); return; }
    setErr('');
    create(form, { onSuccess: () => { onClose(); setForm({ name: '', email: '', password: '', phone: '', role: 'USER' }); } });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create User</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add a new user to the system</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{err}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Silva" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94771234567" />
            </div>
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['USER', 'MANAGER', 'SUPER_ADMIN'] as UserRole[]).map(r => {
                const cfg = ROLE_CONFIG[r];
                return (
                  <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all flex flex-col items-center gap-1 ${form.role === r ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span className="text-xl">{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            {form.role === 'SUPER_ADMIN' && (
              <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs text-purple-700">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                All stadiums will be automatically assigned to this Super Admin.
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />} {isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: Assign Stadiums (multi-select) ─────────────────────────────────────
function AssignStadiumsModal({ user, open, onClose }: { user: User | null; open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { data: stadiumsData } = useStadiums({ limit: 100 });
  const { mutate: assign, isPending } = useAssignStadiums();

  if (!open || !user) return null;
  const stadiums = stadiumsData?.data ?? [];

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === stadiums.length ? [] : stadiums.map(s => s.id));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Assign Stadiums</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select stadiums to assign to <strong>{user.name}</strong> ({ROLE_CONFIG[user.role].label})
          </p>
        </div>
        <div className="p-4">
          {/* Select all */}
          <button onClick={toggleAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-50 w-full mb-3 font-medium">
            {selected.length === stadiums.length
              ? <CheckSquare className="w-4 h-4 text-primary" />
              : <Square className="w-4 h-4 text-gray-400" />}
            {selected.length === stadiums.length ? 'Deselect All' : `Select All (${stadiums.length} stadiums)`}
          </button>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stadiums.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No stadiums available</p>
            ) : stadiums.map(stadium => {
              const isSelected = selected.includes(stadium.id);
              const currentManager = (stadium as any).manager;
              return (
                <label key={stadium.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggle(stadium.id)} />
                  {isSelected
                    ? <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                    : <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base flex-shrink-0">🏟️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{stadium.name}</p>
                    <p className="text-xs text-gray-400">{stadium.location?.name}</p>
                  </div>
                  {currentManager && currentManager.id !== user.id && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                      {currentManager.name}
                    </span>
                  )}
                  {currentManager?.id === user.id && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Current</span>
                  )}
                </label>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-3 py-2">
              {selected.length} stadium{selected.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { onClose(); setSelected([]); }}>Cancel</Button>
          <Button className="flex-1 gap-2" disabled={!selected.length || isPending}
            onClick={() => assign({ userId: user.id, stadiumIds: selected }, { onSuccess: () => { onClose(); setSelected([]); } })}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Assign {selected.length > 0 ? `(${selected.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Reset Password ─────────────────────────────────────────────────────
function ResetPasswordModal({ user, open, onClose }: { user: User | null; open: boolean; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { mutate: reset, isPending } = useResetPassword();
  if (!open || !user) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setErr('Min 6 characters'); return; }
    setErr('');
    reset({ id: user.id, password }, { onSuccess: () => { onClose(); setPassword(''); } });
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-0.5">New password for <strong>{user.name}</strong></p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" autoFocus />
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Role Change Confirmation ───────────────────────────────────────────────────
function RoleChangeConfirmModal({ user, targetRole, open, onClose, onConfirm, isPending }:
  { user: User | null; targetRole: UserRole | null; open: boolean; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  if (!open || !user || !targetRole) return null;
  const cfg = ROLE_CONFIG[targetRole];
  const isSuperAdmin = targetRole === 'SUPER_ADMIN';
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${isSuperAdmin ? 'bg-purple-100' : 'bg-blue-100'}`}>
          {cfg.icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Change Role?</h3>
        <p className="text-gray-500 text-sm text-center mb-3">
          Set <strong>{user.name}</strong> as <strong>{cfg.label}</strong>
        </p>
        {isSuperAdmin && (
          <div className="bg-purple-50 border border-purple-200 text-purple-700 text-xs rounded-xl px-4 py-3 mb-4 text-center">
            👑 <strong>All stadiums</strong> will be automatically assigned to this Super Admin.
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" disabled={isPending} onClick={onConfirm}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [assignTarget, setAssignTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget]   = useState<User | null>(null);
  const [roleTarget, setRoleTarget]     = useState<{ user: User; role: UserRole } | null>(null);
  const [activeMenu, setActiveMenu]     = useState<string | null>(null);

  const { data, isLoading } = useUsers({ page, limit: 15, search, role: roleFilter || undefined });
  const { mutate: changeRole, isPending: changingRole } = useChangeRole();
  const { mutate: toggleActive } = useToggleActive();

  const users = data?.data ?? [];

  const confirmRoleChange = () => {
    if (!roleTarget) return;
    changeRole({ id: roleTarget.user.id, role: roleTarget.role }, { onSuccess: () => setRoleTarget(null) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} total users</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'SUPER_ADMIN', 'MANAGER', 'USER'] as const).map(r => {
          const cfg = r ? ROLE_CONFIG[r] : null;
          return (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${roleFilter === r ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {cfg ? `${cfg.icon} ${cfg.label}s` : '👥 All Users'}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email or phone..." className="pl-9 bg-white" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !users.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <UsersIcon className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No users found</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase">User</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Role</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase hidden lg:table-cell">Stadiums</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-500 text-xs uppercase">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold text-gray-500 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} role={user.role} />
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell"><RoleBadge role={user.role} /></td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {user.managedStadiums?.length ? (
                          <div className="flex flex-col gap-0.5">
                            {user.managedStadiums.slice(0, 2).map(s => (
                              <span key={s.id} className="flex items-center gap-1 text-xs text-gray-600">
                                <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />{s.name}
                              </span>
                            ))}
                            {user.managedStadiums.length > 2 && (
                              <span className="text-xs text-gray-400">+{user.managedStadiums.length - 2} more</span>
                            )}
                          </div>
                        ) : <span className="text-xs text-gray-300 italic">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={user.isActive ? 'success' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block">
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}>
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </Button>
                          {activeMenu === user.id && (
                            <div className="absolute right-0 top-9 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                              {/* Change Role */}
                              <div className="px-3 pt-2 pb-1"><p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Set Role</p></div>
                              {(['USER', 'MANAGER', 'SUPER_ADMIN'] as UserRole[]).map(r => (
                                <button key={r}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${user.role === r ? 'text-primary font-semibold' : 'text-gray-700'}`}
                                  onClick={() => { setRoleTarget({ user, role: r }); setActiveMenu(null); }}>
                                  <span>{ROLE_CONFIG[r].icon}</span>
                                  <span>{ROLE_CONFIG[r].label}</span>
                                  {user.role === r && <ShieldCheck className="w-3.5 h-3.5 ml-auto" />}
                                </button>
                              ))}
                              <div className="border-t border-gray-100 my-1" />
                              {/* Assign stadiums */}
                              {user.role !== 'USER' && (
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                  onClick={() => { setAssignTarget(user); setActiveMenu(null); }}>
                                  <Building2 className="w-4 h-4 text-blue-500" /> Assign Stadiums
                                </button>
                              )}
                              {/* Reset password */}
                              <button
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => { setResetTarget(user); setActiveMenu(null); }}>
                                <KeyRound className="w-4 h-4 text-orange-500" /> Reset Password
                              </button>
                              {/* Activate / Deactivate */}
                              <button
                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors border-t border-gray-100 ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                onClick={() => { toggleActive({ id: user.id, active: !user.isActive }); setActiveMenu(null); }}>
                                {user.isActive ? <><UserX className="w-4 h-4" /> Deactivate</> : <><UserCheck className="w-4 h-4" /> Activate</>}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(data?.totalPages ?? 1) > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Showing {(page-1)*15+1}–{Math.min(page*15, data!.total)} of {data!.total}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p=>p-1)} disabled={page===1}><ChevronLeft className="w-4 h-4" /></Button>
                    <span className="text-xs">Page {page} of {data!.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p=>p+1)} disabled={page===data!.totalPages}><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {activeMenu && <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />}

      {/* Modals */}
      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} />
      <AssignStadiumsModal user={assignTarget} open={!!assignTarget} onClose={() => setAssignTarget(null)} />
      <ResetPasswordModal user={resetTarget} open={!!resetTarget} onClose={() => setResetTarget(null)} />
      <RoleChangeConfirmModal
        user={roleTarget?.user ?? null}
        targetRole={roleTarget?.role ?? null}
        open={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        onConfirm={confirmRoleChange}
        isPending={changingRole}
      />
    </div>
  );
}
