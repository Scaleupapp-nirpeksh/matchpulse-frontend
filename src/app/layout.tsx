import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MatchPulse',
  description: 'Live sports scoring platform',
  keywords: [
    'live scoring',
    'sports',
    'cricket',
    'football',
    'basketball',
    'volleyball',
    'tennis',
    'tournament management',
    'real-time',
  ],
  openGraph: {
    title: 'MatchPulse',
    description: 'Live sports scoring platform',
    type: 'website',
    siteName: 'MatchPulse',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-bg text-text-primary`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
