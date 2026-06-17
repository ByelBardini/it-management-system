import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { getModelos, postModelo } from "../../../controllers/modeloController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

describe("modeloController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getModelos", () => {
    it("lista os modelos de uma marca pelo id recebido", async () => {
      const modelos = [
        { modelo_id: 1, modelo_nome: "K120", modelo_marca_id: 3 },
      ];
      db.Modelo.findAll.mockResolvedValue(modelos);
      const req = mockReq({ params: { id: "3" } });
      const res = mockRes();

      await getModelos(req, res);

      const arg = db.Modelo.findAll.mock.calls[0][0];
      expect(arg.where).toMatchObject({ modelo_marca_id: "3" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(modelos);
    });
  });

  describe("postModelo", () => {
    it("cria o modelo vinculado à marca repassando o usuarioId", async () => {
      db.Modelo.create.mockResolvedValue({ modelo_id: 7 });
      const req = mockReq({
        body: { modelo_marca_id: 3, modelo_nome: "K120" },
        usuario: { id: 2 },
      });
      const res = mockRes();

      await postModelo(req, res);

      const [dados, opts] = db.Modelo.create.mock.calls[0];
      expect(dados).toMatchObject({ modelo_marca_id: 3, modelo_nome: "K120" });
      expect(opts).toMatchObject({ usuarioId: 2 });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("lança ApiError 400 ao criar modelo sem marca ou sem nome", async () => {
      const req = mockReq({ body: { modelo_nome: "K120" } });
      const res = mockRes();

      await expect(postModelo(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Modelo.create).not.toHaveBeenCalled();
    });
  });
});
