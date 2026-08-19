import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'El Mundo de Violetta',
    short_name: 'Violetta',
    description: 'Mis hábitos, mis misiones y mi mundo que crece cada día.',
    start_url: '/mi-dia',
    display: 'standalone',
    background_color: '#FBF6EE',
    theme_color: '#FBF6EE',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
