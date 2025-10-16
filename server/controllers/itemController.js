import path from "path";
import fs from "fs";
import sequelize from "../config/database.js";
import { Op } from "sequelize";
import {
  Anexo,
  Caracteristica,
  Item,
  Setor,
  Workstation,
  Peca,
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
        model: Peca,
        as: "pecas",
        attributes: [
          "peca_id",
          "peca_tipo",
          "peca_nome",
          "peca_preco",
          "peca_em_uso",
        ],
        separate: true,
        order: [["peca_id", "ASC"]],
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

export async function getItensWorkstation(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID do workstation é obrigatório");
  }

  const itens = await Item.findAll({
    attributes: ["item_id", "item_etiqueta", "item_tipo", "item_nome"],
    where: { item_workstation_id: id },
    order: [["item_etiqueta", "ASC"]],
  });

  return res.status(200).json(itens);
}

export async function removerWorkstation(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID do item é obrigatório");
  }

  const item = await Item.findByPk(id);
  item.item_workstation_id = null;
  item.save({ usuarioId: req.usuario.id });

  return res
    .status(200)
    .json({ message: "Item removido do workstation com sucesso!" });
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
  let pecasIds = [];
  if (b.pecas) {
    try {
      const parsed = JSON.parse(b.pecas);
      if (Array.isArray(parsed))
        pecasIds = parsed.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
    } catch {
      throw new ApiError.badRequest("Peças inválidas");
    }
  }

  const faltando =
    !item_empresa_id ||
    !item_nome ||
    !item_tipo ||
    !item_etiqueta ||
    !item_num_serie ||
    (item_tipo !== "desktop" && Number.isNaN(item_preco)) ||
    !item_data_aquisicao ||
    !item_ultima_manutencao ||
    Number.isNaN(item_intervalo_manutencao);

  if (faltando) {
    throw new ApiError.badRequest("Campos obrigatórios faltando");
  }

  const anexosArr = Array.isArray(req.anexos) ? req.anexos : [];

  await sequelize.transaction(async (t) => {
    let precoFinal = item_preco;
    if (item_tipo === "desktop") {
      if (!Array.isArray(pecasIds) || pecasIds.length === 0) {
        throw new ApiError.badRequest("Selecione as peças do desktop");
      }
      const pecasPreco = await Peca.findAll({
        attributes: ["peca_id", "peca_preco"],
        where: { peca_id: pecasIds, peca_ativa: 1, peca_item_id: null },
        transaction: t,
      });
      const soma = pecasPreco.reduce(
        (acc, p) => acc + Number(p.peca_preco || 0),
        0
      );
      precoFinal = soma;
    }

    const item = await Item.create(
      {
        item_empresa_id,
        item_nome,
        item_tipo,
        item_etiqueta,
        item_num_serie,
        item_preco: precoFinal,
        item_data_aquisicao,
        item_em_uso,
        item_ultima_manutencao,
        item_intervalo_manutencao,
      },
      { transaction: t, usuarioId: req.usuario.id }
    );

    if (item_tipo !== "desktop") {
      for (const c of caracteristicas) {
        await Caracteristica.create(
          {
            caracteristica_item_id: item.item_id,
            caracteristica_nome: c.nome,
            caracteristica_valor: c.valor,
          },
          { transaction: t, usuarioId: req.usuario.id }
        );
      }
    } else {
      if (!Array.isArray(pecasIds) || pecasIds.length === 0) {
        throw new ApiError.badRequest("Selecione as peças do desktop");
      }
      const pecas = await Peca.findAll({
        where: { peca_id: pecasIds, peca_ativa: 1, peca_item_id: null },
        transaction: t,
      });
      const encontrados = pecas.map((p) => p.peca_id);
      const faltantes = pecasIds.filter((id) => !encontrados.includes(id));
      if (faltantes.length) {
        throw new ApiError.badRequest(
          "Algumas peças são inválidas ou já estão em uso"
        );
      }
      for (const p of pecas) {
        p.peca_item_id = item.item_id;
        p.peca_em_uso = 1;
        await p.save({ transaction: t, usuarioId: req.usuario.id });
      }
    }

    for (const a of anexosArr) {
      await Anexo.create(
        {
          anexo_item_id: item.item_id,
          anexo_tipo: a.tipo,
          anexo_nome: a.nome,
          anexo_caminho: a.caminho,
        },
        { transaction: t, usuarioId: req.usuario.id }
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

  let pecasIds = [];
  if (b.pecas) {
    try {
      const parsed = JSON.parse(b.pecas);
      if (Array.isArray(parsed))
        pecasIds = parsed.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
    } catch {
      throw new ApiError.badRequest("Peças inválidas");
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

  item.save({ usuarioId: req.usuario.id });
  if (item.item_tipo !== "desktop") {
    for (const c of caracteristicas) {
      const caracteristica = await Caracteristica.findByPk(c.caracteristica_id);
      if (caracteristica) {
        caracteristica.caracteristica_valor = c.caracteristica_valor;
        await caracteristica.save({ usuarioId: req.usuario.id });
      } else {
        await Caracteristica.create(
          {
            caracteristica_item_id: id,
            caracteristica_nome: c.caracteristica_nome,
            caracteristica_valor: c.caracteristica_valor,
          },
          { usuarioId: req.usuario.id }
        );
      }
    }
  } else {
    await sequelize.transaction(async (t) => {
      const atuais = await Peca.findAll({
        where: { peca_item_id: id, peca_ativa: 1 },
        transaction: t,
      });
      const atuaisIds = atuais.map((p) => p.peca_id);
      const novos = pecasIds;

      const paraDesvincular = atuais.filter((p) => !novos.includes(p.peca_id));
      for (const p of paraDesvincular) {
        p.peca_item_id = null;
        p.peca_em_uso = 0;
        await p.save({ transaction: t, usuarioId: req.usuario.id });
      }

      const paraVincularIds = novos.filter((idp) => !atuaisIds.includes(idp));
      if (paraVincularIds.length) {
        const paraVincular = await Peca.findAll({
          where: {
            peca_id: paraVincularIds,
            peca_ativa: 1,
            [Op.or]: [{ peca_item_id: null }, { peca_item_id: id }],
          },
          transaction: t,
        });
        const encontrados = paraVincular.map((p) => p.peca_id);
        const faltantes = paraVincularIds.filter(
          (pid) => !encontrados.includes(pid)
        );
        if (faltantes.length) {
          throw new ApiError.badRequest(
            "Algumas peças são inválidas ou já estão em uso"
          );
        }
        for (const p of paraVincular) {
          p.peca_item_id = id;
          p.peca_em_uso = 1;
          await p.save({ transaction: t, usuarioId: req.usuario.id });
        }
      }

      const finais = await Peca.findAll({
        where: { peca_item_id: id, peca_ativa: 1 },
        transaction: t,
      });
      const soma = finais.reduce(
        (acc, p) => acc + Number(p.peca_preco || 0),
        0
      );
      item.item_preco = soma;
      await item.save({ transaction: t, usuarioId: req.usuario.id });
    });
  }
  const anexosBanco = await Anexo.findAll({ where: { anexo_item_id: id } });

  const idsEnviados = (
    Array.isArray(b["id[]"]) ? b["id[]"] : [b["id[]"]]
  ).filter(Boolean);

  for (const a of req.anexos) {
    await Anexo.create(
      {
        anexo_item_id: id,
        anexo_tipo: a.tipo,
        anexo_nome: a.nome,
        anexo_caminho: a.caminho,
      },
      { usuarioId: req.usuario.id }
    );
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

    await r.destroy({ usuarioId: req.usuario.id });
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
  await item.save({ usuarioId: req.usuario.id });
  return res.status(200).json({ message: "Item inativado com sucesso" });
}
