'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays, CreditCard, User, LogOut,
  MapPin, Menu, X, Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const NAV = [
  { href: '/dashboard', label: 'My Bookings', icon: CalendarDays, exact: true },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Indoor<span className="text-primary">Book</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/stadiums">
              <button className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors font-medium">
                Book a Court
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name ?? 'User'}</span>
            </div>
            <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {NAV.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-medium w-full">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
