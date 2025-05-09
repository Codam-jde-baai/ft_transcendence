// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    historyApiFallback: true,
    port: process.env.VITE_FRONTEND_PORT ? parseInt(process.env.VITE_FRONTEND_PORT) : 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
});
