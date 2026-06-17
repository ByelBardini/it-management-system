import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api/itemServices.js", () => ({
  importarItens: vi.fn(),
}));
vi.mock("../services/api/pecasServices.js", () => ({
  importarPecas: vi.fn(),
}));

import ModalImportar from "../components/inventario/ModalImportar.jsx";

function renderModal(props = {}) {
  render(
    <MemoryRouter>
      <ModalImportar
        dominio="item"
        onClose={() => {}}
        onConcluido={() => {}}
        setNotificacao={() => {}}
        setLoading={() => {}}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("ModalImportar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o título conforme o domínio", () => {
    renderModal({ dominio: "peca" });

    expect(screen.getByText("Importar Peças")).toBeInTheDocument();
  });

  it("clicar em baixar modelo gera o arquivo de template", async () => {
    const createObjectURL = vi.fn(() => "blob:fake");
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = vi.fn();

    renderModal({ dominio: "item" });

    await userEvent.click(
      screen.getByRole("button", { name: /baixar modelo/i })
    );

    expect(createObjectURL).toHaveBeenCalled();
  });
});
