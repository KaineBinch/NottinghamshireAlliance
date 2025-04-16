import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ph-proxy': {
        target: 'https://eu.i.posthog.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ph-proxy/, '')
      },
      '/ph-assets': {
        target: 'https://eu-assets.i.posthog.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ph-assets/, '')
      },
      '/array': {
        target: 'https://eu-assets.i.posthog.com',
        changeOrigin: true
      }
    }
  }
})