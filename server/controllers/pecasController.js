import { ApiError } from "../middlewares/ApiError.js";
import { Peca } from "../models/index.js";

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
