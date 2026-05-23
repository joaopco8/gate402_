import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Gate402 Dashboard',
  description: 'Solana x402 payment gateway dashboard',
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
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <UserProvider>{children}</UserProvider>
        <GoogleAnalytics gaId="G-NS4QRRXMQ2" />
      </body>
    </html>
  );
}
