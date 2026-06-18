import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Services usados pela cascata/cadastro são mockados (não tocam a rede).
vi.mock("../services/api/itemServices.js", () => ({
  postItem: vi.fn(),
}));
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
// Fila offline mockada para isolar a página da implementação de IndexedDB.
vi.mock("../mobile/filaOffline.js", () => ({
  enfileirar: vi.fn(),
  drenar: vi.fn(),
  contarPendentes: vi.fn(),
}));

import { postItem } from "../services/api/itemServices.js";
import { getMarcas } from "../services/api/marcaServices.js";
import { getModelos } from "../services/api/modeloServices.js";
import { getSubtipos } from "../services/api/subtipoServices.js";
import { enfileirar, contarPendentes } from "../mobile/filaOffline.js";
// NÃO EXISTE ainda: página standalone de cadastro mobile.
// Erro de import = RED esperado.
import CadastroMobile from "../pages/CadastroMobile.jsx";

function renderizar() {
  return render(
    <MemoryRouter>
      <CadastroMobile />
    </MemoryRouter>
  );
}

// Preenche os campos mínimos e dispara o submit.
async function preencherMinimoESubmeter() {
  const user = userEvent.setup();

  const tipo = await screen.findByLabelText(/^Tipo$/i);
  await user.selectOptions(tipo, "notebook");

  const etiqueta = await screen.findByPlaceholderText(/INV-/i);
  await user.type(etiqueta, "INV-1");

  const serie = await screen.findByPlaceholderText(/SN-/i);
  await user.type(serie, "SN1");

  const preco = await screen.findByPlaceholderText(/3500/i);
  await user.type(preco, "350000");

  const intervalo = await screen.findByLabelText(/Intervalo de Manutenção/i);
  await user.selectOptions(intervalo, "3");

  const botao = await screen.findByRole("button", { name: /cadastrar/i });
  await user.click(botao);
}

describe("CadastroMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("empresa_id", "7");
    getMarcas.mockResolvedValue([]);
    getModelos.mockResolvedValue([]);
    getSubtipos.mockResolvedValue([]);
    contarPendentes.mockResolvedValue(0);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("(feliz) renderiza a cascata e os campos com defaults, sem option desktop", async () => {
    renderizar();

    const tipo = await screen.findByLabelText(/^Tipo$/i);
    expect(tipo).toBeInTheDocument();

    const opcaoDesktop = screen.queryByRole("option", { name: /^Desktop$/i });
    expect(opcaoDesktop).toBeNull();
  });

  it("(feliz) submit online chama postItem 1x com FormData e notifica sucesso", async () => {
    postItem.mockResolvedValue({ item_id: 1 });

    renderizar();
    await preencherMinimoESubmeter();

    await waitFor(() => expect(postItem).toHaveBeenCalledTimes(1));
    const argEnviado = postItem.mock.calls[0][0];
    expect(argEnviado).toBeInstanceOf(FormData);
    expect(enfileirar).not.toHaveBeenCalled();
  });

  it("(borda) submit offline enfileira, atualiza o contador e não chama postItem", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    enfileirar.mockResolvedValue({ id: "r1" });
    contarPendentes.mockResolvedValue(1);

    renderizar();
    await preencherMinimoESubmeter();

    await waitFor(() => expect(enfileirar).toHaveBeenCalledTimes(1));
    expect(postItem).not.toHaveBeenCalled();
    // É o componente (não o teste) que consulta a fila para exibir o total.
    await waitFor(() => expect(contarPendentes).toHaveBeenCalled());
    const chamadaFila = enfileirar.mock.calls[0][0];
    expect(chamadaFila).toMatchObject({ endpoint: "/item", method: "POST" });
  });

  it("(borda) erro de rede (503) cai na fila", async () => {
    postItem.mockRejectedValue({ status: 503 });
    enfileirar.mockResolvedValue({ id: "r1" });

    renderizar();
    await preencherMinimoESubmeter();

    await waitFor(() => expect(enfileirar).toHaveBeenCalledTimes(1));
    // Tentou o envio online antes de cair na fila.
    expect(postItem).toHaveBeenCalledTimes(1);
    const chamadaFila = enfileirar.mock.calls[0][0];
    expect(chamadaFila).toMatchObject({ endpoint: "/item", method: "POST" });
    expect(chamadaFila.fields.item_etiqueta).toBe("INV-1");
  });

  it("(erro) 401 notifica erro de sessão sem perder a fila pendente", async () => {
    postItem.mockRejectedValue({ status: 401 });

    renderizar();
    await preencherMinimoESubmeter();

    await waitFor(() => expect(postItem).toHaveBeenCalledTimes(1));
    // 401 não é erro de rede: não enfileira (a fila existente é preservada).
    expect(enfileirar).not.toHaveBeenCalled();
    // tratarErro exibe a notificação de sessão inválida/expirada.
    expect(await screen.findByText(/Erro 401/i)).toBeInTheDocument();
  });
});
