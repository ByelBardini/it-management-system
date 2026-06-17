import { describe, it, expect } from "vitest";
import { agruparInventario } from "../components/inventario/agrupamento.js";

// Itens agora carregam marca/modelo como FK (objetos do cadastro central),
// não mais como característica de texto.
function montaItem(over = {}) {
  return {
    item_id: 1,
    item_etiqueta: "TEC-001",
    item_em_uso: 1,
    item_tipo: "periferico",
    item_num_serie: "SN-1",
    setor: null,
    workstation: null,
    marca: { marca_id: 1, marca_nome: "Logitech" },
    modelo: { modelo_id: 1, modelo_nome: "K120" },
    ...over,
  };
}

describe("agruparInventario", () => {
  it("agrupa pelos FKs de marca e modelo, com os contadores certos", () => {
    const itens = [
      montaItem({ item_id: 1 }),
      montaItem({
        item_id: 2,
        marca: { marca_id: 2, marca_nome: "Dell" },
        modelo: { modelo_id: 2, modelo_nome: "KB216" },
      }),
      montaItem({ item_id: 3, marca: null, modelo: null }),
    ];

    const grupos = agruparInventario(itens);

    expect(grupos).toHaveLength(1);
    expect(grupos[0].tipo).toBe("periferico");
    expect(grupos[0].tipoLabel).toBe("Periférico");
    expect(grupos[0].total).toBe(3);
    expect(grupos[0].marcas.map((m) => m.marca)).toEqual([
      "Dell",
      "Logitech",
      "Sem marca",
    ]);

    const logitech = grupos[0].marcas.find((m) => m.marca === "Logitech");
    expect(logitech.total).toBe(1);
    expect(logitech.modelos[0].modelo).toBe("K120");
    expect(logitech.modelos[0].itens[0].item_id).toBe(1);
  });

  it("junta marcas/modelos equivalentes escritos em caixa diferente", () => {
    const itens = [
      montaItem({ item_id: 1 }),
      montaItem({
        item_id: 2,
        marca: { marca_id: 9, marca_nome: "logitech" },
        modelo: { modelo_id: 9, modelo_nome: "k120" },
      }),
    ];

    const grupos = agruparInventario(itens);

    expect(grupos[0].marcas).toHaveLength(1);
    expect(grupos[0].marcas[0].marca).toBe("Logitech");
    expect(grupos[0].marcas[0].total).toBe(2);
    expect(grupos[0].marcas[0].modelos).toHaveLength(1);
    expect(grupos[0].marcas[0].modelos[0].modelo).toBe("K120");
    expect(grupos[0].marcas[0].modelos[0].total).toBe(2);
  });

  it("coloca itens sem marca/modelo no grupo 'Sem marca/Sem modelo'", () => {
    const itens = [
      montaItem({
        item_id: 9,
        item_tipo: "cadeira",
        marca: null,
        modelo: null,
      }),
    ];

    const grupos = agruparInventario(itens);

    expect(grupos[0].tipo).toBe("cadeira");
    expect(grupos[0].marcas[0].marca).toBe("Sem marca");
    expect(grupos[0].marcas[0].modelos[0].modelo).toBe("Sem modelo");
    expect(grupos[0].marcas[0].modelos[0].itens[0].item_id).toBe(9);
  });

  it("retorna lista vazia para entrada vazia", () => {
    expect(agruparInventario([])).toEqual([]);
  });
});
