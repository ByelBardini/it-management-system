/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // envDir "." resolve para a pasta do client em runtime (evita usar `process`,
  // que não está nos globals do ESLint deste pacote).
  const env = loadEnv(mode, ".", "");

  // Alvo do proxy de /api no dev. Default = porta padrão do server.js (3003).
  // Se o seu server/.env define PORT=3032, defina VITE_API_PROXY_TARGET no .env.
  const apiTarget = env.VITE_API_PROXY_TARGET || "http://localhost:3003";

  return {
    base: "./",
    plugins: [react(), tailwindcss()],
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
