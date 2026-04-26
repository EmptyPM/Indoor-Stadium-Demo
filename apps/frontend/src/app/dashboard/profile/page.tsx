'use client';

import { useState } from 'react';
import { User, Phone, Mail, Save, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateUser } from '@/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMyBookings } from '@/hooks/use-bookings';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { mutate: update, isPending } = useUpdateUser();
  const { data: bookingsData } = useMyBookings({ limit: 100 });

  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [saved, setSaved] = useState(false);

  const bookings = bookingsData?.data ?? [];
  const totalSpent = bookings.filter(b => b.payment?.status === 'PAID').reduce((s, b) => s + (b.payment?.amount ?? 0), 0);
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    update({ id: user.id, name: form.name, phone: form.phone }, {
      onSuccess: (data) => {
        updateUser({ name: data.name, phone: data.phone });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: '👑 Super Admin',
    MANAGER: '🏟️ Manager',
    USER: '👤 Member',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account details</p>
      </div>

      {/* Avatar + stats */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
                <ShieldCheck className="w-3 h-3 text-primary" />
                {ROLE_LABELS[user?.role ?? 'USER'] ?? user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Bookings', value: bookings.length },
            { label: 'Completed', value: confirmed },
            { label: 'Total Spent', value: `LKR ${totalSpent.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-white/60 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-5">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
            <Input value={user?.email ?? ''} disabled className="bg-gray-50 text-gray-400" />
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94771234567" />
          </div>

          <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Account Info</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Member Since</span>
            <span className="font-medium text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Account Type</span>
            <span className="font-medium text-gray-900">{ROLE_LABELS[user?.role ?? 'USER']}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Account Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
