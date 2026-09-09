import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    chunkSizeWarningLimit: 10000,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-web-ifc': ['web-ifc', 'web-ifc-three'],
          'vendor-charts': ['recharts', 'd3-array', 'd3-scale'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  }
});
