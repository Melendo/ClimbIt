import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        api: 'modern-compiler', // or "modern"
      },
    },
  },
  server: {
    proxy: {
      '/escaladores': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/pistas': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  }
});
