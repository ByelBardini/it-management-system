import { Subtipo } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getSubtipos(req, res) {
  const { tipo } = req.query;

  if (!tipo) {
    throw ApiError.badRequest("O tipo é obrigatório");
  }

  const subtipos = await Subtipo.findAll({
    where: { subtipo_tipo: tipo },
    order: [["subtipo_nome", "ASC"]],
  });

  return res.status(200).json(subtipos);
}

export async function postSubtipo(req, res) {
  const { subtipo_tipo, subtipo_nome } = req.body;

  if (!subtipo_tipo || !subtipo_nome) {
    throw ApiError.badRequest("Tipo e nome do subtipo são obrigatórios");
  }

  const subtipo = await Subtipo.create(
    { subtipo_tipo, subtipo_nome },
    { usuarioId: req.usuario.id }
  );

  return res.status(201).json({
    message: "Subtipo criado com sucesso",
    subtipo_id: subtipo.subtipo_id,
  });
}
