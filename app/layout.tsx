import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Header from '@/components/common/Header';
import AudioPlayer from '@/components/common/AudioPlayer';
import { Toaster } from 'react-hot-toast';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'),
  title: 'QuiqerrTrade Market - Tokenized Music Remix Trading',
  description: 'Turn music remixes into tradable assets on Solana. Create, remix, trade, and earn with AI-powered discovery.',
  keywords: 'music, remix, trading, Solana, crypto, NFT, creator economy, Web3',
  authors: [{ name: 'QuiqerrTrade Market' }],
  openGraph: {
    title: 'QuiqerrTrade Market',
    description: 'Tokenized Music Remix Trading Platform',
    url: 'https://quiqerrtrade.market',
    siteName: 'QuiqerrTrade Market',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QuiqerrTrade Market',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuiqerrTrade Market',
    description: 'Turn music remixes into tradable assets',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-dark-300 dark:to-dark-400">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <AudioPlayer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e1e2a',
                color: '#fff',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}