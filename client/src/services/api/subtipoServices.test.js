import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api.js", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from "../api.js";
import { getSubtipos, postSubtipo } from "./subtipoServices.js";

describe("subtipoServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSubtipos", () => {
    it("busca os subtipos de um tipo", async () => {
      const subtipos = [
        { subtipo_id: 1, subtipo_tipo: "periferico", subtipo_nome: "Teclado" },
      ];
      api.get.mockResolvedValue({ data: subtipos });

      const resultado = await getSubtipos("periferico");

      expect(api.get).toHaveBeenCalledWith("/subtipo?tipo=periferico");
      expect(resultado).toEqual(subtipos);
    });
  });

  describe("postSubtipo", () => {
    it("cria o subtipo vinculado ao tipo", async () => {
      api.post.mockResolvedValue({ data: { message: "ok", subtipo_id: 7 } });

      const resultado = await postSubtipo("periferico", "Mouse");

      expect(api.post).toHaveBeenCalledWith("/subtipo", {
        subtipo_tipo: "periferico",
        subtipo_nome: "Mouse",
      });
      expect(resultado).toMatchObject({ subtipo_id: 7 });
    });
  });
});
