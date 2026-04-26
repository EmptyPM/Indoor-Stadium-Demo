import Link from 'next/link';
import { MapPin, Calendar, Zap, Shield, Clock, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const sports = [
    { name: 'Badminton', emoji: '🏸', count: '24 courts' },
    { name: 'Tennis', emoji: '🎾', count: '12 courts' },
    { name: 'Basketball', emoji: '🏀', count: '8 courts' },
    { name: 'Volleyball', emoji: '🏐', count: '6 courts' },
    { name: 'Football', emoji: '⚽', count: '10 courts' },
    { name: 'Squash', emoji: '🏓', count: '4 courts' },
  ];

  const features = [
    { icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: 'Real-time Availability', desc: 'See live slot availability and book instantly.' },
    { icon: <Zap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', title: 'Instant Confirmation', desc: 'Get confirmed in seconds, not hours.' },
    { icon: <Shield className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', title: 'Secure Payments', desc: 'Pay online or at venue with full security.' },
    { icon: <MapPin className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50', title: 'Multiple Locations', desc: 'Find courts across multiple cities.' },
  ];

  const steps = [
    { step: '01', title: 'Choose a Venue', desc: 'Browse verified indoor sports facilities' },
    { step: '02', title: 'Pick a Slot', desc: 'Select your preferred date and time' },
    { step: '03', title: 'Confirm & Play', desc: 'Instant booking confirmation' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Indoor<span className="text-primary">Book</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            <Link href="/stadiums" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Venues</Link>
            <Link href="/booking" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Book Now</Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">My Bookings</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Zap className="w-3 h-3" /> Book your court in 60 seconds
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Book Indoor Sports<br />
            <span className="text-primary">Courts Instantly</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find and book the perfect court for badminton, tennis, basketball and more.
            Real-time availability, instant confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/stadiums">
              <Button size="lg" className="gap-2 px-8">
                Browse Venues <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8">
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium text-gray-600">4.9</span> rating
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <span><span className="font-medium text-gray-600">500+</span> courts</span>
            <div className="w-px h-4 bg-gray-200" />
            <span><span className="font-medium text-gray-600">10k+</span> bookings</span>
          </div>
        </div>
      </section>

      {/* Sports grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">All Your Favourite Sports</h2>
            <p className="text-gray-500">Premium indoor facilities for every game</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sports.map((s) => (
              <Link
                key={s.name}
                href={`/stadiums?sport=${s.name.toUpperCase()}`}
                className="group"
              >
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{s.emoji}</div>
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Three simple steps to get on the court</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">{i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why IndoorBook?</h2>
            <p className="text-gray-500">Everything you need for a seamless booking experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join thousands of sports enthusiasts booking courts every day.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-10 gap-2">
              Start Booking Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <p>© 2025 IndoorBook. All rights reserved.</p>
      </footer>
    </div>
  );
}
