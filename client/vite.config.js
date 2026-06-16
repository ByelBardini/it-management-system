/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
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
});
