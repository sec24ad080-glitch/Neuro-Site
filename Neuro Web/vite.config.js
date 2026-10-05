import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Cache all app assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        runtimeCaching: [
          {
            // Cache lesson and quiz JSON data
            urlPattern: /\/src\/data\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'neurolex-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Cache Google Fonts (for offline use)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'NeuroLite — AI Learning Assistant',
        short_name: 'NeuroLite',
        description: 'Offline AI-powered adaptive learning for neurodiverse students',
        theme_color: '#6366f1',
        background_color: '#0d0d1a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['education', 'productivity'],
        lang: 'en',
      },
      devOptions: {
        enabled: true,  // enable SW in dev so we can test it
      },
    }),
  ],
  resolve: { alias: { '@': '/src' } },
  // Ensure Ollama CORS — allow loopback requests
  server: {
    port: 4000,
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
})
