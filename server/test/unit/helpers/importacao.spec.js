import { describe, it, expect } from "vitest";
import {
  validarPecaColetada,
  errosColetaDesktop,
  validarEspecificacoes,
} from "../../../controllers/helpers/importacao.js";

describe("validarEspecificacoes", () => {
  it("aceita ausência (undefined/null) e objeto válido", () => {
    expect(validarEspecificacoes(undefined)).toEqual([]);
    expect(validarEspecificacoes(null)).toEqual([]);
    expect(validarEspecificacoes({ capacidade: "8 GB" })).toEqual([]);
  });

  it("recusa valor que não é objeto simples", () => {
    expect(
      validarEspecificacoes("DDR4").some((m) => m.includes("especificações inválidas"))
    ).toBe(true);
    expect(
      validarEspecificacoes([1, 2]).some((m) => m.includes("especificações inválidas"))
    ).toBe(true);
  });

  it("recusa objeto acima do tamanho máximo", () => {
    const grande = {};
    for (let i = 0; i < 200; i++) grande[`c${i}`] = "X".repeat(50);

    expect(
      validarEspecificacoes(grande).some((m) => m.includes("especificações excedem"))
    ).toBe(true);
  });
});

// Validadores puros da coleta de desktop. Diferente da importação CSV, a coleta
// de hardware tem num_serie/preço/data OPCIONAIS (caem em default no controller).
describe("validarPecaColetada", () => {
  it("aceita uma peça só com tipo e marca (série/preço/data são opcionais)", () => {
    const motivos = validarPecaColetada({ tipo: "ram", marca: "Kingston" });

    expect(motivos).toEqual([]);
  });

  it("recusa tipo de peça inválido", () => {
    const motivos = validarPecaColetada({ tipo: "teclado" });

    expect(motivos.some((m) => m.includes("tipo inválido"))).toBe(true);
  });

  it("recusa preço não numérico quando ele é informado", () => {
    const motivos = validarPecaColetada({ tipo: "ram", preco: "abc" });

    expect(motivos.some((m) => m.includes("preço inválido"))).toBe(true);
  });

  it("recusa peça que não é objeto (null) sem lançar exceção", () => {
    const motivos = validarPecaColetada(null);

    expect(motivos).toEqual(["peça inválida (esperado um objeto)"]);
  });

  it("recusa peça primitiva (número ou string)", () => {
    const motivosNumero = validarPecaColetada(5);
    const motivosString = validarPecaColetada("ram");

    expect(motivosNumero).toEqual(["peça inválida (esperado um objeto)"]);
    expect(motivosString).toEqual(["peça inválida (esperado um objeto)"]);
  });

  it("aceita especificações válidas (objeto de rótulo/valor)", () => {
    const motivos = validarPecaColetada({
      tipo: "ram",
      marca: "Kingston",
      especificacoes: { capacidade: "8 GB", tipo: "DDR4" },
    });

    expect(motivos).toEqual([]);
  });

  it("aceita peça sem o campo especificacoes (opcional, retrocompatível)", () => {
    const motivos = validarPecaColetada({ tipo: "ram", marca: "Kingston" });

    expect(motivos).toEqual([]);
  });

  it("recusa especificações que não são um objeto simples", () => {
    const motivosString = validarPecaColetada({
      tipo: "ram",
      especificacoes: "DDR4",
    });
    const motivosArray = validarPecaColetada({
      tipo: "ram",
      especificacoes: [1, 2],
    });

    expect(motivosString.some((m) => m.includes("especificações inválidas"))).toBe(
      true
    );
    expect(motivosArray.some((m) => m.includes("especificações inválidas"))).toBe(
      true
    );
  });

  it("recusa especificações acima do tamanho máximo", () => {
    const grande = {};
    for (let i = 0; i < 200; i++) grande[`campo${i}`] = "X".repeat(50);
    const motivos = validarPecaColetada({ tipo: "ram", especificacoes: grande });

    expect(
      motivos.some((m) => m.includes("especificações excedem"))
    ).toBe(true);
  });
});

describe("errosColetaDesktop", () => {
  function payloadValido(over = {}) {
    return {
      item_empresa_id: 1,
      etiqueta: "DSK-014",
      marca: "Dell",
      modelo: "OptiPlex 7090",
      pecas: [
        { tipo: "processador", marca: "Intel", modelo: "Core i5-10500" },
        { tipo: "ram", marca: "Kingston" },
      ],
      ...over,
    };
  }

  it("aceita um payload válido sem nenhum erro", () => {
    const erros = errosColetaDesktop(payloadValido());

    expect(erros).toEqual([]);
  });

  it("exige ao menos uma peça", () => {
    const erros = errosColetaDesktop(payloadValido({ pecas: [] }));

    expect(erros.some((e) => e.motivo.includes("ao menos uma peça"))).toBe(true);
  });

  it("recusa etiqueta acima de 10 caracteres", () => {
    const erros = errosColetaDesktop(payloadValido({ etiqueta: "X".repeat(11) }));

    expect(
      erros.some((e) => e.motivo.includes("etiqueta") && e.motivo.includes("10"))
    ).toBe(true);
  });

  it("aponta o índice da peça inválida dentro do lote", () => {
    const erros = errosColetaDesktop(
      payloadValido({
        pecas: [{ tipo: "ram", marca: "Kingston" }, { tipo: "teclado" }],
      })
    );

    const erroPeca = erros.find((e) => e.motivo.includes("tipo inválido"));
    expect(erroPeca).toMatchObject({ indice: 1 });
  });

  it("aponta o índice da peça null sem quebrar com exceção", () => {
    const erros = errosColetaDesktop(payloadValido({ pecas: [null] }));

    const erroPeca = erros.find((e) => e.motivo.includes("peça inválida"));
    expect(erroPeca).toMatchObject({ indice: 0 });
  });

  it("recusa setor_id não inteiro quando informado", () => {
    const erros = errosColetaDesktop(payloadValido({ setor_id: "abc" }));

    expect(erros.some((e) => e.motivo.includes("setor inválido"))).toBe(true);
  });

  it("recusa workstation_id não inteiro quando informado", () => {
    const erros = errosColetaDesktop(payloadValido({ workstation_id: "x" }));

    expect(erros.some((e) => e.motivo.includes("workstation inválido"))).toBe(
      true
    );
  });

  it("aceita setor_id e workstation_id inteiros", () => {
    const erros = errosColetaDesktop(
      payloadValido({ setor_id: 3, workstation_id: 9 })
    );

    expect(erros.some((e) => e.motivo.includes("setor inválido"))).toBe(false);
    expect(erros.some((e) => e.motivo.includes("workstation inválido"))).toBe(
      false
    );
  });

  it("aponta o índice da peça com especificações inválidas", () => {
    const erros = errosColetaDesktop(
      payloadValido({
        pecas: [
          { tipo: "ram", marca: "Kingston" },
          { tipo: "ram", especificacoes: [] },
        ],
      })
    );

    const erroPeca = erros.find((e) =>
      e.motivo.includes("especificações inválidas")
    );
    expect(erroPeca).toMatchObject({ indice: 1 });
  });
});
