import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => {
 const env = loadEnv(mode, process.cwd(), '');
 return {
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
   host: '127.0.0.1', port: 5173,
   proxy: { '/api': process.env.API_PROXY_TARGET || env.API_PROXY_TARGET || 'http://127.0.0.1:8080' }
  }
 };
});
