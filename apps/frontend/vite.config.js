import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Configuración para preprocesadores CSS
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        api: 'modern-compiler',
      },
    },
  },
  // Configuración del servidor de desarrollo
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
      '/zonas': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/rocodromos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Configuración para la construcción del proyecto
  build: {
    outDir: 'dist',
  }
});
