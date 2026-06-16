import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import {
  getSetores,
  postSetor,
  deleteSetor,
} from "../../../controllers/setorController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";
import { mockInstance } from "../helpers/sequelize-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

describe("setorController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSetores", () => {
    it("lança ApiError 400 quando o id da empresa não é informado", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await expect(getSetores(req, res)).rejects.toMatchObject({ status: 400 });
    });

    it("retorna os setores da empresa informada", async () => {
      const setores = [{ setor_id: 1, setor_nome: "TI" }];
      db.Setor.findAll.mockResolvedValue(setores);
      const req = mockReq({ params: { id: "7" } });
      const res = mockRes();

      await getSetores(req, res);

      expect(db.Setor.findAll).toHaveBeenCalledWith({
        where: { setor_empresa_id: "7" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(setores);
    });
  });

  describe("postSetor", () => {
    it("lança ApiError 400 quando faltam dados obrigatórios", async () => {
      const req = mockReq({ body: { setor_nome: "TI" } });
      const res = mockRes();

      await expect(postSetor(req, res)).rejects.toMatchObject({ status: 400 });
    });

    it("cria o setor repassando o usuarioId para o log de auditoria", async () => {
      db.Setor.create.mockResolvedValue({ setor_id: 1 });
      const req = mockReq({
        body: { setor_empresa_id: 7, setor_nome: "TI" },
        usuario: { id: 99, tipo: "adm" },
      });
      const res = mockRes();

      await postSetor(req, res);

      expect(db.Setor.create).toHaveBeenCalledWith(
        { setor_empresa_id: 7, setor_nome: "TI" },
        { usuarioId: 99 }
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("deleteSetor", () => {
    it("busca o setor e chama destroy com o usuarioId", async () => {
      const setor = mockInstance({ setor_id: 5 });
      db.Setor.findByPk.mockResolvedValue(setor);
      const req = mockReq({ params: { id: "5" }, usuario: { id: 99 } });
      const res = mockRes();

      await deleteSetor(req, res);

      expect(db.Setor.findByPk).toHaveBeenCalledWith("5");
      expect(setor.destroy).toHaveBeenCalledWith({ usuarioId: 99 });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
