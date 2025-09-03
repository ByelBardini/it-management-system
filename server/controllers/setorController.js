import { Setor } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getSetores(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Id da empresa é obrigatório");
  }

  const setores = await Setor.findAll({
    where: { setor_empresa_id: id },
  });

  return res.status(200).json(setores);
}

export async function postSetor(req, res) {
  const { setor_empresa_id, setor_nome } = req.body;

  if (!setor_empresa_id || !setor_nome) {
    throw ApiError.badRequest("Todos os dados são obrigatórios");
  }

  await Setor.create({ setor_empresa_id, setor_nome });

  return res.status(201).json({ message: "Setor criado com sucesso" });
}

export async function deleteSetor(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Id do setor é obrigatório");
  }

  await Setor.destroy({ where: { setor_id: id } });

  return res.status(200).json({ message: "Setor excluído com sucesso" });
}
