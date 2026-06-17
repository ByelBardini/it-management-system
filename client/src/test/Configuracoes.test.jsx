import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Configuracoes from "../pages/Configuracoes.jsx";
import { getSetores } from "../services/api/setorServices.js";

vi.mock("../services/api/setorServices.js", () => ({
  getSetores: vi.fn(),
  deleteSetor: vi.fn(),
}));

function renderizar() {
  render(
    <MemoryRouter>
      <Configuracoes />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Configurações — inativação de plataformas", () => {
  it("não renderiza a seção de Plataformas", async () => {
    getSetores.mockResolvedValue([{ setor_id: 1, setor_nome: "TI" }]);

    renderizar();

    expect(await screen.findByText("Setores da Empresa")).toBeInTheDocument();
    expect(screen.queryByText("Plataformas")).toBeNull();
    expect(screen.queryByText("Adicionar Plataforma")).toBeNull();
  });

  it("mantém as seções de Setores e de Marcas e Modelos", async () => {
    getSetores.mockResolvedValue([{ setor_id: 1, setor_nome: "TI" }]);

    renderizar();

    expect(await screen.findByText("Setores da Empresa")).toBeInTheDocument();
    expect(screen.getByText("Marcas e Modelos")).toBeInTheDocument();
  });
});
