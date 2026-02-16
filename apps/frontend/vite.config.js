import { defineConfig } from 'vite';
import path from 'path';

const PORT = process.env.PORT || 3000;

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
        target: 'http://localhost:' + PORT,
        changeOrigin: true,
      },
      '/pistas': {
        target: 'http://localhost:' + PORT,
        changeOrigin: true,
      },
      '/zonas': {
        target: 'http://localhost:' + PORT,
        changeOrigin: true,
      },
      '/rocodromos': {
        target: 'http://localhost:' + PORT,
        changeOrigin: true,
      },
    },
  },
  // Configuración para la construcción del proyecto
  build: {
    outDir: 'dist',
  }
});
