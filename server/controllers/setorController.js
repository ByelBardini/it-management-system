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
