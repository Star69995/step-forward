import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Firebase Local Emulator Suite ports - must match "emulators" in firebase.json.
const AUTH_EMULATOR = 'http://127.0.0.1:9099'
const FIRESTORE_EMULATOR = 'http://127.0.0.1:8080'

// `npm run dev:emulator` only: route the emulators' endpoints through the dev
// server itself, so a phone on the LAN needs to reach just this one port
// (not 9099/8080 too) and the Google sign-in popup/iframe are same-origin
// with the app. src/services/firebase.js points the SDK at the page's own
// origin to match.
const emulatorProxy = {
  '/emulator': AUTH_EMULATOR,
  '/identitytoolkit.googleapis.com': AUTH_EMULATOR,
  '/securetoken.googleapis.com': AUTH_EMULATOR,
  '/google.firestore.v1.Firestore': { target: FIRESTORE_EMULATOR, ws: true },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Bind to all network interfaces (not just localhost) so the dev
    // server is reachable from other devices on the same LAN.
    host: true,
    proxy: mode === 'emulator' ? emulatorProxy : undefined,
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
}))
