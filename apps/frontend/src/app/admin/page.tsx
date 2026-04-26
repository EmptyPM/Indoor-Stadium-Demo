'use client';

import Link from 'next/link';
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useBookings } from '@/hooks/use-bookings';
import { formatDate, formatCurrency, getSportEmoji } from '@/lib/utils';

export default function AdminOverviewPage() {
  const { user } = useAuthStore();
  const { data: bookingsData, isLoading } = useBookings({ limit: 8 });

  const stats = [
    {
      label: 'Total Bookings',
      value: bookingsData?.total ?? '—',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(
        bookingsData?.data?.reduce((s: number, b: any) => s + b.totalPrice, 0) ?? 0,
      ),
      change: '+8.2%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Active Users',
      value: '—',
      change: '+4%',
      trend: 'up',
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Active Venues',
      value: '—',
      change: '0%',
      trend: 'neutral',
      icon: Building2,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, desc: 'View, edit & assign roles' },
    { label: 'Manage Venues', href: '/admin/stadiums', icon: Building2, desc: 'Add courts & pricing' },
    { label: 'All Bookings', href: '/admin/bookings', icon: Calendar, desc: 'Confirm or cancel slots' },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard, desc: 'Track & process refunds' },
  ];

  const statusVariantMap: Record<string, any> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'destructive',
    COMPLETED: 'info',
    NO_SHOW: 'secondary',
  };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here&apos;s what&apos;s happening with IndoorBook today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : stat.trend === 'down' ? (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up'
                        ? 'text-emerald-600'
                        : stat.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings – takes 2 cols */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest reservations across all venues</CardDescription>
              </div>
              <Link href="/admin/bookings">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y divide-gray-100">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-40 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : bookingsData?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Calendar className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookingsData?.data?.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Sport icon */}
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {booking.court?.sport?.icon ?? '🏅'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {booking.court?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.user?.name} &middot;{' '}
                          {formatDate(booking.bookingDate)} &middot;{' '}
                          {booking.startTime}–{booking.endTime}
                        </p>
                      </div>

                      {/* Amount */}
                      <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {formatCurrency(booking.totalPrice)}
                      </p>

                      {/* Status badge */}
                      <Badge variant={statusVariantMap[booking.status] || 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions – 1 col */}
        <div className="space-y-4">
          {/* Quick links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {link.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* System status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {[
                { label: 'API Server', status: 'Operational' },
                { label: 'Database', status: 'Operational' },
                { label: 'Payments', status: 'Operational' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-gray-600">{s.label}</span>
                  </div>
                  <Badge variant="success">{s.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
