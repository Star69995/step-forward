import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
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
      manifest: {
        name: 'צעד קדימה',
        short_name: 'צעד קדימה',
        themeColor: '#a29bfe',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
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
