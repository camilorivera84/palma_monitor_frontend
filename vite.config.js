import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.trycloudflare.com',
      '.ngrok-free.dev',
      '.loca.lt',
      'duty-barbara-bureau-ellis.trycloudflare.com',
      'hiking-solve-duration-match.trycloudflare.com',
      'tigers-commonwealth-brass-sensitive.trycloudflare.com',
      'fishing-lottery-newfoundland-galaxy.trycloudflare.com',
    ],
    proxy: {
      '/api': {
        target: 'https://plastic-strengthening-cam-msgstr.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
  },
});
