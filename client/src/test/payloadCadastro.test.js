import { describe, it, expect } from "vitest";
// NÃO EXISTE ainda: builder puro montarRegistro({form, empresaId, caracteristicas}).
// Mesma normalização de preço de CadastroItem.jsx:
//   parseInt(preco.replace(/\D/g, ""), 10) / 100  -> String(...)
// Erro de import = RED esperado.
import { montarRegistro } from "../mobile/payloadCadastro.js";

const formBase = {
  marcaId: 5,
  modeloId: 9,
  subtipo: "",
  tipo: "notebook",
  etiqueta: "INV-1",
  numSerie: "SN1",
  preco: "R$ 3.500,00",
  aquisicao: "2026-06-17",
  manutencao: "2026-06-17",
  intervalo: "3",
  emUso: true,
};

describe("montarRegistro", () => {
  it("(feliz) monta os campos exatos do item com a normalização de CadastroItem", () => {
    const registro = montarRegistro({
      form: formBase,
      empresaId: "7",
      caracteristicas: [{ nome: "ram", valor: "16" }],
    });

    expect(registro.fields.item_empresa_id).toBe("7");
    expect(registro.fields.item_marca_id).toBe("5");
    expect(registro.fields.item_modelo_id).toBe("9");
    expect(registro.fields.item_tipo).toBe("notebook");
    expect(registro.fields.item_etiqueta).toBe("INV-1");
    expect(registro.fields.item_num_serie).toBe("SN1");
    expect(registro.fields.item_preco).toBe("3500");
    expect(registro.fields.item_data_aquisicao).toBe("2026-06-17");
    expect(registro.fields.item_em_uso).toBe("true");
    expect(registro.fields.item_ultima_manutencao).toBe("2026-06-17");
    expect(registro.fields.item_intervalo_manutencao).toBe("3");
    expect(registro.fields.caracteristicas).toBe(
      JSON.stringify([{ nome: "ram", valor: "16" }])
    );
  });

  it("(borda) injeta característica tipo=subtipo sem duplicar", () => {
    const registro = montarRegistro({
      form: { ...formBase, tipo: "periferico", subtipo: "mouse" },
      empresaId: "7",
      caracteristicas: [
        { nome: "tipo", valor: "antigo" },
        { nome: "cor", valor: "preto" },
      ],
    });

    const caracteristicas = JSON.parse(registro.fields.caracteristicas);
    const tipos = caracteristicas.filter((c) => c.nome === "tipo");
    expect(tipos).toHaveLength(1);
    expect(tipos[0]).toEqual({ nome: "tipo", valor: "mouse" });
  });

  it("(borda) não emite a chave pecas no fluxo não-desktop", () => {
    const registro = montarRegistro({
      form: formBase,
      empresaId: "7",
      caracteristicas: [{ nome: "ram", valor: "16" }],
    });

    const chaves = Object.keys(registro.fields);
    expect(chaves).not.toContain("pecas");
  });

  it("(borda) converte anexos em files:[File] preservando nome em tipo[]/nome[]", () => {
    const foto = new File(["conteudo"], "foto-equip.jpg", {
      type: "image/jpeg",
    });
    const registro = montarRegistro({
      form: formBase,
      empresaId: "7",
      caracteristicas: [{ nome: "ram", valor: "16" }],
      anexos: [{ tipo: "imagem", nome: "foto-equip.jpg", file: foto }],
    });

    expect(registro.files).toHaveLength(1);
    expect(registro.files[0]).toBeInstanceOf(File);
    expect(registro.files[0].name).toBe("foto-equip.jpg");
    expect(registro.fields["tipo[]"]).toEqual(["imagem"]);
    expect(registro.fields["nome[]"]).toEqual(["foto-equip.jpg"]);
  });

  it("(erro) empresaId ausente é erro de validação e não monta registro", () => {
    let erro;
    try {
      montarRegistro({
        form: formBase,
        empresaId: null,
        caracteristicas: [{ nome: "ram", valor: "16" }],
      });
    } catch (e) {
      erro = e;
    }

    expect(erro).toBeInstanceOf(Error);
    expect(erro.message).toMatch(/empresa/i);
  });

  it("(erro) preço R$ 0,00 é rejeitado (paridade com CadastroItem)", () => {
    let erro;
    try {
      montarRegistro({
        form: { ...formBase, preco: "R$ 0,00" },
        empresaId: "7",
        caracteristicas: [{ nome: "ram", valor: "16" }],
      });
    } catch (e) {
      erro = e;
    }

    expect(erro).toBeInstanceOf(Error);
    expect(erro.message).toMatch(/preç|preco|valor/i);
  });
});
