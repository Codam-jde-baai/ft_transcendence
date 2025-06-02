// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
     https: {
      key: '/certs/localhost-key.pem',
      cert: '/certs/localhost.pem',
    },
    historyApiFallback: true,
    port: process.env.VITE_FRONTEND_PORT ? parseInt(process.env.VITE_FRONTEND_PORT) : 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
});

// // If mkcerts works!
// import { defineConfig } from 'vite';
// import fs from 'fs';

// export default defineConfig({
//   server: {
//     https: {
//       key: fs.readFileSync('/app/certs/localhost-key.pem'),
//       cert: fs.readFileSync('/app/certs/localhost.pem'),
//     },
//     historyApiFallback: true,
//     port: process.env.VITE_FRONTEND_PORT ? parseInt(process.env.VITE_FRONTEND_PORT) : 5173,
//     host: '0.0.0.0',
//     strictPort: true,
//   },
// });
