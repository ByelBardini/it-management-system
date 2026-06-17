import { Marca } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getMarcas(req, res) {
  const { dominio, tipo, subtipo } = req.query;

  if (!dominio || !tipo) {
    throw ApiError.badRequest("Domínio e tipo são obrigatórios");
  }

  const marcas = await Marca.findAll({
    where: {
      marca_dominio: dominio,
      marca_tipo: tipo,
      marca_subtipo: subtipo || "",
    },
    order: [["marca_nome", "ASC"]],
  });

  return res.status(200).json(marcas);
}

export async function postMarca(req, res) {
  const { marca_nome, marca_dominio, marca_tipo, marca_subtipo } = req.body;

  if (!marca_nome || !marca_dominio || !marca_tipo) {
    throw ApiError.badRequest("Nome, domínio e tipo da marca são obrigatórios");
  }

  const marca = await Marca.create(
    {
      marca_nome,
      marca_dominio,
      marca_tipo,
      marca_subtipo: marca_subtipo || "",
    },
    { usuarioId: req.usuario.id }
  );

  return res
    .status(201)
    .json({ message: "Marca criada com sucesso", marca_id: marca.marca_id });
}
