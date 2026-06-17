import { Modelo } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getModelos(req, res) {
  const { id } = req.params;

  if (!id) {
    throw ApiError.badRequest("O id da marca é obrigatório");
  }

  const modelos = await Modelo.findAll({
    where: { modelo_marca_id: id },
    order: [["modelo_nome", "ASC"]],
  });

  return res.status(200).json(modelos);
}

export async function postModelo(req, res) {
  const { modelo_marca_id, modelo_nome } = req.body;

  if (!modelo_marca_id || !modelo_nome) {
    throw ApiError.badRequest("Marca e nome do modelo são obrigatórios");
  }

  const modelo = await Modelo.create(
    { modelo_marca_id, modelo_nome },
    { usuarioId: req.usuario.id }
  );

  return res
    .status(201)
    .json({ message: "Modelo criado com sucesso", modelo_id: modelo.modelo_id });
}
