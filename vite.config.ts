import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), ...(process.env.VITE_DEV_HTTPS === "true" ? [basicSsl()] : [])],
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true,
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
