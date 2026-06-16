import { defineConfig } from "vitest/config";

// Testes unitários do backend (Express + Sequelize).
// Rodam em ambiente Node, isolados do banco — os models são sempre
// mockados via vi.mock + helpers de test/unit/helpers.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/unit/**/*.spec.js"],
    clearMocks: true,
    // pool "forks": o pool padrão (threads) quebra neste ambiente
    // (Node 24 + Windows). Não remova sem revalidar os testes.
    pool: "forks",
  },
});
