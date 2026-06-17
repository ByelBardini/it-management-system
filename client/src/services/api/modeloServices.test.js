import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api.js", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from "../api.js";
import { getModelos, postModelo } from "./modeloServices.js";

describe("modeloServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getModelos", () => {
    it("busca os modelos de uma marca pelo id", async () => {
      const modelos = [
        { modelo_id: 1, modelo_nome: "K120", modelo_marca_id: 3 },
      ];
      api.get.mockResolvedValue({ data: modelos });

      const resultado = await getModelos(3);

      expect(api.get).toHaveBeenCalledWith("/marca/3/modelos");
      expect(resultado).toEqual(modelos);
    });
  });

  describe("postModelo", () => {
    it("cria o modelo vinculado à marca", async () => {
      api.post.mockResolvedValue({ data: { message: "ok", modelo_id: 7 } });

      const resultado = await postModelo(3, "K120");

      expect(api.post).toHaveBeenCalledWith("/modelo", {
        modelo_marca_id: 3,
        modelo_nome: "K120",
      });
      expect(resultado).toMatchObject({ modelo_id: 7 });
    });
  });
});
