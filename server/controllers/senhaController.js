import { Senha, Plataforma } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";

export async function getSenhas(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("ID da empresa é obrigatório");
  }

  const senhas = await Senha.findAll({
    where: { senha_empresa_id: id },
    attributes: [
      "senha_id",
      "senha_nome",
      "senha_usuario",
      "senha_ultima_troca",
      "senha_tempo_troca",
    ],
    include: [
      {
        model: Plataforma,
        as: "plataforma",
        attributes: ["plataforma_id", "plataforma_nome"],
      },
    ],
  });

  return res.status(200).json(senhas);
}
