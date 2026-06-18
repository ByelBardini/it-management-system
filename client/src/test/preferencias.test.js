import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
// NÃO EXISTE ainda: datas default = hoje; lembrar última escolha (localStorage).
// Erro de import = RED esperado.
import { defaultsCadastro, salvarUltimaEscolha } from "../mobile/preferencias.js";

describe("preferencias (defaults de cadastro mobile)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00"));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("(feliz) datas iniciais = hoje e recupera a última escolha persistida", () => {
    localStorage.setItem("cad_ultimo_tipo", "notebook");
    localStorage.setItem("cad_ultimo_marca", "5");
    localStorage.setItem("cad_ultimo_modelo", "9");

    const defaults = defaultsCadastro();

    expect(defaults.aquisicao).toBe("2026-06-17");
    expect(defaults.manutencao).toBe("2026-06-17");
    expect(defaults.tipo).toBe("notebook");
    expect(defaults.marcaId).toBe("5");
    expect(defaults.modeloId).toBe("9");
  });

  it("(borda) sem histórico retorna campos vazios e datas de hoje", () => {
    const defaults = defaultsCadastro();

    expect(defaults.aquisicao).toBe("2026-06-17");
    expect(defaults.manutencao).toBe("2026-06-17");
    expect(defaults.tipo).toBe("");
    expect(defaults.marcaId).toBeFalsy();
    expect(defaults.modeloId).toBeFalsy();
  });

  it("(feliz) salvarUltimaEscolha persiste tipo/marca/modelo no localStorage", () => {
    salvarUltimaEscolha({ tipo: "celular", marcaId: 12, modeloId: 34 });

    const tipoSalvo = localStorage.getItem("cad_ultimo_tipo");
    const marcaSalva = localStorage.getItem("cad_ultimo_marca");
    const modeloSalvo = localStorage.getItem("cad_ultimo_modelo");

    expect(tipoSalvo).toBe("celular");
    expect(marcaSalva).toBe("12");
    expect(modeloSalvo).toBe("34");
  });
});
