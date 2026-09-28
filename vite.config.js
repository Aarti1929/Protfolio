import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`         -> normal multi-chunk build (lazy-loaded case study, etc.)
// `npm run build:single`  -> one self-contained index.html (easy to host / share)
export default defineConfig({
  plugins: [react(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
  build: {
    chunkSizeWarningLimit: 1800,
    // SINGLE=1: inline every asset (images included) as base64 so the whole
    // site — graphic-work gallery photos included — lives in one HTML file.
    assetsInlineLimit: process.env.SINGLE ? 100000000 : 4096,
  },
})
