import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), createHtmlPlugin({ minify: true })],
  server: {
    port: 3002,
    strictPort: true,
    proxy: {
      "/api/voicebox": {
        target: "http://72.62.24.13:17493",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voicebox/, ""),
      },
      "/api/cognee": {
        target: "http://72.62.24.13:8140",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cognee/, ""),
      },
      "/api/bytebot": {
        target: "http://72.62.24.13:9991",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bytebot/, ""),
      },
      "/api/sim": {
        target: "http://72.62.24.13:3014/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sim/, ""),
      },
      "/api/sim-socket": {
        target: "http://72.62.24.13:3012",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sim-socket/, ""),
      },
    },
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
    chunkSizeWarningLimit: 1200,
  },
});
