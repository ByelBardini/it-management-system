import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../../../models/index.js";
import { getItens, postItem } from "../../../controllers/itemController.js";
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
});
