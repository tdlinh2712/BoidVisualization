import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['test5.wasm']  // Prevents Vite from trying to process WASM files
  },
  build: {
    target: 'esnext',  // Ensures modern JavaScript features are available
    outDir: 'dist'
  },
  server: {
    headers: {
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  },
  assetsInclude: ['**/*.wasm'],
  resolve: {
    alias: {
      '@wasm': '/public'  // Optional: for easier imports
    }
  },
}) 