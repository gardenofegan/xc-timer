// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/project/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  base: "/xc-timer/",
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Cross Country Timer",
        short_name: "XC Timer",
        description: "A simple cross-country running timer app for timing multiple runners at different checkpoints",
        theme_color: "#22c55e",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/xc-timer/",
        start_url: "/xc-timer/",
        categories: ["sports", "utilities", "productivity"],
        lang: "en-US",
        icons: [
          {
            src: "/xc-timer/favicon.ico",
            sizes: "16x16 32x32 48x48",
            type: "image/x-icon",
            purpose: "any"
          },
          {
            src: "/xc-timer/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/xc-timer/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/xc-timer/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any"
          }
        ],
        shortcuts: [
          {
            name: "Start Timing",
            short_name: "Timer",
            description: "Go directly to the timing screen",
            url: "/xc-timer/?screen=timing",
            icons: [
              {
                src: "/xc-timer/icon-192.png",
                sizes: "192x192",
                type: "image/png"
              }
            ]
          },
          {
            name: "Setup Runners",
            short_name: "Setup",
            description: "Add teams and runners",
            url: "/xc-timer/?screen=setup",
            icons: [
              {
                src: "/xc-timer/icon-192.png",
                sizes: "192x192",
                type: "image/png"
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 3e6
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnL3hjLXRpbWVyLycsXG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdpY29uLTE5Mi5wbmcnLCAnaWNvbi01MTIucG5nJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnQ3Jvc3MgQ291bnRyeSBUaW1lcicsXG4gICAgICAgIHNob3J0X25hbWU6ICdYQyBUaW1lcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBzaW1wbGUgY3Jvc3MtY291bnRyeSBydW5uaW5nIHRpbWVyIGFwcCBmb3IgdGltaW5nIG11bHRpcGxlIHJ1bm5lcnMgYXQgZGlmZmVyZW50IGNoZWNrcG9pbnRzJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMjJjNTVlJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQtcHJpbWFyeScsXG4gICAgICAgIHNjb3BlOiAnL3hjLXRpbWVyLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy94Yy10aW1lci8nLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3Nwb3J0cycsICd1dGlsaXRpZXMnLCAncHJvZHVjdGl2aXR5J10sXG4gICAgICAgIGxhbmc6ICdlbi1VUycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3hjLXRpbWVyL2Zhdmljb24uaWNvJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTZ4MTYgMzJ4MzIgNDh4NDgnLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3gtaWNvbicsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3hjLXRpbWVyL2ljb24tMTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3hjLXRpbWVyL2ljb24tNTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3hjLXRpbWVyL2FwcGxlLXRvdWNoLWljb24ucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnMTgweDE4MCcsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnknXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBzaG9ydGN1dHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnU3RhcnQgVGltaW5nJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdUaW1lcicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dvIGRpcmVjdGx5IHRvIHRoZSB0aW1pbmcgc2NyZWVuJyxcbiAgICAgICAgICAgIHVybDogJy94Yy10aW1lci8/c2NyZWVuPXRpbWluZycsXG4gICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3JjOiAnL3hjLXRpbWVyL2ljb24tMTkyLnBuZycsXG4gICAgICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnU2V0dXAgUnVubmVycycsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnU2V0dXAnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBZGQgdGVhbXMgYW5kIHJ1bm5lcnMnLFxuICAgICAgICAgICAgdXJsOiAnL3hjLXRpbWVyLz9zY3JlZW49c2V0dXAnLFxuICAgICAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogJy94Yy10aW1lci9pY29uLTE5Mi5wbmcnLFxuICAgICAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnfSddLFxuICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogMzAwMDAwMFxuICAgICAgfVxuICAgIH0pXG4gIF0sXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsZUFBZTtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSx3QkFBd0IsZ0JBQWdCLGNBQWM7QUFBQSxNQUNyRixVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxZQUFZLENBQUMsVUFBVSxhQUFhLGNBQWM7QUFBQSxRQUNsRCxNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsUUFDQSxXQUFXO0FBQUEsVUFDVDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sWUFBWTtBQUFBLFlBQ1osYUFBYTtBQUFBLFlBQ2IsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLGNBQ0w7QUFBQSxnQkFDRSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGdCQUNQLE1BQU07QUFBQSxjQUNSO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsY0FDTDtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsZ0JBQ1AsTUFBTTtBQUFBLGNBQ1I7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsZ0NBQWdDO0FBQUEsUUFDL0MsK0JBQStCO0FBQUEsTUFDakM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
