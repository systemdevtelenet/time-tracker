import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Workforce Portal',
    short_name: 'Workforce',
    description: 'Shift tracking, attendance, and workforce insights.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F4F7FB',
    theme_color: '#2F6798',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
