import { Op } from "sequelize";
import { Item, Setor } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getManutencoes(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }

  const itens = await Item.findAll({
    where: {
      item_empresa_id: id,
      item_em_uso: 1,
      item_intervalo_manutencao: { [Op.ne]: 0 },
    },
    attributes: [
      "item_id",
      "item_etiqueta",
      "item_nome",
      "item_tipo",
      "item_ultima_manutencao",
      "item_intervalo_manutencao",
    ],
    order: [["item_etiqueta", "ASC"]],
    include: [
      {
        model: Setor,
        as: "setor",
        attributes: ["setor_id", "setor_nome"],
      },
    ],
  });

  return res.status(200).json(itens);
}

export async function putManutencao(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID do item é obrigatório");
  }
  const { novo_intervalo } = req.body;
  if (!novo_intervalo) {
    throw ApiError.badRequest("O intervalo de manutenção é obrigatório");
  }

  const item = await Item.findByPk(id);

  item.item_intervalo_manutencao = novo_intervalo;

  await item.save({ usuarioId: req.usuario.id });

  return res
    .status(200)
    .json({ message: "O intervalo de manutenção foi editado com sucesso" });
}

export async function realizarManutencao(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID do item é obrigatório");
  }

  const item = await Item.findByPk(id);

  item.item_ultima_manutencao = new Date();

  await item.save({ usuarioId: req.usuario.id });

  res
    .status(200)
    .json({ message: "Data de manutenção atualizada com sucesso!" });
}
