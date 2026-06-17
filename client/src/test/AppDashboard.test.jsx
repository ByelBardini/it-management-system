import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../pages/App.jsx";
import { getDashboard } from "../services/api/dashboardServices.js";

vi.mock("../services/api/dashboardServices.js", () => ({
  getDashboard: vi.fn(),
}));

function renderizar() {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App (dashboard) — inativação de senhas", () => {
  it("não renderiza o cartão de Senhas cadastradas", async () => {
    getDashboard.mockResolvedValue({
      total: { total_ativos: 5 },
      equipamentos: [],
      manutencoes: [],
      workstations: { com_workstation: 1, sem_workstation: 2, em_estoque: 3 },
      senhas: [],
    });

    renderizar();

    expect(
      await screen.findByText("Equipamentos cadastrados")
    ).toBeInTheDocument();
    expect(screen.queryByText("Senhas cadastradas")).toBeNull();
  });

  it("renderiza o dashboard sem depender dos dados de senha", async () => {
    getDashboard.mockResolvedValue({
      total: { total_ativos: 0 },
      equipamentos: [],
      manutencoes: [],
      workstations: { com_workstation: 0, sem_workstation: 0, em_estoque: 0 },
    });

    renderizar();

    expect(
      await screen.findByText("Status das Manutenções")
    ).toBeInTheDocument();
    expect(screen.queryByText("Senhas cadastradas")).toBeNull();
  });

  it("exibe notificação de erro quando a busca do dashboard falha", async () => {
    getDashboard.mockRejectedValue({
      status: 500,
      message: "Falha ao carregar o dashboard",
    });

    renderizar();

    expect(
      await screen.findByText("Falha ao carregar o dashboard")
    ).toBeInTheDocument();
  });
});
