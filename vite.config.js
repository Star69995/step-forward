import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // Bind to all network interfaces (not just localhost) so the dev
    // server is reachable from other devices on the same LAN.
    host: true,
  },
  resolve: {
    // html2pdf.js requires "html2canvas" internally; html2canvas itself can't
    // parse the oklab()/color-mix() colors Tailwind v4 emits for gradients and
    // opacity modifiers, which made every PDF export throw. html2canvas-pro is
    // a drop-in fork that adds support for those color functions.
    alias: {
      html2canvas: 'html2canvas-pro',
    },
  },
  plugins: [react(),
    VitePWA({
      mode: 'development',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'צעד קדימה',
        short_name: 'צעד קדימה',
        description: 'מילוי, שמירה וייצוא תוכנית אישית לקידום מטרות',
        lang: 'he',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Splash-screen/toolbar background before CSS loads — matches
        // --color-bg-page (light) in src/index.css; the header gradient
        // (theme_color) doesn't change between light/dark mode.
        background_color: '#f1f5f9',
        theme_color: '#6e64c6',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
  },
})
