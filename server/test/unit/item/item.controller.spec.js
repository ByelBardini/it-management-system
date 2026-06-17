import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import {
  getItens,
  postItem,
  importarItens,
} from "../../../controllers/itemController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";

vi.mock("../../../models/index.js", async () => {
  const { createModelsMock } = await import("../helpers/sequelize-mock.js");
  return createModelsMock();
});

vi.mock("../../../config/database.js", async () => {
  const { createSequelizeMock } = await import("../helpers/sequelize-mock.js");
  return createSequelizeMock();
});

describe("itemController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getItens", () => {
    it("traz marca e modelo do cadastro por FK, com número de série e sem item_nome", async () => {
      db.Item.findAll.mockResolvedValue([]);
      const req = mockReq({ params: { id: "7" } });
      const res = mockRes();

      await getItens(req, res);

      const arg = db.Item.findAll.mock.calls[0][0];
      expect(arg.where).toMatchObject({ item_empresa_id: "7", item_ativo: 1 });
      expect(arg.attributes).toEqual(expect.arrayContaining(["item_num_serie"]));
      expect(arg.attributes).not.toContain("item_nome");
      const aliases = arg.include.map((i) => i.as);
      expect(aliases).toContain("marca");
      expect(aliases).toContain("modelo");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("lança ApiError 400 quando o id da empresa não é informado", async () => {
      const req = mockReq({ params: {} });
      const res = mockRes();

      await expect(getItens(req, res)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("postItem", () => {
    it("cria o item sem exigir nome, gravando item_marca_id e item_modelo_id", async () => {
      db.Item.create.mockResolvedValue({ item_id: 10 });
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          item_tipo: "periferico",
          item_etiqueta: "PER-1",
          item_num_serie: "SN-1",
          item_marca_id: "3",
          item_modelo_id: "8",
          item_preco: "100",
          item_data_aquisicao: "2024-01-01",
          item_em_uso: "true",
          item_ultima_manutencao: "2024-01-01",
          item_intervalo_manutencao: "6",
        },
      });
      const res = mockRes();

      await postItem(req, res);

      const [dados] = db.Item.create.mock.calls[0];
      expect(dados).toMatchObject({ item_marca_id: "3", item_modelo_id: "8" });
      expect(dados).not.toHaveProperty("item_nome");
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("importarItens", () => {
    function linhaValida(over = {}) {
      return {
        tipo: "monitor",
        etiqueta: "MON-1",
        num_serie: "SN1",
        marca: "",
        modelo: "",
        subtipo: "",
        preco: "500.00",
        data_aquisicao: "2024-01-01",
        ultima_manutencao: "2024-01-01",
        intervalo_manutencao: "6",
        em_uso: "sim",
        ...over,
      };
    }

    beforeEach(() => {
      // Pré-checagem de número de série já existente: por padrão, nada no banco.
      db.Item.findAll.mockResolvedValue([]);
    });

    it("importa linhas válidas criando itens e resolvendo marca/modelo por nome", async () => {
      db.Marca.findOne.mockResolvedValue(null);
      db.Marca.create.mockResolvedValue({ marca_id: 3 });
      db.Modelo.findOne.mockResolvedValue(null);
      db.Modelo.create.mockResolvedValue({ modelo_id: 9 });
      db.Item.create.mockResolvedValue({ item_id: 10 });

      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ marca: "Dell", modelo: "P2419" })],
        },
      });
      const res = mockRes();

      await importarItens(req, res);

      const [dados] = db.Item.create.mock.calls[0];
      expect(dados).toMatchObject({
        item_empresa_id: "1",
        item_marca_id: 3,
        item_modelo_id: 9,
        item_tipo: "monitor",
        item_etiqueta: "MON-1",
        item_num_serie: "SN1",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      const corpo = res.json.mock.calls[0][0];
      expect(corpo).toMatchObject({ criados: 1 });
    });

    it("grava a característica de subtipo nos tipos que têm subtipo", async () => {
      db.Marca.findOne.mockResolvedValue({ marca_id: 3 });
      db.Item.create.mockResolvedValue({ item_id: 5 });

      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [
            linhaValida({ tipo: "periferico", subtipo: "Teclado", marca: "Logitech" }),
          ],
        },
      });
      const res = mockRes();

      await importarItens(req, res);

      const whereMarca = db.Marca.findOne.mock.calls[0][0].where;
      expect(whereMarca).toMatchObject({
        marca_dominio: "item",
        marca_tipo: "periferico",
        marca_subtipo: "Teclado",
        marca_nome: "Logitech",
      });
      const [carac] = db.Caracteristica.create.mock.calls[0];
      expect(carac).toMatchObject({
        caracteristica_item_id: 5,
        caracteristica_nome: "tipo",
        caracteristica_valor: "Teclado",
      });
    });

    it("reaproveita marca/modelo já existentes sem duplicar", async () => {
      db.Marca.findOne.mockResolvedValue({ marca_id: 3 });
      db.Item.create.mockResolvedValue({ item_id: 11 });

      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ marca: "Dell" })],
        },
      });
      const res = mockRes();

      await importarItens(req, res);

      expect(db.Marca.create).not.toHaveBeenCalled();
      const [dados] = db.Item.create.mock.calls[0];
      expect(dados).toMatchObject({ item_marca_id: 3 });
    });

    it("rejeita o lote inteiro quando uma linha é desktop", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida(), linhaValida({ tipo: "desktop" })],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("rejeita o lote quando uma linha tem campo obrigatório faltando", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ etiqueta: "" })],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("lança 400 quando o corpo não traz empresa ou lista de itens", async () => {
      const req = mockReq({ body: { item_empresa_id: "1", itens: [] } });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
    });

    it("rejeita número de série duplicado dentro da própria planilha", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ num_serie: "DUP" }), linhaValida({ num_serie: "DUP" })],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("rejeita número de série que já existe no inventário", async () => {
      db.Item.findAll.mockResolvedValue([{ item_num_serie: "SN1" }]);
      const req = mockReq({
        body: { item_empresa_id: "1", itens: [linhaValida({ num_serie: "SN1" })] },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("rejeita data fora do formato AAAA-MM-DD", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ data_aquisicao: "15/01/2024" })],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("rejeita número de série acima do limite de coluna", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ num_serie: "X".repeat(300) })],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("rejeita preço não numérico (ex.: Infinity)", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ preco: "Infinity" })],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("rejeita subtipo acima do limite de coluna (100 caracteres)", async () => {
      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [
            linhaValida({ tipo: "periferico", subtipo: "S".repeat(120) }),
          ],
        },
      });
      const res = mockRes();

      await expect(importarItens(req, res)).rejects.toMatchObject({ status: 400 });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("registra o subtipo no cadastro central ao importar", async () => {
      db.Marca.findOne.mockResolvedValue({ marca_id: 3 });
      db.Item.create.mockResolvedValue({ item_id: 5 });
      db.Subtipo.findOrCreate.mockResolvedValue([{ subtipo_id: 1 }, true]);

      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [linhaValida({ tipo: "periferico", subtipo: "Teclado", marca: "Logitech" })],
        },
      });
      const res = mockRes();

      await importarItens(req, res);

      const [args] = db.Subtipo.findOrCreate.mock.calls[0];
      expect(args.where).toMatchObject({
        subtipo_tipo: "periferico",
        subtipo_nome: "Teclado",
      });
    });

    it("resolve a mesma marca uma única vez para linhas repetidas (cache do lote)", async () => {
      db.Marca.findOne.mockResolvedValue(null);
      db.Marca.create.mockResolvedValue({ marca_id: 3 });
      db.Item.create.mockResolvedValue({ item_id: 10 });

      const req = mockReq({
        body: {
          item_empresa_id: "1",
          itens: [
            linhaValida({ num_serie: "SN1", marca: "Dell" }),
            linhaValida({ num_serie: "SN2", marca: "Dell" }),
          ],
        },
      });
      const res = mockRes();

      await importarItens(req, res);

      expect(db.Marca.findOne).toHaveBeenCalledTimes(1);
      expect(db.Marca.create).toHaveBeenCalledTimes(1);
      expect(db.Item.create).toHaveBeenCalledTimes(2);
    });
  });
});
