import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_PRECACHE_ASSETS = [
  'icons/apple-touch-icon.png',
  'icons/favicon.ico',
  'icons/pwa-128x128.png',
  'icons/pwa-192x192.png',
  'icons/pwa-512x512.png',
  'icons/presa.png',
  'assets/Roco.svg',
  'assets/johnDoe.png',
  'assets/medalla.svg',
  'assets/placeholder.webp',
  'assets/presa.svg',
  'assets/rocodromoDefecto.webp',
];

export default defineConfig({
  plugins: [
    // eslint-disable-next-line new-cap
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: STATIC_PRECACHE_ASSETS,
      manifest: {
        name: 'ClimbIt',
        short_name: 'ClimbIt',
        description: 'Aplicacion para gestionar escaladores, rocodromos, zonas y rutas',
        theme_color: '#f8f9fa',
        background_color: '#f8f9fa',
        orientation: 'portrait',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        scope: '/',
        start_url: '/',
        lang: 'es',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/(escaladores|pistas|rocodromos|zonas|amistades)\b/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\/pistas\/\d+\/imagen$/i,
            method: 'GET',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pistas-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 20,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /\/escaladores\/fotos-perfil\/\d+$|\/rocodromos\/\d+\/logo$/i,
            method: 'GET',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern:
              /\/escaladores\/(perfil|stats\/resumen|stats\/tipos|stats\/actividad-mensual(?:\?.*)?|mis-rocodromos)$|\/amistades\/(mis-amigos|solicitudes-pendientes)$|\/rocodromos(?:\/\d+)?$/i,
            method: 'GET',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-dynamic-data',
              matchOptions: {
                ignoreSearch: false,
              },
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 6,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /\/zonas\b.*|\/pistas\b(?!\/\d+\/imagen$).*|\/rocodromos\/zonas\/\d+\b.*|\/rocodromos\/\d+\/escalasDificultad\b.*/i,
            method: 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 4,
              matchOptions: {
                ignoreSearch: false,
              },
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 6,
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 1,
              },
            },
          },
        ],
      },
    }),
  ],
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
      '/amistades': {
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
