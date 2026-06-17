import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api.js", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

import { api } from "../api.js";
import { importarItens } from "./itemServices.js";

describe("itemServices.importarItens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("faz POST /item/importar com a empresa e a lista de itens", async () => {
    api.post.mockResolvedValue({ data: { criados: 2 } });
    const itens = [{ tipo: "monitor", etiqueta: "MON-1" }];

    const resultado = await importarItens("1", itens);

    expect(api.post).toHaveBeenCalledWith("/item/importar", {
      item_empresa_id: "1",
      itens,
    });
    expect(resultado).toMatchObject({ criados: 2 });
  });

  it("propaga o erro normalizado quando a importação falha", async () => {
    api.post.mockRejectedValue({ status: 400, message: "erro" });

    await expect(importarItens("1", [])).rejects.toMatchObject({ status: 400 });
  });
});
