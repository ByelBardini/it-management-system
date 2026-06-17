import { describe, it, expect } from "vitest";
import {
  parseCsv,
  gerarModeloCsv,
  validarLinhasItem,
  validarLinhasPeca,
  normalizarNumero,
} from "../components/inventario/importacaoCsv.js";

describe("parseCsv", () => {
  it("transforma cabeçalho + linhas em objetos", () => {
    const resultado = parseCsv("tipo,etiqueta\nmonitor,MON-1\n");

    expect(resultado).toEqual([{ tipo: "monitor", etiqueta: "MON-1" }]);
  });

  it("aceita ; como separador e campos entre aspas com vírgula", () => {
    const resultado = parseCsv('tipo;modelo\nram;"Fury, 8GB"');

    expect(resultado).toEqual([{ tipo: "ram", modelo: "Fury, 8GB" }]);
  });

  it("ignora linhas em branco e espaços nas pontas", () => {
    const resultado = parseCsv("tipo,etiqueta\n  monitor , MON-1 \n\n");

    expect(resultado).toEqual([{ tipo: "monitor", etiqueta: "MON-1" }]);
  });
});

describe("gerarModeloCsv", () => {
  it("devolve o cabeçalho de itens com uma linha de exemplo", () => {
    const modelo = gerarModeloCsv("item");

    expect(modelo).toContain("tipo");
    expect(modelo).toContain("etiqueta");
    expect(modelo).toContain("intervalo_manutencao");
    const linhas = modelo.trim().split("\n");
    expect(linhas.length).toBeGreaterThanOrEqual(2);
  });

  it("devolve o cabeçalho de peças", () => {
    const modelo = gerarModeloCsv("peca");

    expect(modelo).toContain("tipo");
    expect(modelo).toContain("num_serie");
    expect(modelo).toContain("preco");
  });
});

describe("validarLinhasItem", () => {
  function linha(over = {}) {
    return {
      tipo: "monitor",
      etiqueta: "MON-1",
      num_serie: "SN1",
      preco: "500.00",
      data_aquisicao: "2024-01-01",
      ultima_manutencao: "2024-01-01",
      intervalo_manutencao: "6",
      ...over,
    };
  }

  it("aponta a linha e o motivo quando falta campo obrigatório", () => {
    const erros = validarLinhasItem([linha({ etiqueta: "" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].linha).toBe(2);
    expect(erros[0].motivo).toMatch(/etiqueta/i);
  });

  it("recusa o tipo desktop", () => {
    const erros = validarLinhasItem([linha({ tipo: "desktop" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/desktop/i);
  });

  it("recusa data fora do formato AAAA-MM-DD", () => {
    const erros = validarLinhasItem([linha({ data_aquisicao: "15/01/2024" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/data de aquisição/i);
  });

  it("recusa número de série acima de 255 caracteres", () => {
    const erros = validarLinhasItem([linha({ num_serie: "X".repeat(300) })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/série/i);
  });

  it("recusa preço não numérico", () => {
    const erros = validarLinhasItem([linha({ preco: "Infinity" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/preço/i);
  });

  it("recusa subtipo acima de 100 caracteres", () => {
    const erros = validarLinhasItem([
      linha({ tipo: "periferico", subtipo: "S".repeat(120) }),
    ]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/subtipo/i);
  });

  it("recusa modelo informado sem marca", () => {
    const erros = validarLinhasItem([linha({ marca: "", modelo: "P2419" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/sem marca/i);
  });

  it("acusa número de série duplicado dentro da planilha apontando a 1ª linha", () => {
    const erros = validarLinhasItem([
      linha({ num_serie: "DUP" }),
      linha({ etiqueta: "MON-2", num_serie: "DUP" }),
    ]);

    expect(erros).toHaveLength(1);
    expect(erros[0].linha).toBe(3);
    expect(erros[0].motivo).toMatch(/duplicad/i);
  });

  it("não acusa erro quando todas as linhas são válidas", () => {
    const erros = validarLinhasItem([
      linha(),
      linha({ etiqueta: "MON-2", num_serie: "SN2" }),
    ]);

    expect(erros).toEqual([]);
  });
});

describe("validarLinhasPeca", () => {
  function linha(over = {}) {
    return {
      tipo: "ram",
      marca: "Kingston",
      modelo: "Fury",
      num_serie: "P1",
      preco: "150.00",
      data_aquisicao: "2024-01-01",
      ...over,
    };
  }

  it("recusa tipo de peça inválido", () => {
    const erros = validarLinhasPeca([linha({ tipo: "xpto" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/tipo inválido/i);
  });

  it("recusa número de série acima de 150 caracteres", () => {
    const erros = validarLinhasPeca([linha({ num_serie: "X".repeat(200) })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/série/i);
  });

  it("recusa preço não numérico", () => {
    const erros = validarLinhasPeca([linha({ preco: "abc" })]);

    expect(erros).toHaveLength(1);
    expect(erros[0].motivo).toMatch(/preço/i);
  });

  it("não acusa erro quando a peça é válida", () => {
    const erros = validarLinhasPeca([linha()]);

    expect(erros).toEqual([]);
  });
});

describe("normalizarNumero", () => {
  it("converte o formato brasileiro 1.234,56 para 1234.56", () => {
    expect(normalizarNumero("1.234,56")).toBe("1234.56");
  });

  it("converte o formato americano 1,234.56 para 1234.56", () => {
    expect(normalizarNumero("1,234.56")).toBe("1234.56");
  });

  it("converte vírgula decimal simples 499,90 para 499.90", () => {
    expect(normalizarNumero("499,90")).toBe("499.90");
  });

  it("mantém ponto decimal já normalizado", () => {
    expect(normalizarNumero("499.90")).toBe("499.90");
  });
});
