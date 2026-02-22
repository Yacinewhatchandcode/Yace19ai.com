import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/.netlify/functions'),
        bypass: function () {
          // Mock fallback if Netlify server is not running on 8888
          // We just let it fail naturally to mimic real network failure,
          // which the frontend is designed to handle (graceful fallback).
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|svg|gif|webp)$/i.test(assetInfo.name || "")) {
            return `assets/[name]-[hash][extname]`;
          }
          return "assets/[name]-[hash][extname]";
        },
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "three-vendor": ["three", "@react-three/fiber", "@react-three/drei"],
          "motion-vendor": ["framer-motion"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
