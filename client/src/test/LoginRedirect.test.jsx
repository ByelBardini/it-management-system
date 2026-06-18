import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("../services/auth/authService.js", () => ({
  logar: vi.fn(),
}));

import { logar } from "../services/auth/authService.js";
import Login from "../pages/Login.jsx";

function renderizar() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

async function preencherEEntrar() {
  await userEvent.type(screen.getByPlaceholderText(/login/i), "conta");
  await userEvent.type(screen.getByPlaceholderText(/senha/i), "123");
  await userEvent.click(screen.getByRole("button", { name: /entrar/i }));
}

describe("Login — desvio por papel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("manda o coletor para /coletor", async () => {
    logar.mockResolvedValue({ usuario_tipo: "coletor" });
    renderizar();

    await preencherEEntrar();

    await waitFor(
      () =>
        expect(navigateMock).toHaveBeenCalledWith("/coletor", {
          replace: true,
        }),
      { timeout: 2000 }
    );
  });

  it("manda os demais papéis para /empresas", async () => {
    logar.mockResolvedValue({ usuario_tipo: "adm" });
    renderizar();

    await preencherEEntrar();

    await waitFor(
      () =>
        expect(navigateMock).toHaveBeenCalledWith("/empresas", {
          replace: true,
        }),
      { timeout: 2000 }
    );
  });
});
