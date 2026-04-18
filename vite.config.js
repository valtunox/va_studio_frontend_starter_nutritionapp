import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3039,
    strictPort: true,
    // usePolling is important in Docker / WSL environments where inotify
    // events may not propagate from the host filesystem into the container.
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5112',
        changeOrigin: true,
        secure: false,
        // Handle ECONNREFUSED and other proxy errors gracefully so Vite
        // never crashes and the log is not spammed when the FastAPI backend
        // is temporarily unavailable (e.g. still starting up).
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            const code = err.code || ''
            const isUnavailable =
              code === 'ECONNREFUSED' ||
              code === 'ECONNRESET' ||
              code === 'ETIMEDOUT' ||
              code === 'ENOTFOUND'

            if (isUnavailable) {
              // Only log once every 30 s to avoid console flood
              if (!proxy._backendWarnedAt || Date.now() - proxy._backendWarnedAt > 30_000) {
                console.warn('[vite:proxy] Backend at :5112 is not reachable — returning 503 until it starts')
                proxy._backendWarnedAt = Date.now()
              }
            } else {
              console.error('[vite:proxy] Unexpected proxy error:', err.message)
            }

            // Return a JSON 503 instead of letting Vite throw unhandled errors
            if (res && !res.headersSent) {
              try {
                res.writeHead(503, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Backend unavailable', code, status: 503 }))
              } catch (_) { /* response already destroyed */ }
            }
          })
        },
      },
    },
  },
  preview: {
    port: 3039,
  },
})
