import { Plataforma } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getPlataformas(req, res) {
  const plataformas = await Plataforma.findAll();

  return res.status(200).json(plataformas);
}

export async function postPlataforma(req, res) {
  const { plataforma_nome } = req.body;

  if (!plataforma_nome) {
    throw ApiError.badRequest("O nome é obrigatório");
  }

  await Plataforma.create({ plataforma_nome });

  return res.status(201).json({ message: "Plataforma criada com sucesso" });
}

export async function deletePlataforma(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("Necessário ID da plataforma a ser excluída");
  }

  const plataforma = await Plataforma.findByPk(id);

  plataforma.destroy();

  return res.status(200).json({ message: "Plataforma excluída com sucesso" });
}
