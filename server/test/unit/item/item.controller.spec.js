import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import {
  getItens,
  postItem,
  importarItens,
  coletarDesktop,
  putItem,
} from "../../../controllers/itemController.js";
import { mockReq, mockRes } from "../helpers/http-mock.js";
import { mockInstance } from "../helpers/sequelize-mock.js";

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

  describe("coletarDesktop", () => {
    // Por padrão marca/modelo ainda não existem e são criados na resolução.
    function mockResolucaoCadastro() {
      db.Marca.findOne.mockResolvedValue(null);
      db.Marca.create.mockResolvedValue({ marca_id: 1 });
      db.Modelo.findOne.mockResolvedValue(null);
      db.Modelo.create.mockResolvedValue({ modelo_id: 1 });
    }

    function corpoValido(over = {}) {
      return {
        item_empresa_id: 1,
        etiqueta: "DSK-014",
        marca: "Dell",
        modelo: "OptiPlex 7090",
        pecas: [
          { tipo: "processador", marca: "Intel", modelo: "Core i5", preco: "100" },
          { tipo: "ram", marca: "Kingston", preco: "200" },
        ],
        ...over,
      };
    }

    it("cria o desktop com peças, resolvendo marca/modelo por nome e somando o preço", async () => {
      mockResolucaoCadastro();
      db.Item.create.mockResolvedValue({ item_id: 50 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({ body: corpoValido() });
      const res = mockRes();

      await coletarDesktop(req, res);

      const [itemArgs] = db.Item.create.mock.calls[0];
      expect(itemArgs).toMatchObject({
        item_tipo: "desktop",
        item_num_serie: "N/A",
        item_preco: 300,
      });
      expect(db.Peca.create).toHaveBeenCalledTimes(2);
      const [peca0] = db.Peca.create.mock.calls[0];
      expect(peca0).toMatchObject({
        peca_item_id: 50,
        peca_em_uso: 1,
        peca_ativa: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      const corpo = res.json.mock.calls[0][0];
      expect(corpo).toMatchObject({ item_id: 50, pecas_criadas: 2 });
    });

    it("usa defaults de série e preço quando a peça não os traz", async () => {
      mockResolucaoCadastro();
      db.Item.create.mockResolvedValue({ item_id: 51 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({
        body: corpoValido({
          marca: "",
          modelo: "",
          pecas: [{ tipo: "ram", marca: "Kingston" }],
        }),
      });
      const res = mockRes();

      await coletarDesktop(req, res);

      const [itemArgs] = db.Item.create.mock.calls[0];
      expect(itemArgs).toMatchObject({ item_preco: 0 });
      const [peca0] = db.Peca.create.mock.calls[0];
      expect(peca0).toMatchObject({ peca_num_serie: "N/A", peca_preco: 0 });
    });

    it("persiste peca_especificacoes quando a peça as traz", async () => {
      mockResolucaoCadastro();
      db.Item.create.mockResolvedValue({ item_id: 70 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({
        body: corpoValido({
          pecas: [
            {
              tipo: "ram",
              marca: "Kingston",
              especificacoes: { capacidade: "8 GB", tipo: "DDR4" },
            },
          ],
        }),
      });
      const res = mockRes();

      await coletarDesktop(req, res);

      const [peca0] = db.Peca.create.mock.calls[0];
      expect(peca0).toMatchObject({
        peca_especificacoes: { capacidade: "8 GB", tipo: "DDR4" },
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("grava peca_especificacoes null quando a peça não as traz", async () => {
      mockResolucaoCadastro();
      db.Item.create.mockResolvedValue({ item_id: 71 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({
        body: corpoValido({ pecas: [{ tipo: "ram", marca: "Kingston" }] }),
      });
      const res = mockRes();

      await coletarDesktop(req, res);

      const [peca0] = db.Peca.create.mock.calls[0];
      expect(peca0).toMatchObject({ peca_especificacoes: null });
    });

    it("cria o desktop sem marca/modelo quando não informados", async () => {
      db.Item.create.mockResolvedValue({ item_id: 52 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({
        body: corpoValido({ marca: "", modelo: "", pecas: [{ tipo: "ram" }] }),
      });
      const res = mockRes();

      await coletarDesktop(req, res);

      const [itemArgs] = db.Item.create.mock.calls[0];
      expect(itemArgs).toMatchObject({
        item_marca_id: null,
        item_modelo_id: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("reaproveita a marca repetida das peças uma única vez (cache do lote)", async () => {
      mockResolucaoCadastro();
      db.Marca.create.mockResolvedValue({ marca_id: 7 });
      db.Item.create.mockResolvedValue({ item_id: 53 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({
        body: corpoValido({
          marca: "",
          modelo: "",
          pecas: [
            { tipo: "ram", marca: "Kingston" },
            { tipo: "ram", marca: "Kingston" },
          ],
        }),
      });
      const res = mockRes();

      await coletarDesktop(req, res);

      expect(db.Marca.findOne).toHaveBeenCalledTimes(1);
      expect(db.Marca.create).toHaveBeenCalledTimes(1);
      expect(db.Peca.create).toHaveBeenCalledTimes(2);
    });

    it("recusa o cadastro quando não há peças", async () => {
      const req = mockReq({ body: corpoValido({ pecas: [] }) });
      const res = mockRes();

      await expect(coletarDesktop(req, res)).rejects.toMatchObject({
        status: 400,
      });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("recusa o cadastro quando falta a empresa", async () => {
      const req = mockReq({ body: corpoValido({ item_empresa_id: undefined }) });
      const res = mockRes();

      await expect(coletarDesktop(req, res)).rejects.toMatchObject({
        status: 400,
      });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("recusa o cadastro quando uma peça tem tipo inválido", async () => {
      const req = mockReq({ body: corpoValido({ pecas: [{ tipo: "teclado" }] }) });
      const res = mockRes();

      await expect(coletarDesktop(req, res)).rejects.toMatchObject({
        status: 400,
      });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("recusa 400 (e não 500) quando uma peça do payload é null", async () => {
      const req = mockReq({ body: corpoValido({ pecas: [null] }) });
      const res = mockRes();

      await expect(coletarDesktop(req, res)).rejects.toMatchObject({
        status: 400,
      });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("valida o setor pela empresa e cria o item quando ele existe", async () => {
      mockResolucaoCadastro();
      db.Setor.findOne.mockResolvedValue({ setor_id: 3 });
      db.Item.create.mockResolvedValue({ item_id: 60 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({ body: corpoValido({ setor_id: 3 }) });
      const res = mockRes();

      await coletarDesktop(req, res);

      expect(db.Setor.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { setor_id: 3, setor_empresa_id: 1 },
        })
      );
      const [itemArgs] = db.Item.create.mock.calls[0];
      expect(itemArgs).toMatchObject({ item_setor_id: 3 });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("recusa 400 quando o setor informado não existe na empresa", async () => {
      mockResolucaoCadastro();
      db.Setor.findOne.mockResolvedValue(null);

      const req = mockReq({ body: corpoValido({ setor_id: 999 }) });
      const res = mockRes();

      await expect(coletarDesktop(req, res)).rejects.toMatchObject({
        status: 400,
      });
      expect(db.Item.create).not.toHaveBeenCalled();
    });

    it("valida o workstation pela empresa e cria o item quando ele existe", async () => {
      mockResolucaoCadastro();
      db.Workstation.findOne.mockResolvedValue({ workstation_id: 9 });
      db.Item.create.mockResolvedValue({ item_id: 61 });
      db.Peca.create.mockResolvedValue({ peca_id: 1 });

      const req = mockReq({ body: corpoValido({ workstation_id: 9 }) });
      const res = mockRes();

      await coletarDesktop(req, res);

      expect(db.Workstation.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workstation_id: 9, workstation_empresa_id: 1 },
        })
      );
      const [itemArgs] = db.Item.create.mock.calls[0];
      expect(itemArgs).toMatchObject({ item_workstation_id: 9 });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("recusa 400 quando o workstation informado não existe na empresa", async () => {
      mockResolucaoCadastro();
      db.Workstation.findOne.mockResolvedValue(null);

      const req = mockReq({ body: corpoValido({ workstation_id: 999 }) });
      const res = mockRes();

      await expect(coletarDesktop(req, res)).rejects.toMatchObject({
        status: 400,
      });
      expect(db.Item.create).not.toHaveBeenCalled();
    });
  });

  describe("putItem", () => {
    it("valida o setor pela empresa do item e salva quando ele existe", async () => {
      const item = mockInstance({
        item_id: 10,
        item_empresa_id: 1,
        item_tipo: "notebook",
      });
      db.Item.findByPk.mockResolvedValue(item);
      db.Setor.findOne.mockResolvedValue({ setor_id: 5 });
      db.Anexo.findAll.mockResolvedValue([]);

      const req = mockReq({
        params: { id: "10" },
        body: { item_setor_id: "5" },
      });
      const res = mockRes();

      await putItem(req, res);

      expect(db.Setor.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { setor_id: "5", setor_empresa_id: 1 },
        })
      );
      expect(item.item_setor_id).toBe("5");
      expect(item.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("recusa 400 quando o setor informado não existe na empresa do item", async () => {
      const item = mockInstance({
        item_id: 10,
        item_empresa_id: 1,
        item_tipo: "notebook",
      });
      db.Item.findByPk.mockResolvedValue(item);
      db.Setor.findOne.mockResolvedValue(null);

      const req = mockReq({
        params: { id: "10" },
        body: { item_setor_id: "999" },
      });
      const res = mockRes();

      await expect(putItem(req, res)).rejects.toMatchObject({ status: 400 });
      expect(item.save).not.toHaveBeenCalled();
    });

    it("recusa 400 quando o workstation informado não existe na empresa do item", async () => {
      const item = mockInstance({
        item_id: 10,
        item_empresa_id: 2,
        item_tipo: "monitor",
      });
      db.Item.findByPk.mockResolvedValue(item);
      db.Workstation.findOne.mockResolvedValue(null);

      const req = mockReq({
        params: { id: "10" },
        body: { item_workstation_id: "77" },
      });
      const res = mockRes();

      await expect(putItem(req, res)).rejects.toMatchObject({ status: 400 });
      expect(item.save).not.toHaveBeenCalled();
    });

    it("limpa o vínculo (null) sem consultar setor/workstation", async () => {
      const item = mockInstance({
        item_id: 10,
        item_empresa_id: 1,
        item_tipo: "notebook",
      });
      db.Item.findByPk.mockResolvedValue(item);
      db.Anexo.findAll.mockResolvedValue([]);

      const req = mockReq({
        params: { id: "10" },
        body: { item_setor_id: "null", item_workstation_id: "null" },
      });
      const res = mockRes();

      await putItem(req, res);

      expect(db.Setor.findOne).not.toHaveBeenCalled();
      expect(db.Workstation.findOne).not.toHaveBeenCalled();
      expect(item.item_setor_id).toBeNull();
      expect(item.item_workstation_id).toBeNull();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
