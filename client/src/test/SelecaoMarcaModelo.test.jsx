import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

import { getMarcas, postMarca } from "../services/api/marcaServices.js";
import { getModelos } from "../services/api/modeloServices.js";
import SelecaoMarcaModelo from "../components/inventario/SelecaoMarcaModelo.jsx";

function renderSelecao(props = {}) {
  const onChange = vi.fn();
  render(
    <MemoryRouter>
      <SelecaoMarcaModelo
        dominio="item"
        tipo="notebook"
        marcaId={null}
        modeloId={null}
        onChange={onChange}
        {...props}
      />
    </MemoryRouter>
  );
  return onChange;
}

describe("SelecaoMarcaModelo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModelos.mockResolvedValue([]);
  });

  it("lista as marcas do domínio e dispara onChange com o id ao escolher", async () => {
    getMarcas.mockResolvedValue([
      { marca_id: 1, marca_nome: "Logitech", marca_dominio: "item" },
    ]);
    const onChange = renderSelecao();

    const inputMarca = screen.getByPlaceholderText("Selecione ou digite uma marca");
    await userEvent.click(inputMarca);

    const opcao = await screen.findByRole("button", { name: "Logitech" });
    await userEvent.click(opcao);

    expect(onChange).toHaveBeenCalledWith({ marcaId: 1, modeloId: null });
  });

  it("permite digitar e adicionar uma marca inexistente, selecionando a nova", async () => {
    getMarcas.mockResolvedValue([]);
    postMarca.mockResolvedValue({ marca_id: 99 });
    const onChange = renderSelecao();

    const inputMarca = screen.getByPlaceholderText("Selecione ou digite uma marca");
    await userEvent.type(inputMarca, "MarcaNova");

    const botaoAdicionar = await screen.findByRole("button", {
      name: /Adicionar "MarcaNova"/,
    });
    await userEvent.click(botaoAdicionar);

    expect(postMarca).toHaveBeenCalledWith("MarcaNova", "item", "notebook", "");
    expect(onChange).toHaveBeenCalledWith({ marcaId: 99, modeloId: null });
  });

  it("mantém o campo de modelo desabilitado enquanto não há marca selecionada", async () => {
    getMarcas.mockResolvedValue([]);
    renderSelecao({ marcaId: null });

    const inputModelo = screen.getByPlaceholderText("Escolha a marca primeiro");
    expect(inputModelo).toBeDisabled();
  });

  it("não trava a marca para peças cujo tipo colide com a lista de subtipos (ex.: 'outros')", async () => {
    getMarcas.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SelecaoMarcaModelo
          dominio="peca"
          tipo="outros"
          marcaId={null}
          modeloId={null}
          onChange={() => {}}
        />
      </MemoryRouter>
    );

    const inputMarca = screen.getByPlaceholderText(
      "Selecione ou digite uma marca"
    );
    expect(inputMarca).not.toBeDisabled();
    await waitFor(() =>
      expect(getMarcas).toHaveBeenCalledWith("peca", "outros", "")
    );
  });

  it("limpa o texto da marca quando o pai reseta a seleção (sem texto fantasma)", async () => {
    getMarcas.mockResolvedValue([
      { marca_id: 1, marca_nome: "Dell", marca_dominio: "item" },
    ]);

    const { rerender } = render(
      <MemoryRouter>
        <SelecaoMarcaModelo
          dominio="item"
          tipo="notebook"
          marcaId={1}
          modeloId={null}
          onChange={() => {}}
        />
      </MemoryRouter>
    );

    const inputMarca = screen.getByPlaceholderText(
      "Selecione ou digite uma marca"
    );
    await waitFor(() => expect(inputMarca.value).toBe("Dell"));

    // Pai zera a seleção (ex.: limpaTela após cadastrar / "cadastrar outra").
    rerender(
      <MemoryRouter>
        <SelecaoMarcaModelo
          dominio="item"
          tipo="notebook"
          marcaId={null}
          modeloId={null}
          onChange={() => {}}
        />
      </MemoryRouter>
    );

    expect(inputMarca.value).toBe("");
  });
});
