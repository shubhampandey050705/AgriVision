// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Frontend dev server runs here
    proxy: {
      // Forward all /api calls to Flask backend
      "/api": {
        target: "http://127.0.0.1:5000", // Flask backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
