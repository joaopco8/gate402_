import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Space_Grotesk, JetBrains_Mono, Roboto } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';

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

export const metadata: Metadata = {
  title: {
    default: 'Gate402 — Billing infrastructure for AI agents',
    template: '%s | Gate402',
  },
  description: 'Drop-in middleware that charges AI agents in USDC on Solana. No banks. No credit cards. No humans in the loop.',
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
  ],
  authors: [{ name: 'Gate402' }],
  creator: 'Gate402',
  metadataBase: new URL('https://www.gate402.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.gate402.dev',
    siteName: 'Gate402',
    title: 'Gate402 — Billing infrastructure for AI agents',
    description: 'Drop-in middleware that charges AI agents in USDC on Solana.',
    images: [
      {
        url: 'https://www.gate402.dev/og',
        width: 1200,
        height: 630,
        alt: 'Gate402',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gate402 — Billing infrastructure for AI agents',
    description: 'Drop-in middleware that charges AI agents in USDC on Solana.',
    images: ['https://www.gate402.dev/og'],
    creator: '@gate402_',
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
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${roboto.variable}`} suppressHydrationWarning>
        <UserProvider>{children}</UserProvider>
        <GoogleAnalytics gaId="G-NS4QRRXMQ2" />
      </body>
    </html>
  );
}
