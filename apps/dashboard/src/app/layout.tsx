import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter, Space_Grotesk, JetBrains_Mono, Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-space',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-jb',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Metera — Billing infrastructure for AI agents',
    template: '%s | Metera',
  },
  description: 'Billing infrastructure for AI agents. USDC on Solana. No banks, no credit cards, no humans in the loop.',
  keywords: [
    'AI agents',
    'API monetization',
    'Solana',
    'USDC',
    'x402',
    'HTTP 402',
    'MCP',
    'billing',
    'micropayments',
    'metera',
  ],
  authors: [{ name: 'Metera' }],
  creator: 'Metera',
  metadataBase: new URL('https://metera.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://metera.dev',
    siteName: 'Metera',
    title: 'Metera — Billing infrastructure for AI agents',
    description: 'USDC on Solana. No banks, no credit cards, no humans.',
    images: [
      {
        url: 'https://metera.dev/og',
        width: 1200,
        height: 630,
        alt: 'Metera',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metera — Billing infrastructure for AI agents',
    description: 'USDC on Solana. No banks, no credit cards, no humans.',
    images: ['https://metera.dev/og'],
    creator: '@metera_dev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logos/favicon-metera.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${roboto.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <UserProvider>{children}</UserProvider>
        <GoogleAnalytics gaId="G-NS4QRRXMQ2" />
      </body>
    </html>
  );
}
