import { describe, it, expect } from "vitest";
import {
  dividirEmPartes,
  formatarIntervalo,
} from "../components/default/funcoes.js";

describe("dividirEmPartes", () => {
  it("divide a lista em blocos do tamanho informado", () => {
    const resultado = dividirEmPartes([1, 2, 3, 4, 5], 2);

    expect(resultado).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("retorna lista vazia quando a entrada é vazia", () => {
    expect(dividirEmPartes([], 3)).toEqual([]);
  });
});

describe("formatarIntervalo", () => {
  it("retorna 'Não é realizado' quando o intervalo é 0", () => {
    expect(formatarIntervalo(0, 10)).toBe("Não é realizado");
  });

  it("descreve os dias de atraso quando o prazo já passou", () => {
    expect(formatarIntervalo(1, -2)).toBe("Atrasado 2 dias");
  });

  it("converte o prazo em meses quando passa de 30 dias", () => {
    expect(formatarIntervalo(1, 60)).toBe("2 meses");
  });
});
