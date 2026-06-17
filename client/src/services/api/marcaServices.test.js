import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api.js", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from "../api.js";
import { getMarcas, postMarca } from "./marcaServices.js";

describe("marcaServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMarcas", () => {
    it("busca as marcas escopadas por domínio, tipo e subtipo", async () => {
      const marcas = [
        {
          marca_id: 1,
          marca_nome: "Logitech",
          marca_dominio: "item",
          marca_tipo: "periferico",
          marca_subtipo: "Teclado",
        },
      ];
      api.get.mockResolvedValue({ data: marcas });

      const resultado = await getMarcas("item", "periferico", "Teclado");

      expect(api.get).toHaveBeenCalledWith(
        "/marca?dominio=item&tipo=periferico&subtipo=Teclado"
      );
      expect(resultado).toEqual(marcas);
    });

    it("propaga o erro normalizado quando a busca falha", async () => {
      api.get.mockRejectedValue({ status: 400, message: "tipo obrigatório" });

      await expect(getMarcas("item")).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("postMarca", () => {
    it("cria a marca enviando nome, domínio, tipo e subtipo", async () => {
      api.post.mockResolvedValue({ data: { message: "ok", marca_id: 9 } });

      const resultado = await postMarca("Dell", "item", "periferico", "Mouse");

      expect(api.post).toHaveBeenCalledWith("/marca", {
        marca_nome: "Dell",
        marca_dominio: "item",
        marca_tipo: "periferico",
        marca_subtipo: "Mouse",
      });
      expect(resultado).toMatchObject({ marca_id: 9 });
    });
  });
});
