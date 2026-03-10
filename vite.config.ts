import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
     base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',           // ensures Render can find the publish directory
    chunkSizeWarningLimit: 2000, // optional, suppress chunk size warnings
  },
  server: {
    hmr: false, // safe default for Render, since HMR isn’t used in production
  },
});
