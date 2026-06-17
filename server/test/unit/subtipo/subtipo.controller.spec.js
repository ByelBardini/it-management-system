import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import {
  getSubtipos,
  postSubtipo,
} from "../../../controllers/subtipoController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

describe("subtipoController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSubtipos", () => {
    it("lista os subtipos de um tipo", async () => {
      const subtipos = [
        { subtipo_id: 1, subtipo_tipo: "periferico", subtipo_nome: "Teclado" },
      ];
      db.Subtipo.findAll.mockResolvedValue(subtipos);
      const req = mockReq({ query: { tipo: "periferico" } });
      const res = mockRes();

      await getSubtipos(req, res);

      const arg = db.Subtipo.findAll.mock.calls[0][0];
      expect(arg.where).toMatchObject({ subtipo_tipo: "periferico" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(subtipos);
    });

    it("lança ApiError 400 quando falta o tipo", async () => {
      const req = mockReq({ query: {} });
      const res = mockRes();

      await expect(getSubtipos(req, res)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("postSubtipo", () => {
    it("cria o subtipo vinculado ao tipo, repassando o usuarioId", async () => {
      db.Subtipo.create.mockResolvedValue({ subtipo_id: 7 });
      const req = mockReq({
        body: { subtipo_tipo: "periferico", subtipo_nome: "Headset" },
        usuario: { id: 3 },
      });
      const res = mockRes();

      await postSubtipo(req, res);

      const [dados, opts] = db.Subtipo.create.mock.calls[0];
      expect(dados).toMatchObject({
        subtipo_tipo: "periferico",
        subtipo_nome: "Headset",
      });
      expect(opts).toMatchObject({ usuarioId: 3 });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("lança ApiError 400 ao criar subtipo sem tipo ou nome", async () => {
      const req = mockReq({ body: { subtipo_nome: "X" } });
      const res = mockRes();

      await expect(postSubtipo(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Subtipo.create).not.toHaveBeenCalled();
    });
  });
});
