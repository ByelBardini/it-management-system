import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api/marcaServices.js", () => ({
  getMarcas: vi.fn(),
  postMarca: vi.fn(),
}));
vi.mock("../services/api/modeloServices.js", () => ({
  getModelos: vi.fn(),
  postModelo: vi.fn(),
}));
vi.mock("../services/api/subtipoServices.js", () => ({
  getSubtipos: vi.fn(),
  postSubtipo: vi.fn(),
}));

import { getMarcas } from "../services/api/marcaServices.js";
import { getModelos } from "../services/api/modeloServices.js";
import CartaoMarcas from "../components/marca/CartaoMarcas.jsx";

function renderCartao() {
  return render(
    <MemoryRouter>
      <CartaoMarcas setNotificacao={() => {}} setCarregando={() => {}} />
    </MemoryRouter>
  );
}

describe("CartaoMarcas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista as marcas do tipo selecionado (escopo por domínio + tipo)", async () => {
    getMarcas.mockResolvedValue([
      {
        marca_id: 1,
        marca_nome: "Logitech",
        marca_dominio: "item",
        marca_tipo: "notebook",
        marca_subtipo: "",
      },
    ]);

    renderCartao();
    await userEvent.selectOptions(screen.getByRole("combobox"), "notebook");

    expect(await screen.findByText("Logitech")).toBeInTheDocument();
    expect(getMarcas).toHaveBeenCalledWith("item", "notebook", "");
  });

  it("expande a marca no duplo-clique e carrega seus modelos", async () => {
    getMarcas.mockResolvedValue([
      {
        marca_id: 1,
        marca_nome: "Logitech",
        marca_dominio: "item",
        marca_tipo: "notebook",
        marca_subtipo: "",
      },
    ]);
    getModelos.mockResolvedValue([
      { modelo_id: 5, modelo_nome: "K120", modelo_marca_id: 1 },
    ]);

    renderCartao();
    await userEvent.selectOptions(screen.getByRole("combobox"), "notebook");

    const linha = await screen.findByText("Logitech");
    await userEvent.dblClick(linha);

    expect(await screen.findByText("K120")).toBeInTheDocument();
    expect(getModelos).toHaveBeenCalledWith(1);
  });
});
