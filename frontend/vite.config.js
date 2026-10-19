import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendOrigin =
  process.env.CAREERLYST_BACKEND_ORIGIN || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backendOrigin,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
