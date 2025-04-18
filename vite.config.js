import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          const posthogKey = env.VITE_REACT_APP_PUBLIC_POSTHOG_KEY;
          const posthogHost = env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST;

          return html
            .replace(/%VITE_REACT_APP_PUBLIC_POSTHOG_KEY%/g, posthogKey)
            .replace(/%VITE_REACT_APP_PUBLIC_POSTHOG_HOST%/g, posthogHost);
        }
      }
    ],
    server: {
      proxy: {
        '/ph-proxy': {
          target: env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ph-proxy/, '')
        },
        '/ph-assets': {
          target: env.VITE_REACT_APP_POSTHOG_ASSETS_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ph-assets/, '')
        },
        '/array': {
          target: env.VITE_REACT_APP_POSTHOG_ASSETS_HOST,
          changeOrigin: true
        }
      }
    }
  }
})