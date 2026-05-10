import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'RootFacts - AI Plant Recognition',
        short_name: 'RootFacts',
        description:
          'Aplikasi AI untuk mengenali sayuran dan memberikan fakta menarik',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        additionalManifestEntries: [
          { url: '/model/metadata.json', revision: '1' },
          { url: '/model/model.json', revision: '1' },
          { url: '/model/weights.bin', revision: '1' },
        ],
        runtimeCaching: [
          {
            urlPattern: /\/model\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-models',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3001,
    host: true,
  },
});
