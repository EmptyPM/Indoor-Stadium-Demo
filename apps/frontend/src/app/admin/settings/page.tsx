'use client';

import { useState } from 'react';
import {
  Settings, CreditCard, User, Lock, Building,
  ChevronRight, Save, Loader2, CheckCircle2,
  Eye, EyeOff, Plus, Trash2, Banknote, Zap, MapPin, AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'platform' | 'account';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
}

interface PaymentSettings {
  payAtVenue: boolean;
  payNow: boolean;
  bankTransfer: boolean;
  bankAccounts: BankAccount[];
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ── Bank Account Card ─────────────────────────────────────────────────────────
function BankCard({ account, onRemove }: { account: BankAccount; onRemove: () => void }) {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Banknote className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{account.bankName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{account.accountName}</p>
          <p className="text-xs font-mono text-gray-700 mt-1 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">
            {account.accountNumber}
          </p>
          {account.branch && <p className="text-xs text-gray-400 mt-1">Branch: {account.branch}</p>}
        </div>
      </div>
      <button onClick={onRemove} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Platform Settings Tab ─────────────────────────────────────────────────────
function PlatformSettings() {
  const [settings, setSettings] = useState<PaymentSettings>({
    payAtVenue: true,
    payNow: false,
    bankTransfer: true,
    bankAccounts: [
      { id: '1', bankName: 'Commercial Bank', accountName: 'IndoorBook Pvt Ltd', accountNumber: '8001234567890', branch: 'Kandy Main' },
      { id: '2', bankName: 'Sampath Bank', accountName: 'IndoorBook Pvt Ltd', accountNumber: '0123456789012', branch: 'Colombo 03' },
    ],
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountName: '', accountNumber: '', branch: '' });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate API call
    setSaving(false);
    setSaved(true);
    toast.success('Platform settings saved');
    setTimeout(() => setSaved(false), 3000);
  };

  const addBank = () => {
    if (!newBank.bankName || !newBank.accountName || !newBank.accountNumber) {
      toast.error('Please fill in all required bank fields');
      return;
    }
    if (settings.bankAccounts.length >= 2) {
      toast.error('Maximum 2 bank accounts allowed');
      return;
    }
    setSettings(s => ({
      ...s,
      bankAccounts: [...s.bankAccounts, { ...newBank, id: Date.now().toString() }],
    }));
    setNewBank({ bankName: '', accountName: '', accountNumber: '', branch: '' });
    setShowAddBank(false);
    toast.success('Bank account added');
  };

  const removeBank = (id: string) => {
    setSettings(s => ({ ...s, bankAccounts: s.bankAccounts.filter(b => b.id !== id) }));
    toast.success('Bank account removed');
  };

  const PAYMENT_METHODS = [
    {
      key: 'payAtVenue' as const,
      icon: MapPin,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'Pay at Venue',
      desc: 'Customers pay in cash or card when they arrive at the venue',
      badge: 'Active',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      key: 'payNow' as const,
      icon: Zap,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Pay Now (Online)',
      desc: 'Instant online payment via payment gateway',
      badge: 'Coming Soon',
      badgeColor: 'bg-amber-100 text-amber-700',
      disabled: true,
    },
    {
      key: 'bankTransfer' as const,
      icon: Banknote,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      title: 'Bank Transfer',
      desc: 'Customers transfer directly to your bank account and upload the slip',
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-primary" /> Payment Methods
          </CardTitle>
          <CardDescription>Enable or disable payment options for your customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PAYMENT_METHODS.map(m => {
            const Icon = m.icon;
            const checked = settings[m.key];
            return (
              <div key={m.key} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${checked && !m.disabled ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-gray-50'} ${m.disabled ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${m.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${m.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                      {m.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.badgeColor}`}>{m.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </div>
                </div>
                <Toggle
                  checked={checked}
                  onChange={v => !m.disabled && setSettings(s => ({ ...s, [m.key]: v }))}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Bank Accounts (visible when bank transfer enabled) */}
      {settings.bankTransfer && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="w-4 h-4 text-primary" /> Bank Accounts
                </CardTitle>
                <CardDescription className="mt-1">
                  Add up to 2 bank accounts — customers will see these when selecting Bank Transfer
                </CardDescription>
              </div>
              {settings.bankAccounts.length < 2 && (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAddBank(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Account
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.bankAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Banknote className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No bank accounts added yet</p>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setShowAddBank(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Bank Account
                </Button>
              </div>
            )}

            {settings.bankAccounts.map(acc => (
              <BankCard key={acc.id} account={acc} onRemove={() => removeBank(acc.id)} />
            ))}

            {settings.bankAccounts.length === 2 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Maximum 2 bank accounts reached. Remove one to add another.
              </div>
            )}

            {/* Add bank form */}
            {showAddBank && (
              <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
                <p className="text-sm font-semibold text-gray-900">New Bank Account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Bank Name *</Label>
                    <Input placeholder="e.g. Commercial Bank" value={newBank.bankName}
                      onChange={e => setNewBank(b => ({ ...b, bankName: e.target.value }))} className="bg-white h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Account Name *</Label>
                    <Input placeholder="e.g. IndoorBook Pvt Ltd" value={newBank.accountName}
                      onChange={e => setNewBank(b => ({ ...b, accountName: e.target.value }))} className="bg-white h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Account Number *</Label>
                    <Input placeholder="e.g. 8001234567890" value={newBank.accountNumber}
                      onChange={e => setNewBank(b => ({ ...b, accountNumber: e.target.value }))} className="bg-white h-9 text-sm font-mono" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Branch <span className="text-gray-400">(optional)</span></Label>
                    <Input placeholder="e.g. Kandy Main" value={newBank.branch}
                      onChange={e => setNewBank(b => ({ ...b, branch: e.target.value }))} className="bg-white h-9 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setShowAddBank(false); setNewBank({ bankName: '', accountName: '', accountNumber: '', branch: '' }); }}>Cancel</Button>
                  <Button size="sm" className="flex-1 gap-1.5" onClick={addBank}><Plus className="w-3.5 h-3.5" /> Add Account</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Platform Settings'}
        </Button>
      </div>
    </div>
  );
}

// ── Account Settings Tab ──────────────────────────────────────────────────────
function AccountSettings() {
  const { user, updateUser } = useAuthStore();
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [details, setDetails] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const saveDetails = async () => {
    setDetailsSaving(true);
    try {
      const { data } = await api.patch(`/users/${user?.id}`, { name: details.name, phone: details.phone });
      updateUser({ name: data.name, phone: data.phone });
      setDetailsSaved(true);
      toast.success('Account details updated');
      setTimeout(() => setDetailsSaved(false), 3000);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update');
    } finally {
      setDetailsSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError('');
    if (!pw.current || !pw.newPw || !pw.confirm) { setPwError('All fields are required'); return; }
    if (pw.newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (pw.newPw !== pw.confirm) { setPwError('New passwords do not match'); return; }
    setPwSaving(true);
    try {
      await api.patch(`/users/${user?.id}/change-password`, { currentPassword: pw.current, newPassword: pw.newPw });
      toast.success('Password changed successfully');
      setPw({ current: '', newPw: '', confirm: '' });
    } catch (e: any) {
      setPwError(e?.response?.data?.message || 'Current password is incorrect');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" /> Account Details
          </CardTitle>
          <CardDescription>Update your name and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={details.name} onChange={e => setDetails(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} placeholder="+94771234567" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={details.email} disabled className="bg-gray-50 text-gray-400" />
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={saveDetails} disabled={detailsSaving} className="gap-2">
              {detailsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : detailsSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {detailsSaving ? 'Saving...' : detailsSaved ? 'Saved!' : 'Save Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-4 h-4 text-primary" /> Change Password
          </CardTitle>
          <CardDescription>Use a strong password of at least 8 characters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
            </div>
          )}

          {[
            { id: 'current', label: 'Current Password', value: pw.current, show: showCurrent, toggle: () => setShowCurrent(s => !s), onChange: (v: string) => setPw(p => ({ ...p, current: v })) },
            { id: 'new', label: 'New Password', value: pw.newPw, show: showNew, toggle: () => setShowNew(s => !s), onChange: (v: string) => setPw(p => ({ ...p, newPw: v })) },
            { id: 'confirm', label: 'Confirm New Password', value: pw.confirm, show: showConfirm, toggle: () => setShowConfirm(s => !s), onChange: (v: string) => setPw(p => ({ ...p, confirm: v })) },
          ].map(f => (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={f.id}>{f.label}</Label>
              <div className="relative">
                <Input
                  id={f.id}
                  type={f.show ? 'text' : 'password'}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {/* Strength indicator */}
          {pw.newPw && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    pw.newPw.length >= i * 3
                      ? pw.newPw.length >= 12 ? 'bg-emerald-500' : pw.newPw.length >= 8 ? 'bg-amber-500' : 'bg-red-400'
                      : 'bg-gray-200'
                  }`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {pw.newPw.length < 8 ? 'Too short' : pw.newPw.length < 12 ? 'Good strength' : 'Strong password'}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={changePassword} disabled={pwSaving} className="gap-2">
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {pwSaving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('platform');

  const TABS = [
    { id: 'platform' as Tab, label: 'Platform Settings', icon: Settings, desc: 'Payment methods, bank accounts' },
    { id: 'account' as Tab, label: 'Account Settings', icon: User, desc: 'Password, profile details' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your platform configuration and account</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-3">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 text-left transition-all ${active ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-gray-700'}`}>{tab.label}</p>
                <p className="text-xs text-gray-400">{tab.desc}</p>
              </div>
              {active && <ChevronRight className="w-4 h-4 text-primary ml-2" />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'platform' ? <PlatformSettings /> : <AccountSettings />}
      </div>
    </div>
  );
}
