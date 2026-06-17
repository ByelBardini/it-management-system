import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InventarioAgrupado from "../components/inventario/InventarioAgrupado.jsx";

function montaGrupos() {
  return [
    {
      tipo: "periferico",
      tipoLabel: "Periférico",
      total: 1,
      marcas: [
        {
          marca: "Logitech",
          total: 1,
          modelos: [
            {
              modelo: "K120",
              total: 1,
              itens: [
                {
                  item_id: 1,
                  item_etiqueta: "TEC-001",
                  item_em_uso: 1,
                  item_tipo: "periferico",
                  item_num_serie: "SN-123",
                  setor: null,
                  workstation: null,
                  marca: { marca_id: 1, marca_nome: "Logitech" },
                  modelo: { modelo_id: 1, modelo_nome: "K120" },
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

describe("InventarioAgrupado", () => {
  it("mostra os tipos como cards e mantém marcas/itens ocultos antes de entrar no tipo", () => {
    render(<InventarioAgrupado grupos={montaGrupos()} setCardItem={() => {}} />);

    expect(
      screen.getByRole("button", { name: /Periférico/ })
    ).toBeInTheDocument();
    expect(screen.queryByText("Logitech")).not.toBeInTheDocument();
    expect(screen.queryByText("SN-123")).not.toBeInTheDocument();
  });

  it("navega card do tipo → marca → modelo e abre o modal com o número de série", async () => {
    render(<InventarioAgrupado grupos={montaGrupos()} setCardItem={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: /Periférico/ }));

    const marca = await screen.findByRole("button", { name: /Logitech/ });
    await userEvent.click(marca);

    const modelo = await screen.findByRole("button", { name: /K120/ });
    await userEvent.click(modelo);

    expect(await screen.findByText("SN-123")).toBeInTheDocument();
  });
});
