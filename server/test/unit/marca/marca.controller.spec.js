import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { getMarcas, postMarca } from "../../../controllers/marcaController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

describe("marcaController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMarcas", () => {
    it("lista as marcas filtrando por domínio, tipo e subtipo", async () => {
      const marcas = [
        {
          marca_id: 1,
          marca_nome: "Logitech",
          marca_dominio: "item",
          marca_tipo: "periferico",
          marca_subtipo: "Teclado",
        },
      ];
      db.Marca.findAll.mockResolvedValue(marcas);
      const req = mockReq({
        query: { dominio: "item", tipo: "periferico", subtipo: "Teclado" },
      });
      const res = mockRes();

      await getMarcas(req, res);

      const arg = db.Marca.findAll.mock.calls[0][0];
      expect(arg.where).toMatchObject({
        marca_dominio: "item",
        marca_tipo: "periferico",
        marca_subtipo: "Teclado",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(marcas);
    });

    it("usa subtipo vazio quando não informado", async () => {
      db.Marca.findAll.mockResolvedValue([]);
      const req = mockReq({ query: { dominio: "item", tipo: "notebook" } });
      const res = mockRes();

      await getMarcas(req, res);

      const arg = db.Marca.findAll.mock.calls[0][0];
      expect(arg.where).toMatchObject({
        marca_dominio: "item",
        marca_tipo: "notebook",
        marca_subtipo: "",
      });
    });

    it("lança ApiError 400 quando falta domínio ou tipo", async () => {
      const req = mockReq({ query: { dominio: "item" } });
      const res = mockRes();

      await expect(getMarcas(req, res)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("postMarca", () => {
    it("cria a marca com domínio, tipo e subtipo, repassando o usuarioId", async () => {
      db.Marca.create.mockResolvedValue({ marca_id: 5 });
      const req = mockReq({
        body: {
          marca_nome: "Dell",
          marca_dominio: "item",
          marca_tipo: "periferico",
          marca_subtipo: "Mouse",
        },
        usuario: { id: 9 },
      });
      const res = mockRes();

      await postMarca(req, res);

      const [dados, opts] = db.Marca.create.mock.calls[0];
      expect(dados).toMatchObject({
        marca_nome: "Dell",
        marca_dominio: "item",
        marca_tipo: "periferico",
        marca_subtipo: "Mouse",
      });
      expect(opts).toMatchObject({ usuarioId: 9 });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("lança ApiError 400 ao criar marca sem nome, domínio ou tipo", async () => {
      const req = mockReq({ body: { marca_nome: "X" } });
      const res = mockRes();

      await expect(postMarca(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Marca.create).not.toHaveBeenCalled();
    });
  });
});
