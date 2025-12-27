import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UnityRide',
    short_name: 'UnityRide',
    description: 'Community ride-sharing app',
    start_url: '/login', // When they open the app, go here
    display: 'standalone', // Hides the browser URL bar (looks like a native app)
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}