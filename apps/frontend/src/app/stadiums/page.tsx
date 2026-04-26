'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useStadiums } from '@/hooks/use-stadiums';
import { getSportEmoji } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StadiumsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStadiums({ page, limit: 9, search, city });

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
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
            <Link href="/booking"><Button size="sm">Book a Court</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Indoor Sports Venues</h1>
          <p className="text-gray-500">Discover premium courts near you</p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search stadiums..."
              className="pl-9 bg-white"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              placeholder="City..."
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">No venues found</p>
            <p className="text-gray-400 text-sm">Try a different search or city</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              {data?.total} venue{data?.total !== 1 ? 's' : ''} found
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.data?.map((stadium: any) => (
                <Link key={stadium.id} href={`/stadium/${stadium.id}`}>
                  <Card className="overflow-hidden hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group">
                    {/* Image */}
                    <div className="h-44 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                      <span className="text-5xl">🏟️</span>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {stadium.name}
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          {stadium._count?.courts || 0} courts
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {stadium.city}, {stadium.state}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Indoor sports center</span>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          View courts <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {data?.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-sm text-gray-400">Page {page} of {data.totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
