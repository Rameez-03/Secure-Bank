import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    extensions: ['.jsx', '.js', '.mjs', '.ts', '.tsx', '.json'],
  },
});
