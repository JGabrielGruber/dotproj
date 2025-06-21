import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        importScripts: ["sw-code.js"],
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'Gestor de Tarefas',
        short_name: 'DotProj',
        theme_color: '#88C0D0',
        icons: [
          { "src": "/favicon.ico", "type": "image/x-icon", "sizes": "16x16 32x32" },
          { "src": "/icon-192.png", "type": "image/png", "sizes": "192x192" },
          { "src": "/icon-512.png", "type": "image/png", "sizes": "512x512" },
          { "src": "/icon-192-maskable.png", "type": "image/png", "sizes": "192x192", "purpose": "maskable" },
          { "src": "/icon-512-maskable.png", "type": "image/png", "sizes": "512x512", "purpose": "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      src: '/src'
    }
  },
  build: {
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "/index.html",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
})
