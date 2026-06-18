import { describe, it, expect, beforeEach, vi } from "vitest";
// NÃO EXISTE ainda: lógica pura com store/enviar INJETADOS (sem IndexedDB real).
// Erro de import = RED esperado.
import {
  enfileirar,
  drenar,
  reconstruirFormData,
} from "../mobile/filaOffline.js";

function criarStore(registros = []) {
  const dados = [...registros];
  return {
    _dados: dados,
    put: vi.fn(async (registro) => {
      const i = dados.findIndex((r) => r.id === registro.id);
      if (i === -1) dados.push(registro);
      else dados[i] = registro;
      return registro.id;
    }),
    getAll: vi.fn(async () => [...dados]),
    delete: vi.fn(async (id) => {
      const i = dados.findIndex((r) => r.id === id);
      if (i !== -1) dados.splice(i, 1);
    }),
  };
}

const erroRede = Object.assign(new Error("Network Error"), {});

describe("filaOffline", () => {
  let store;
  beforeEach(() => {
    store = criarStore();
  });

  it("(feliz) enfileira registro com endpoint, method, fields, files e contadores", async () => {
    const registro = await enfileirar(
      {
        endpoint: "/item",
        method: "POST",
        fields: { item_etiqueta: "INV-1" },
        files: [],
      },
      { store }
    );

    expect(store.put).toHaveBeenCalledTimes(1);
    expect(registro.endpoint).toBe("/item");
    expect(registro.method).toBe("POST");
    expect(registro.fields).toEqual({ item_etiqueta: "INV-1" });
    expect(registro.retries).toBe(0);
    expect(registro.id).toBeTruthy();
    expect(typeof registro.createdAt).toBe("number");
  });

  it("(borda) reconstruirFormData devolve FormData com cada field e os arquivos", () => {
    const foto = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    const registro = {
      id: "a",
      endpoint: "/item",
      method: "POST",
      fields: { item_etiqueta: "INV-1", item_preco: "3500" },
      files: [foto],
    };

    const fd = reconstruirFormData(registro);

    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get("item_etiqueta")).toBe("INV-1");
    expect(fd.get("item_preco")).toBe("3500");
    expect(fd.getAll("arquivos")).toHaveLength(1);
  });

  it("(erro) drenar: sucesso remove o 1º; falha de rede mantém o 2º com retries:1", async () => {
    store = criarStore([
      { id: "r1", endpoint: "/item", method: "POST", fields: {}, files: [], retries: 0, createdAt: 1 },
      { id: "r2", endpoint: "/item", method: "POST", fields: {}, files: [], retries: 0, createdAt: 2 },
    ]);
    const enviar = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce(erroRede);

    const resultado = await drenar({ store, enviar });

    expect(store.delete).toHaveBeenCalledWith("r1");
    const restantes = await store.getAll();
    const r2 = restantes.find((r) => r.id === "r2");
    expect(r2).toBeTruthy();
    expect(r2.retries).toBe(1);
    expect(resultado.enviados).toBe(1);
  });

  it("(erro) drenar com 401 mantém o registro, não conta retry e sinaliza sessão expirada", async () => {
    store = criarStore([
      { id: "r1", endpoint: "/item", method: "POST", fields: {}, files: [], retries: 0, createdAt: 1 },
    ]);
    const enviar = vi.fn().mockRejectedValue({ status: 401 });

    const resultado = await drenar({ store, enviar });

    const restantes = await store.getAll();
    const r1 = restantes.find((r) => r.id === "r1");
    expect(r1).toBeTruthy();
    expect(r1.retries).toBe(0);
    expect(store.delete).not.toHaveBeenCalledWith("r1");
    expect(resultado.sessaoExpirada).toBe(true);
  });

  it("(borda) drenar com 400 de validação remove marcando falha", async () => {
    store = criarStore([
      { id: "r1", endpoint: "/item", method: "POST", fields: {}, files: [], retries: 0, createdAt: 1 },
    ]);
    const enviar = vi.fn().mockRejectedValue({ status: 400 });

    const resultado = await drenar({ store, enviar });

    expect(store.delete).toHaveBeenCalledWith("r1");
    expect(resultado.descartados).toBe(1);
  });

  it("(borda) respeita o limite de retries / expiração: descarta o registro esgotado", async () => {
    store = criarStore([
      { id: "r1", endpoint: "/item", method: "POST", fields: {}, files: [], retries: 5, createdAt: 1 },
    ]);
    const enviar = vi.fn().mockRejectedValue(erroRede);

    const resultado = await drenar({ store, enviar, maxRetries: 5 });

    const restantes = await store.getAll();
    const r1 = restantes.find((r) => r.id === "r1");
    expect(r1).toBeFalsy();
    expect(resultado.expirados).toBe(1);
  });

  it("(erro) QuotaExceededError ao enfileirar é tratado (não silencioso)", async () => {
    const erroQuota = new DOMException("quota", "QuotaExceededError");
    store = criarStore();
    store.put.mockRejectedValueOnce(erroQuota);

    let erroCapturado;
    try {
      await enfileirar(
        { endpoint: "/item", method: "POST", fields: {}, files: [] },
        { store }
      );
    } catch (e) {
      erroCapturado = e;
    }

    expect(erroCapturado).toBeTruthy();
    expect(erroCapturado.name).toBe("QuotaExceededError");
  });
});
