import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api/coletorServices.js", () => ({
  baixarColetor: vi.fn(),
}));
// Evita tocar a rede no logout (não usado nos cliques de download).
vi.mock("../services/auth/authService.js", () => ({
  deslogar: vi.fn(),
}));

import { baixarColetor } from "../services/api/coletorServices.js";
import Coletor from "../pages/Coletor.jsx";

function renderizar() {
  return render(
    <MemoryRouter>
      <Coletor />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  global.URL.createObjectURL = vi.fn(() => "blob:fake");
  global.URL.revokeObjectURL = vi.fn();
});

describe("Coletor", () => {
  it("baixa o coletor ao clicar no botão", async () => {
    baixarColetor.mockResolvedValue(new Blob(["zip"]));
    renderizar();

    await userEvent.click(
      screen.getByRole("button", { name: /baixar coletor/i })
    );

    await waitFor(() => expect(baixarColetor).toHaveBeenCalled());
    expect(await screen.findByText(/sucesso/i)).toBeInTheDocument();
  });

  it("mostra erro quando o download falha", async () => {
    baixarColetor.mockRejectedValue({ status: 500, message: "Falhou" });
    renderizar();

    await userEvent.click(
      screen.getByRole("button", { name: /baixar coletor/i })
    );

    await waitFor(() => expect(baixarColetor).toHaveBeenCalled());
    expect(await screen.findByText(/Erro 500/i)).toBeInTheDocument();
  });
});
