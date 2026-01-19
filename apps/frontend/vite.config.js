import { defineConfig } from 'vite';

export default defineConfig({
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
