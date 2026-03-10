import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
