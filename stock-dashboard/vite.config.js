import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
