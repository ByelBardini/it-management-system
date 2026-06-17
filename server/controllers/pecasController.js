import sequelize from "../config/database.js";
import { ApiError } from "../middlewares/ApiError.js";
import { Peca, Item, Marca, Modelo } from "../models/index.js";
import {
  errosLotePecas,
  resolverMarcaModelo,
  novoCacheResolucao,
} from "./helpers/importacao.js";

export async function postPeca(req, res) {
  const { id_empresa, tipo, preco, data_aquisicao, numSerie, marca_id, modelo_id } =
    req.body;
  if (!id_empresa || !tipo || !preco || !data_aquisicao || !numSerie) {
    throw ApiError.badRequest("Todos os dados são necessários");
  }
  await Peca.create(
    {
      peca_empresa_id: id_empresa,
      peca_ativa: 1,
      peca_tipo: tipo,
      peca_marca_id: marca_id || null,
      peca_modelo_id: modelo_id || null,
      peca_num_serie: numSerie,
      peca_preco: preco,
      peca_em_uso: 0,
      peca_data_aquisicao: data_aquisicao,
    },
    { usuarioId: req.usuario.id }
  );

  return res.status(201).json({ message: "Peça cadastrada com sucesso" });
}

export async function importarPecas(req, res) {
  const id_empresa = req.body.id_empresa;
  const pecas = req.body.pecas;

  if (!id_empresa) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }
  if (!Array.isArray(pecas) || pecas.length === 0) {
    throw ApiError.badRequest("Nenhuma peça para importar");
  }

  const erros = errosLotePecas(pecas);
  if (erros.length) {
    throw ApiError.badRequest(
      `${erros.length} linha(s) com erro na importação`,
      erros
    );
  }

  const cache = novoCacheResolucao();
  let criados = 0;
  await sequelize.transaction(async (t) => {
    for (const linha of pecas) {
      const tipo = String(linha.tipo).trim();

      const { marca_id, modelo_id } = await resolverMarcaModelo(
        {
          dominio: "peca",
          tipo,
          subtipo: "",
          marcaNome: linha.marca,
          modeloNome: linha.modelo,
        },
        t,
        req.usuario.id,
        cache
      );

      await Peca.create(
        {
          peca_empresa_id: id_empresa,
          peca_item_id: null,
          peca_ativa: 1,
          peca_tipo: tipo,
          peca_marca_id: marca_id,
          peca_modelo_id: modelo_id,
          peca_num_serie: String(linha.num_serie).trim(),
          peca_preco: Number(linha.preco),
          peca_em_uso: 0,
          peca_data_aquisicao: linha.data_aquisicao,
        },
        { transaction: t, usuarioId: req.usuario.id }
      );

      criados++;
    }
  });

  return res
    .status(201)
    .json({ message: "Peças importadas com sucesso", criados });
}

export async function getPecasAtivas(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }
  const pecas = await Peca.findAll({
    where: { peca_empresa_id: id, peca_ativa: 1 },
    order: [["peca_id", "ASC"]],
    include: [
      {
        model: Item,
        as: "item",
        attributes: ["item_id", "item_etiqueta"],
      },
      {
        model: Marca,
        as: "marca",
        attributes: ["marca_id", "marca_nome"],
      },
      {
        model: Modelo,
        as: "modelo",
        attributes: ["modelo_id", "modelo_nome"],
      },
    ],
  });
  return res.status(200).json(pecas);
}

export async function getPecasInativas(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }
  const pecas = await Peca.findAll({
    where: { peca_empresa_id: id, peca_ativa: 0 },
    order: [["peca_id", "ASC"]],
    include: [
      {
        model: Marca,
        as: "marca",
        attributes: ["marca_id", "marca_nome"],
      },
      {
        model: Modelo,
        as: "modelo",
        attributes: ["modelo_id", "modelo_nome"],
      },
    ],
  });
  return res.status(200).json(pecas);
}

export async function inativarPeca(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Id da peça é obrigatório");
  }
  const peca = await Peca.findByPk(id);
  if (!peca) {
    throw ApiError.notFound("Peça não encontrada");
  }
  if (peca.peca_em_uso) {
    throw ApiError.badRequest("Peça está em uso e não pode ser inativada");
  }
  peca.peca_ativa = 0;
  peca.peca_data_inativacao = new Date();
  await peca.save({ usuarioId: req.usuario.id });
  return res.status(200).json({ message: "Peça inativada com sucesso" });
}
