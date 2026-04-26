'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowLeft, Loader2, Users } from 'lucide-react';
import { useStadium } from '@/hooks/use-stadiums';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function StadiumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: stadium, isLoading } = useStadium(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!stadium) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Indoor<span className="text-primary">Book</span></span>
          </Link>
          <Link href="/booking"><Button size="sm">Book a Court</Button></Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back */}
        <Link href="/stadiums" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to venues
        </Link>

        {/* Stadium card */}
        <Card className="overflow-hidden mb-8">
          <div className="h-56 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
            <span className="text-8xl">🏟️</span>
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{stadium.name}</h1>
                {stadium.description && (
                  <p className="text-gray-500 mb-4 max-w-2xl leading-relaxed">{stadium.description}</p>
                )}
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {stadium.address}{stadium.location?.name ? `, ${stadium.location.name}` : ''}
                  </span>
                  {stadium.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone className="w-4 h-4 text-gray-400" /> {stadium.phone}
                    </span>
                  )}
                  {stadium.email && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail className="w-4 h-4 text-gray-400" /> {stadium.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {stadium.courts?.length || 0} courts available
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courts */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Available Courts</h2>
          <p className="text-gray-500 text-sm">Select a court to check availability and book</p>
        </div>

        {!stadium.courts?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p>No courts available at this venue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stadium.courts.map((court: any) => (
              <Card key={court.id} className="hover:shadow-md hover:border-primary/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border">
                      {court.sport?.icon ?? '🏅'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{court.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{court.sport?.name ?? 'Sport'}</p>
                    </div>
                  </div>

                  {court.description && (
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{court.description}</p>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant={court.isIndoor ? 'secondary' : 'outline'} className="text-xs">
                      {court.isIndoor ? '🏠 Indoor' : '🌤️ Outdoor'}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Up to {court.capacity}
                    </span>
                  </div>

                  <Separator className="mb-4" />

                  {court.pricings?.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-400">Starting from</span>
                      <span className="font-bold text-primary">
                        LKR {Math.min(...court.pricings.map((p: any) => p.pricePerHour))}/hr
                      </span>
                    </div>
                  )}

                  <Link href={`/booking?courtId=${court.id}`}>
                    <Button className="w-full" size="sm">Book This Court</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
