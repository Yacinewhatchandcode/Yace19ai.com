import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Force cache busting for images
          if (/\.(png|jpe?g|svg|gif|webp)$/i.test(assetInfo.name || '')) {
            return `assets/[name]-[hash][extname]`;
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
})
