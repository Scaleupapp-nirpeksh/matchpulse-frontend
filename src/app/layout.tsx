import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MatchPulse',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
