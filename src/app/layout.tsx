import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import CursorGlow from '@/components/effects/CursorGlow';
import LegalBanner from '@/components/LegalBanner';
import JsonLd from '@/components/JsonLd';
import PwaSetup from '@/components/pwa/PwaSetup';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import MobileStickyBar from '@/components/MobileStickyBar';
import { env } from '@/lib/env';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
const SITE_URL = env.siteUrl.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Diseño Web e IA en Zaragoza | LOCALIS AI',
  description: 'Agencia de diseño web e inteligencia artificial en Zaragoza. Creamos páginas web de alto impacto, asistentes virtuales con IA (Stella 24/7) y software de reparto GPS para PYMEs y comercios locales en Zaragoza. Solicita tu auditoría gratuita.',
  keywords: [
    'LOCALIS AI', 'diseño web Zaragoza', 'diseño web e IA en Zaragoza', 'asistente virtual IA Zaragoza', 'software GPS reparto', 'asistente IA citas', 'PYME Zaragoza', 'plataforma IA Aragón',
    'logística digital', 'atención al cliente IA Zaragoza', 'facturación automática', 'agenda inteligente',
    'diseño web PYME Zaragoza', 'desarrollo web local Zaragoza', 'ecommerce local', 'sistema de pedidos Zaragoza',
  ],
  authors: [{ name: 'LOCALIS AI' }],
  creator: 'LOCALIS AI',
  applicationName: 'LOCALIS AI',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Diseño Web e IA en Zaragoza | LOCALIS AI',
    description: 'Agencia de diseño web e inteligencia artificial en Zaragoza. Creamos páginas web de alto impacto, asistentes virtuales con IA (Stella 24/7) y software de reparto GPS para PYMEs y comercios locales en Zaragoza.',
    type: 'website',
    siteName: 'LOCALIS AI',
    locale: 'es_ES',
    url: '/',
    images: [
      { url: '/icons/icon-512.png', width: 512, height: 512, alt: 'LOCALIS AI - Diseño Web e IA en Zaragoza para PYMEs' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diseño Web e IA en Zaragoza | LOCALIS AI',
    description: 'Agencia de diseño web e inteligencia artificial en Zaragoza. Páginas web modernas, asistente Stella IA 24/7 y software GPS sin comisiones para PYMEs.',
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
    <html lang="es" suppressHydrationWarning className="w-full p-0 m-0 scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <JsonLd />
      </head>
      <body
        className={inter.variable + ' ' + spaceGrotesk.variable + ' w-full min-h-screen bg-[#0B0F17] text-foreground overflow-x-hidden p-0 m-0 pb-16 md:pb-0 antialiased'}
      >
        <PwaSetup />
        <CursorGlow />
        <LegalBanner />
        <WhatsAppFloat />
        <MobileStickyBar />
        {children}
      </body>
    </html>
  );
}
