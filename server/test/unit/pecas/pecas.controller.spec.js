import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { getPecasAtivas, postPeca } from "../../../controllers/pecasController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

describe("pecasController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPecasAtivas", () => {
    it("traz as peças ativas já com marca e modelo do cadastro", async () => {
      db.Peca.findAll.mockResolvedValue([]);
      const req = mockReq({ params: { id: "4" } });
      const res = mockRes();

      await getPecasAtivas(req, res);

      const arg = db.Peca.findAll.mock.calls[0][0];
      expect(arg.where).toMatchObject({ peca_empresa_id: "4", peca_ativa: 1 });
      const aliases = arg.include.map((i) => i.as);
      expect(aliases).toContain("marca");
      expect(aliases).toContain("modelo");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("lança ApiError 400 quando falta o id da empresa", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await expect(getPecasAtivas(req, res)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("postPeca", () => {
    it("cria a peça sem exigir nome, gravando peca_marca_id e peca_modelo_id", async () => {
      db.Peca.create.mockResolvedValue({ peca_id: 2 });
      const req = mockReq({
        body: {
          id_empresa: "1",
          tipo: "ram",
          preco: "150",
          data_aquisicao: "2024-01-01",
          numSerie: "PCA-1",
          marca_id: "3",
          modelo_id: "9",
        },
      });
      const res = mockRes();

      await postPeca(req, res);

      const [dados] = db.Peca.create.mock.calls[0];
      expect(dados).toMatchObject({ peca_marca_id: "3", peca_modelo_id: "9" });
      expect(dados).not.toHaveProperty("peca_nome");
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});
