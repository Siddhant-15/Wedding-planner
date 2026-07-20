import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), imagetools()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',   // Ensures it works on localhost, 127.0.0.1, LAN IP, etc.
    port: 5173,        // Explicit port to avoid conflicts
    strictPort: true,  // Fail if port is occupied
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        // target: 'https://wedding-planner-production-50de.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
