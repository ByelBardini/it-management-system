// Autossuficiente: importa o polyfill de IndexedDB no topo do próprio teste
// (o setup.js só passa a importar isso na implementação).
import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
// NÃO EXISTE ainda: wrapper IndexedDB com objectStore "outbox".
// Erro de import = RED esperado.
import { putRegistro, getRegistros, deleteRegistro } from "../mobile/db.js";

describe("db (outbox IndexedDB)", () => {
  it("(feliz) grava e lê o mesmo registro do outbox", async () => {
    const registro = {
      id: "reg-1",
      endpoint: "/item",
      method: "POST",
      fields: { item_etiqueta: "INV-1" },
      files: [],
    };

    await putRegistro(registro);
    const lidos = await getRegistros();

    const encontrado = lidos.find((r) => r.id === "reg-1");
    expect(encontrado).toBeTruthy();
    expect(encontrado.endpoint).toBe("/item");
    expect(encontrado.fields).toEqual({ item_etiqueta: "INV-1" });
  });

  it("(borda) store sem dados retorna lista vazia", async () => {
    const lista = await getRegistros();

    expect(Array.isArray(lista)).toBe(true);
    expect(lista.find((r) => r.id === "inexistente")).toBeUndefined();
  });

  it("(borda) deletar id inexistente é no-op e não lança", async () => {
    await putRegistro({
      id: "reg-existente",
      endpoint: "/item",
      method: "POST",
      fields: {},
      files: [],
    });
    const antes = await getRegistros();

    let erro = null;
    try {
      await deleteRegistro("nao-existe-123");
    } catch (e) {
      erro = e;
    }

    const depois = await getRegistros();
    expect(erro).toBeNull();
    // O no-op não remove nada: a contagem e o registro existente permanecem.
    expect(depois.length).toBe(antes.length);
    expect(depois.find((r) => r.id === "reg-existente")).toBeTruthy();
  });
});
