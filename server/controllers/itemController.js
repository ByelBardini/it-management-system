import path from "path";
import fs from "fs";
import sequelize from "../config/database.js";
import {
  Anexo,
  Caracteristica,
  Item,
  Setor,
  Workstation,
} from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getItens(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID da empresa é obrigatório");
  }

  const itens = await Item.findAll({
    attributes: [
      "item_id",
      "item_etiqueta",
      "item_nome",
      "item_em_uso",
      "item_tipo",
    ],
    where: { item_empresa_id: id, item_ativo: 1 },
    order: [["item_etiqueta", "ASC"]],
    include: [
      {
        model: Setor,
        as: "setor",
        attributes: ["setor_id", "setor_nome"],
      },
      {
        model: Workstation,
        as: "workstation",
        attributes: ["workstation_id", "workstation_nome"],
      },
    ],
  });

  return res.status(200).json(itens);
}

export async function getItensInativos(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID da empresa é obrigatório");
  }

  const itens = await Item.findAll({
    attributes: [
      "item_id",
      "item_etiqueta",
      "item_nome",
      "item_data_inativacao",
      "item_tipo",
    ],
    where: { item_empresa_id: id, item_ativo: 0 },
    order: [["item_etiqueta", "ASC"]],
    include: [
      {
        model: Caracteristica,
        as: "caracteristicas",
        attributes: [
          "caracteristica_id",
          "caracteristica_nome",
          "caracteristica_valor",
        ],
        separate: true,
        order: [["caracteristica_id", "ASC"]],
      },
    ],
  });

  return res.status(200).json(itens);
}

export async function getItemFull(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID do item é obrigatório");
  }

  const item = await Item.findByPk(id, {
    attributes: [
      "item_id",
      "item_nome",
      "item_tipo",
      "item_etiqueta",
      "item_num_serie",
      "item_preco",
      "item_data_aquisicao",
      "item_em_uso",
    ],
    include: [
      {
        model: Setor,
        as: "setor",
        attributes: ["setor_id", "setor_nome"],
      },
      {
        model: Workstation,
        as: "workstation",
        attributes: ["workstation_id", "workstation_nome"],
      },
      {
        model: Caracteristica,
        as: "caracteristicas",
        attributes: [
          "caracteristica_id",
          "caracteristica_nome",
          "caracteristica_valor",
        ],
        separate: true,
        order: [["caracteristica_id", "ASC"]],
      },
      {
        model: Anexo,
        as: "anexos",
        attributes: ["anexo_id", "anexo_caminho", "anexo_nome", "anexo_tipo"],
        separate: true,
        order: [["anexo_id", "ASC"]],
      },
    ],
  });

  return res.status(200).json(item);
}

export async function postItem(req, res) {
  const b = req.body;

  const item_empresa_id = b.item_empresa_id;
  const item_nome = b.item_nome;
  const item_tipo = b.item_tipo;
  const item_etiqueta = b.item_etiqueta;
  const item_num_serie = b.item_num_serie;
  const item_preco = Number(b.item_preco);
  const item_data_aquisicao = b.item_data_aquisicao;
  const item_em_uso = String(b.item_em_uso).toLowerCase() === "true";
  const item_ultima_manutencao = b.item_ultima_manutencao;
  const item_intervalo_manutencao = Number(b.item_intervalo_manutencao);

  let caracteristicas = [];
  if (b.caracteristicas) {
    try {
      caracteristicas = JSON.parse(b.caracteristicas);
    } catch {
      throw new ApiError.badRequest("Características inválidas");
    }
  }

  const faltando =
    !item_empresa_id ||
    !item_nome ||
    !item_tipo ||
    !item_etiqueta ||
    !item_num_serie ||
    Number.isNaN(item_preco) ||
    !item_data_aquisicao ||
    !item_ultima_manutencao ||
    Number.isNaN(item_intervalo_manutencao);

  if (faltando) {
    throw new ApiError.badRequest("Campos obrigatórios faltando");
  }

  const anexosArr = Array.isArray(req.anexos) ? req.anexos : [];

  await sequelize.transaction(async (t) => {
    const item = await Item.create(
      {
        item_empresa_id,
        item_nome,
        item_tipo,
        item_etiqueta,
        item_num_serie,
        item_preco,
        item_data_aquisicao,
        item_em_uso,
        item_ultima_manutencao,
        item_intervalo_manutencao,
      },
      { transaction: t }
    );

    for (const c of caracteristicas) {
      await Caracteristica.create(
        {
          caracteristica_item_id: item.item_id,
          caracteristica_nome: c.nome,
          caracteristica_valor: c.valor,
        },
        { transaction: t }
      );
    }

    for (const a of anexosArr) {
      await Anexo.create(
        {
          anexo_item_id: item.item_id,
          anexo_tipo: a.tipo,
          anexo_nome: a.nome,
          anexo_caminho: a.caminho,
        },
        { transaction: t }
      );
    }

    return res
      .status(201)
      .json({ message: "Item criado com sucesso", item_id: item.item_id });
  });
}

export async function putItem(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID do item é obrigatório");
  }
  const b = req.body;

  const item_nome = b.item_nome;
  const item_setor_id = b.item_setor_id;
  const item_workstation_id = b.item_workstation_id;
  const item_em_uso = b.item_em_uso;

  let caracteristicas = [];
  if (b.caracteristicas) {
    try {
      caracteristicas = JSON.parse(b.caracteristicas);
    } catch {
      throw new ApiError.badRequest("Características inválidas");
    }
  }

  const item = await Item.findByPk(id);
  if (!item) {
    throw ApiError.notFound("Item não encontrado");
  }

  item.item_nome = item_nome;
  if (item_setor_id != "null") {
    item.item_setor_id = item_setor_id;
  } else {
    item.item_setor_id = null;
  }
  if (item_workstation_id != "null") {
    item.item_workstation_id = item_workstation_id;
  } else {
    item.item_workstation_id = null;
  }
  item.item_em_uso = item_em_uso;

  item.save();

  for (const c of caracteristicas) {
    const caracteristica = await Caracteristica.findByPk(c.caracteristica_id);
    if (caracteristica) {
      caracteristica.caracteristica_valor = c.caracteristica_valor;
      await caracteristica.save();
    } else {
      await Caracteristica.create({
        caracteristica_item_id: id,
        caracteristica_nome: c.caracteristica_nome,
        caracteristica_valor: c.caracteristica_valor,
      });
    }
  }
  const anexosBanco = await Anexo.findAll({ where: { anexo_item_id: id } });

  const idsEnviados = (
    Array.isArray(b["id[]"]) ? b["id[]"] : [b["id[]"]]
  ).filter(Boolean);

  for (const a of req.anexos) {
    await Anexo.create({
      anexo_item_id: id,
      anexo_tipo: a.tipo,
      anexo_nome: a.nome,
      anexo_caminho: a.caminho,
    });
  }

  const removidos = anexosBanco.filter(
    (a) => !idsEnviados.includes(String(a.anexo_id))
  );
  for (const r of removidos) {
    try {
      const ROOT = process.cwd();
      const BASE_DIR = path.join(ROOT, "uploads", "anexos");
      const EXCLUIDOS_DIR = path.join(BASE_DIR, "excluidos");
      fs.mkdirSync(EXCLUIDOS_DIR, { recursive: true });

      const origem = path.join(ROOT, r.anexo_caminho);
      const destino = path.join(EXCLUIDOS_DIR, path.basename(r.anexo_caminho));

      if (fs.existsSync(origem)) {
        fs.renameSync(origem, destino);
      }
    } catch (err) {
      console.error("Erro movendo anexo para excluídos:", err);
    }

    await r.destroy();
  }

  return res.status(200).json({ message: "Item atualizado com sucesso" });
}

export async function inativaItem(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID do item é obrigatório");
  }
  const item = await Item.findByPk(id);
  if (!item) {
    throw ApiError.notFound("Item não encontrado");
  }
  item.item_ativo = 0;
  item.item_em_uso = 0;
  item.item_setor_id = null;
  item.item_workstation_id = null;
  item.item_data_inativacao = new Date();
  await item.save();
  return res.status(200).json({ message: "Item inativado com sucesso" });
}
