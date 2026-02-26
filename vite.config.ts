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
        target: "http://31.97.52.22:17493",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voicebox/, ""),
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
