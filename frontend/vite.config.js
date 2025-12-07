import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/", 
  resolve: {
    // This forces Vite to use ONE copy of React, fixing the null error
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,      // Listen on all IP addresses (Crucial for Docker)
    port: 5173,      // Force port 5173
    strictPort: true,
    watch: {
      usePolling: true // Needed for Windows Docker to see file changes
    },
    proxy: {
      '/api': {
        target: 'http://wc-backend:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
