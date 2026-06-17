import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import {
  getPecasAtivas,
  postPeca,
  importarPecas,
} from "../../../controllers/pecasController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

vi.mock("../../../config/database.js", async () => {
  const { createSequelizeMock } = await import("../helpers/sequelize-mock.js");
  return createSequelizeMock();
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

  describe("importarPecas", () => {
    function linhaValida(over = {}) {
      return {
        tipo: "ram",
        marca: "",
        modelo: "",
        num_serie: "P1",
        preco: "150",
        data_aquisicao: "2024-01-01",
        ...over,
      };
    }

    it("importa peças válidas resolvendo marca/modelo e nascendo sem vínculo", async () => {
      db.Marca.findOne.mockResolvedValue(null);
      db.Marca.create.mockResolvedValue({ marca_id: 4 });
      db.Modelo.findOne.mockResolvedValue(null);
      db.Modelo.create.mockResolvedValue({ modelo_id: 7 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({
        body: {
          id_empresa: "1",
          pecas: [linhaValida({ marca: "Kingston", modelo: "Fury" })],
        },
      });
      const res = mockRes();

      await importarPecas(req, res);

      const [dados] = db.Peca.create.mock.calls[0];
      expect(dados).toMatchObject({
        peca_empresa_id: "1",
        peca_marca_id: 4,
        peca_modelo_id: 7,
        peca_item_id: null,
        peca_ativa: 1,
        peca_em_uso: 0,
        peca_num_serie: "P1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0]).toMatchObject({ criados: 1 });
    });

    it("peça sem marca grava ids nulos e não toca o cadastro central", async () => {
      db.Peca.create.mockResolvedValue({ peca_id: 2 });

      const req = mockReq({
        body: { id_empresa: "1", pecas: [linhaValida({ marca: "", modelo: "" })] },
      });
      const res = mockRes();

      await importarPecas(req, res);

      expect(db.Marca.findOne).not.toHaveBeenCalled();
      expect(db.Marca.create).not.toHaveBeenCalled();
      const [dados] = db.Peca.create.mock.calls[0];
      expect(dados).toMatchObject({ peca_marca_id: null, peca_modelo_id: null });
    });

    it("rejeita o lote quando uma linha tem tipo inválido", async () => {
      const req = mockReq({
        body: {
          id_empresa: "1",
          pecas: [linhaValida(), linhaValida({ tipo: "xpto" })],
        },
      });
      const res = mockRes();

      await expect(importarPecas(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Peca.create).not.toHaveBeenCalled();
    });

    it("lança 400 quando falta a empresa ou a lista de peças", async () => {
      const req = mockReq({ body: { id_empresa: "1", pecas: [] } });
      const res = mockRes();

      await expect(importarPecas(req, res)).rejects.toMatchObject({ status: 400 });
    });

    it("rejeita data fora do formato AAAA-MM-DD", async () => {
      const req = mockReq({
        body: {
          id_empresa: "1",
          pecas: [linhaValida({ data_aquisicao: "31/12/2024" })],
        },
      });
      const res = mockRes();

      await expect(importarPecas(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Peca.create).not.toHaveBeenCalled();
    });

    it("rejeita número de série acima de 150 caracteres", async () => {
      const req = mockReq({
        body: {
          id_empresa: "1",
          pecas: [linhaValida({ num_serie: "X".repeat(200) })],
        },
      });
      const res = mockRes();

      await expect(importarPecas(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Peca.create).not.toHaveBeenCalled();
    });

    it("rejeita preço não numérico", async () => {
      const req = mockReq({
        body: { id_empresa: "1", pecas: [linhaValida({ preco: "abc" })] },
      });
      const res = mockRes();

      await expect(importarPecas(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Peca.create).not.toHaveBeenCalled();
    });
  });
});
