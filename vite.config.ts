import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/inventory': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/part-categories': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/suppliers': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/orders': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/reservations': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
