import { describe, it, expect } from "vitest";
import { agruparPecas } from "../components/pecas/agrupamentoPecas.js";

function montaPeca(over = {}) {
  return {
    peca_id: 1,
    peca_tipo: "ram",
    peca_num_serie: "PCA-1",
    peca_em_uso: 0,
    marca: { marca_id: 1, marca_nome: "Kingston" },
    modelo: { modelo_id: 1, modelo_nome: "Fury 8GB" },
    ...over,
  };
}

describe("agruparPecas", () => {
  it("monta a árvore Tipo → Marca → Modelo das peças com os contadores", () => {
    const pecas = [
      montaPeca({ peca_id: 1 }),
      montaPeca({
        peca_id: 2,
        marca: { marca_id: 2, marca_nome: "Corsair" },
        modelo: { modelo_id: 2, modelo_nome: "Vengeance 16GB" },
      }),
    ];

    const grupos = agruparPecas(pecas);

    expect(grupos).toHaveLength(1);
    expect(grupos[0].tipo).toBe("ram");
    expect(grupos[0].tipoLabel).toBe("Memória RAM");
    expect(grupos[0].total).toBe(2);
    expect(grupos[0].marcas.map((m) => m.marca)).toEqual([
      "Corsair",
      "Kingston",
    ]);
  });

  it("coloca peça sem marca/modelo em 'Sem marca/Sem modelo'", () => {
    const grupos = agruparPecas([
      montaPeca({ peca_id: 5, marca: null, modelo: null }),
    ]);

    expect(grupos[0].marcas[0].marca).toBe("Sem marca");
    expect(grupos[0].marcas[0].modelos[0].modelo).toBe("Sem modelo");
    expect(grupos[0].marcas[0].modelos[0].itens[0].peca_id).toBe(5);
  });

  it("retorna lista vazia para entrada vazia", () => {
    expect(agruparPecas([])).toEqual([]);
  });
});
