import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  },
  server: {
    port: 7002,
    proxy: {
      '/api': {
        target: 'https://osbackend-zl1h.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
