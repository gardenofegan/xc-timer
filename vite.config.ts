import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/xc-timer/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Cross Country Timer',
        short_name: 'XC Timer',
        description: 'A simple cross-country running timer app for timing multiple runners at different checkpoints',
        theme_color: '#22c55e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/xc-timer/',
        start_url: '/xc-timer/',
        categories: ['sports', 'utilities', 'productivity'],
        lang: 'en-US',
        icons: [
          {
            src: '/xc-timer/favicon.ico',
            sizes: '16x16 32x32 48x48',
            type: 'image/x-icon',
            purpose: 'any'
          },
          {
            src: '/xc-timer/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/xc-timer/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/xc-timer/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Start Timing',
            short_name: 'Timer',
            description: 'Go directly to the timing screen',
            url: '/xc-timer/?screen=timing',
            icons: [
              {
                src: '/xc-timer/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Setup Runners',
            short_name: 'Setup',
            description: 'Add teams and runners',
            url: '/xc-timer/?screen=setup',
            icons: [
              {
                src: '/xc-timer/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3000000
      }
    })
  ],
})