import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,              // allows network access
    port: 5173,              // default vite port
  },
  preview: {
    port: 4173,              // preview port
  },
  build: {
    outDir: 'dist',
  },
  // 👇 This ensures SPA fallback (important for Vercel refresh issue)
  optimizeDeps: {
    include: [],
  }
})
