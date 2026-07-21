import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the Android + iOS icon set (favicon, PWA icons, maskable icon,
// apple-touch-icon) from public/favicon.svg into public/. Regenerate with
// `npm run pwa:assets` whenever favicon.svg changes.
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    // favicon.svg already fills its own 32x32 frame edge-to-edge (rounded-rect
    // gradient background + inset glyph) — it's its own safe zone. The preset's
    // default 30% padding + white background for the apple-touch-icon assumes a
    // logo with no background of its own, and doubling up on padding here made
    // the iOS home-screen icon render as a tiny glyph surrounded by white.
    // `maskable` keeps its own default 30% padding — that one genuinely needs
    // it, since Android crops it with its own (more aggressive) shape mask.
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { fit: 'contain', background: 'white' } },
  },
  images: ['public/favicon.svg'],
})
