import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/med-time/', // project page: https://avieshel.github.io/med-time/
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Med-Time',
        short_name: 'Med-Time',
        description: 'Medicine alarm times for Mom — hands off to iOS Shortcuts.',
        display: 'standalone',
        background_color: '#f2f2f7',
        theme_color: '#f2f2f7',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Offline-capable single screen; no runtime caching needed in v1.
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
