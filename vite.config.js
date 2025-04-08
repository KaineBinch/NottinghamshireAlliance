import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const cacheControlPlugin = () => {
  return {
    name: 'cache-control-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    cacheControlPlugin()
  ],
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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'framer-motion',
          ],
          ui: [
            '@emotion/react',
            '@emotion/styled',
            '@mui/material',
            '@mui/x-data-grid',
          ],
          icons: [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/free-brands-svg-icons',
            '@fortawesome/free-regular-svg-icons',
            '@fortawesome/free-solid-svg-icons',
            '@fortawesome/react-fontawesome',
            'react-icons',
            'lucide-react',
          ],
        }
      }
    }
  }
})