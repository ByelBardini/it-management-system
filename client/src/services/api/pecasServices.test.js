import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api.js", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

import { api } from "../api.js";
import { importarPecas } from "./pecasServices.js";

describe("pecasServices.importarPecas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("faz POST /pecas/importar com a empresa e a lista de peças", async () => {
    api.post.mockResolvedValue({ data: { criados: 3 } });
    const pecas = [{ tipo: "ram", num_serie: "P1" }];

    const resultado = await importarPecas("1", pecas);

    expect(api.post).toHaveBeenCalledWith("/pecas/importar", {
      id_empresa: "1",
      pecas,
    });
    expect(resultado).toMatchObject({ criados: 3 });
  });

  it("propaga o erro normalizado quando a importação falha", async () => {
    api.post.mockRejectedValue({ status: 400, message: "erro" });

    await expect(importarPecas("1", [])).rejects.toMatchObject({ status: 400 });
  });
});
