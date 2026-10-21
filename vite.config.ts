import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Where the app is served from. GitHub Pages serves it under /<repo>/, so the deploy workflow sets BASE_PATH.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // Installable, offline-capable app. Everything a user needs is on the device,
    // so the service worker precaches the whole app shell.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'sw-notifications.js'],
      manifest: {
        name: 'Viz it',
        short_name: 'Viz it',
        description: 'Write what you feel and where you want to be, and get a guided visualization made for you.',
        start_url: base,
        scope: base,
        display: 'standalone',
        theme_color: '#4338ca',
        background_color: '#f7f6f2',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: `${base}index.html`,
        // The AI endpoint must always hit the network (and fail cleanly when offline).
        navigateFallbackDenylist: [/^\/api\//],
        importScripts: ['sw-notifications.js'],
        // Practice audio is too big to download up front. Each recording is saved the first time it plays,
        // so a practice works offline after you've done it once. The list of recordings is checked online first.
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.+\.mp3$/,
            handler: 'CacheFirst',
            options: { cacheName: 'practice-audio', expiration: { maxEntries: 500 } },
          },
          {
            urlPattern: /\/audio\/manifest\.json$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'practice-audio-manifest', networkTimeoutSeconds: 3 },
          },
        ],
      },
    }),
  ],
  server: {
    // The AI analysis server (npm run dev:api) runs separately in development.
    proxy: { '/api': 'http://localhost:8787' },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
