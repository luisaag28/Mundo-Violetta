import type { Metadata, Viewport } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import { MotionConfig } from 'motion/react';
import { EstadoConexion } from '@/components/EstadoConexion';
import './globals.css';

const display = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--fuente-display',
  display: 'swap',
});

const cuerpo = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--fuente-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'El Mundo de Violetta',
  description: 'Mis hábitos, mis misiones y mi mundo que crece cada día.',
  appleWebApp: {
    capable: true,
    title: 'Violetta',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF6EE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${cuerpo.variable}`}>
      <body>
        {/* Respeta la preferencia del sistema de "menos movimiento" en TODA la app */}
        <MotionConfig reducedMotion="user">
          <EstadoConexion />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
