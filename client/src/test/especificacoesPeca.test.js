import { describe, it, expect } from "vitest";
import {
  formatarEspecificacoesPeca,
  construirEspecificacoes,
  CAMPOS_ESPECIFICACAO,
} from "../components/pecas/especificacoes.js";

describe("formatarEspecificacoesPeca", () => {
  it("converte o objeto em lista ordenada de rótulo/valor", () => {
    const resultado = formatarEspecificacoesPeca({
      capacidade: "8 GB",
      velocidade: "3200 MHz",
      tipo: "DDR4",
    });

    expect(resultado).toEqual([
      { rotulo: "Capacidade", valor: "8 GB" },
      { rotulo: "Velocidade", valor: "3200 MHz" },
      { rotulo: "Tipo", valor: "DDR4" },
    ]);
  });

  it("retorna lista vazia para null, undefined ou objeto vazio", () => {
    expect(formatarEspecificacoesPeca(null)).toEqual([]);
    expect(formatarEspecificacoesPeca(undefined)).toEqual([]);
    expect(formatarEspecificacoesPeca({})).toEqual([]);
  });

  it("ignora valores vazios e usa a chave como rótulo quando não mapeada", () => {
    const resultado = formatarEspecificacoesPeca({
      capacidade: "",
      conexao: "NVMe",
      foo: "bar",
    });

    expect(resultado).toEqual([
      { rotulo: "Conexão", valor: "NVMe" },
      { rotulo: "foo", valor: "bar" },
    ]);
  });

  it("não quebra com entrada que não é objeto", () => {
    expect(formatarEspecificacoesPeca("DDR4")).toEqual([]);
    expect(formatarEspecificacoesPeca([1, 2])).toEqual([]);
  });
});

describe("construirEspecificacoes", () => {
  it("mantém só os campos do tipo, descartando vazios e desconhecidos", () => {
    const obj = construirEspecificacoes("ram", {
      capacidade: "8 GB",
      velocidade: "",
      tipo: "DDR4",
      conexao: "SATA", // não pertence a ram → ignorado
    });

    expect(obj).toEqual({ capacidade: "8 GB", tipo: "DDR4" });
  });

  it("retorna objeto vazio para tipo sem campos ou valores vazios", () => {
    expect(construirEspecificacoes("gabinete", { foo: "bar" })).toEqual({});
    expect(construirEspecificacoes("ram", {})).toEqual({});
    expect(construirEspecificacoes("", {})).toEqual({});
  });

  it("expõe os campos esperados por tipo", () => {
    expect(CAMPOS_ESPECIFICACAO.ram.map((c) => c.chave)).toEqual([
      "capacidade",
      "velocidade",
      "tipo",
    ]);
    expect(CAMPOS_ESPECIFICACAO.armazenamento.map((c) => c.chave)).toEqual([
      "capacidade",
      "midia",
      "conexao",
    ]);
  });
});
