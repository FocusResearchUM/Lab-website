import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  // Relative assets + hash routing work on static hosts, including project subfolders.
  base: './',
  build: { sourcemap: false },
});
