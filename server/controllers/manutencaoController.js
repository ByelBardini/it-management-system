import { Item, Setor } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getManutencoes(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }

  const itens = await Item.findAll({
    where: { item_empresa_id: id, item_em_uso: 1 },
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
