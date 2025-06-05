// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
     https: {
      key: '/app/certs/localhost-key.pem',
      cert: '/app/certs/localhost.pem',
    },
    historyApiFallback: true,
    port: process.env.VITE_FRONTEND_PORT ? parseInt(process.env.VITE_FRONTEND_PORT) : 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
});

