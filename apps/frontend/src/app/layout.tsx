import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL?.replace(':4000', ':3000') || 'http://localhost:3000'),
  title: {
    default: 'IndoorBook – Indoor Sports Court Booking',
    template: '%s | IndoorBook',
  },
  description:
    'Book indoor sports courts instantly – badminton, tennis, basketball and more. Find venues near you, check availability, and confirm your slot in seconds.',
  keywords: ['indoor sports', 'court booking', 'badminton', 'tennis', 'sports venue'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://indoorbook.app',
    siteName: 'IndoorBook',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
