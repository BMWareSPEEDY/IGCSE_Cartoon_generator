import type { Metadata, Viewport } from 'next';
import './globals.css';
import AmbientBackground from '@/components/3d/AmbientBackground';

export const metadata: Metadata = {
  title: 'Ironic Ink',
  description: 'Transform complex historical conflicts and geopolitical tensions into deep-thought allegorical political cartoons in the classic 1910s–1930s editorial woodcut tradition.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#081712',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-archive-900 text-parchment-100 min-h-screen antialiased selection:bg-brass-400 selection:text-archive-950">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
