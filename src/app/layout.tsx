import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import CursorGlow from '@/components/effects/CursorGlow';
import LegalBanner from '@/components/LegalBanner';
import JsonLd from '@/components/JsonLd';
import PwaSetup from '@/components/pwa/PwaSetup';
import { env } from '@/lib/env';
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const SITE_URL = env.siteUrl.replace(/\/$/, '');
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Diseño Web, IA y Software GPS para PYMEs en Zaragoza y Aragón | LOCALIS AI',
  description: 'LOCALIS AI: Diseño web con IA, sistemas GPS de reparto en tiempo real y asistente virtual para citas. Soluciones completas para PYMEs en Zaragoza y Aragón. Sin comisiones. Demo gratuita en 2 horas.',
  keywords: [
    'LOCALIS AI', 'diseño web Zaragoza', 'software GPS reparto', 'asistente IA citas', 'PYME Zaragoza', 'plataforma IA Aragón',
    'logística digital', 'atención al cliente IA', 'facturación automática', 'agenda inteligente',
    'diseño web PYME', 'SaaS España', 'ecommerce local', 'sistema de pedidos',
  ],
  authors: [{ name: 'LOCALIS AI' }],
  creator: 'LOCALIS AI',
  applicationName: 'LOCALIS AI',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Diseño Web, IA y Software GPS para PYMEs en Zaragoza y Aragón | LOCALIS AI',
    description: 'LOCALIS AI: Diseño web con IA, sistemas GPS de reparto y asistente IA para citas. Soluciones completas para PYMEs en Zaragoza y Aragón. Sin comisiones. Demo gratuita.',
    type: 'website',
    siteName: 'LOCALIS AI',
    locale: 'es_ES',
    url: '/',
    images: [
      { url: '/icons/icon-512.png', width: 512, height: 512, alt: 'LOCALIS AI - Diseño Web, IA y GPS para PYMEs en Zaragoza' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diseño Web, IA y Software GPS para PYMEs en Zaragoza y Aragón | LOCALIS AI',
    description: 'LOCALIS AI: Diseño web con IA, sistemas GPS de reparto y asistente IA para citas. Soluciones completas para PYMEs en Zaragoza y Aragón. Sin comisiones. Demo gratuita.',
    images: ['/icons/icon-512.png'],
    creator: '@localis_ai',
    site: '@localis_ai',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};
export const viewport: Viewport = {
  themeColor: '#0B0F17',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
  maximumScale: 1,
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className="w-full p-0 m-0">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <JsonLd />
      </head>
      <body
        className={inter.variable + ' ' + spaceGrotesk.variable + ' w-full min-h-screen bg-[#0B0F17] text-foreground overflow-x-hidden p-0 m-0 antialiased'}
      >
        <PwaSetup />
        <CursorGlow />
        <LegalBanner />
        {children}
      </body>
    </html>
  );
}
