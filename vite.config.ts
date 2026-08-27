import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-404-html',
      closeBundle() {
        // Copy index.html to 404.html for SPA fallback on static hosts
        try {
          copyFileSync(
            resolve(process.cwd(), 'dist/index.html'),
            resolve(process.cwd(), 'dist/404.html')
          )
          console.log('✓ Copied dist/index.html → dist/404.html')
        } catch (e) {
          console.warn('Could not copy 404.html:', e)
        }
      },
    },
  ],
  base: '/',
  server: {
    // Proxy API calls to the FastAPI backend so the dev server is same-origin.
    // Avoids CORS entirely when Vite falls back to a port other than 5173.
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8002',
        changeOrigin: true,
      },
    },
  },
})
