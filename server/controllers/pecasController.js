import { ApiError } from "../middlewares/ApiError.js";
import { Peca, Item } from "../models/index.js";

export async function postPeca(req, res) {
  const { id_empresa, tipo, nome, preco, data_aquisicao } = req.body;
  if (!id_empresa || !tipo || !nome || !preco || !data_aquisicao) {
    throw ApiError.badRequest("Todos os dados são necessários");
  }
  await Peca.create(
    {
      peca_empresa_id: id_empresa,
      peca_ativa: 1,
      peca_tipo: tipo,
      peca_nome: nome,
      peca_preco: preco,
      peca_em_uso: 0,
      peca_data_aquisicao: data_aquisicao,
    },
    { usuarioId: req.usuario.id }
  );

  return res.status(201).json({ message: "Peça cadastrada com sucesso" });
}

export async function getPecasAtivas(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }
  const pecas = await Peca.findAll({
    where: { peca_empresa_id: id, peca_ativa: 1 },
    order: [["peca_nome", "ASC"]],
    include: [
      {
        model: Item,
        as: "item",
        attributes: ["item_id", "item_nome"],
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
    order: [["peca_nome", "ASC"]],
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
