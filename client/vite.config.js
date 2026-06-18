/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // envDir "." resolve para a pasta do client em runtime (evita usar `process`,
  // que não está nos globals do ESLint deste pacote).
  const env = loadEnv(mode, ".", "");

  // Alvo do proxy de /api no dev. Default = porta padrão do server.js (3003).
  // Se o seu server/.env define PORT=3032, defina VITE_API_PROXY_TARGET no .env.
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://localhost:3003";

  return {
    // base "/" para servir na raiz do domínio (nginx). Com "./" (herança do
    // Tauri) os assets quebram ao dar refresh numa rota profunda (ex.: /inventario).
    base: "/",
    plugins: [
      react(),
      tailwindcss(),
      // PWA instalável (app de cadastro mobile). generateSW (sem SW custom): a fila
      // offline roda em JS do app, não em Background Sync. NetworkFirst só para GET de
      // /api — POST nunca é cacheado (vai pela fila offline quando falha).
      VitePWA({
        registerType: "autoUpdate",
        // NÃO precacheia favicon.ico: o atual é um PNG 1000x1000 (~653KB) e inflaria o
        // install do SW sem uso no app standalone. Rode o assets-generator (ver docs)
        // para gerar um favicon pequeno + os PNGs do manifest abaixo.
        includeAssets: ["icon.svg"],
        manifest: {
          name: "InfraHub — Cadastro",
          short_name: "Cadastro",
          description: "Cadastro rápido de itens de inventário (InfraHub).",
          lang: "pt-BR",
          start_url: "/cadastro-mobile",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#0A1633",
          theme_color: "#0A1633",
          // PNGs raster (preferidos pelo Bubblewrap/PWABuilder p/ gerar o APK do TWA)
          // + SVG como fallback vetorial. Gere os PNGs com:
          //   npx @vite-pwa/assets-generator --preset minimal-2023 public/icon.svg
          // (saída em public/: pwa-192x192.png, pwa-512x512.png,
          //  maskable-icon-512x512.png, apple-touch-icon-180x180.png).
          icons: [
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            {
              src: "/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          // Não desvia /api, /sw.js nem o assetlinks para o index.html.
          navigateFallbackDenylist: [/^\/api/, /^\/\.well-known/, /^\/sw\.js$/],
          runtimeCaching: [
            {
              // Só GET de /api (string/RegExp — generateSW serializa o SW, sem funções).
              urlPattern: /\/api\/.*/,
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "api-get",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    server: {
      proxy: {
        // O client chama /api/...; o backend serve /usuario, /empresa, ... (sem
        // /api). Tira o prefixo /api antes de repassar — espelha o reverse proxy
        // de produção e evita CORS no dev.
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
      include: ["src/**/*.{test,spec}.{js,jsx}"],
      css: false,
      // pool "forks": o pool padrão (threads) quebra neste ambiente
      // (Node 24 + Windows). Não remova sem revalidar os testes.
      pool: "forks",
    },
  };
});
