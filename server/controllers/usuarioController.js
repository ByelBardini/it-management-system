import { Usuario, Empresa } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";
import bcrypt from "bcrypt";

export async function getFuncionarios(req, res) {
  const usuarios = await Usuario.findAll({
    attributes: [
      "usuario_id",
      "usuario_login",
      "usuario_nome",
      "usuario_tipo",
      "usuario_empresa_id",
      "usuario_ativo",
      "usuario_caminho_foto",
    ],
    include: [
      {
        model: Empresa,
        as: "empresaColeta",
        attributes: ["empresa_id", "empresa_nome"],
      },
    ],
  });

  res.status(200).json(usuarios);
}

export async function cadastrarUsuario(req, res) {
  const { usuario_nome, usuario_tipo, usuario_login, usuario_empresa_id } =
    req.body;

  if (!usuario_login || !usuario_nome || !usuario_tipo) {
    throw ApiError.badRequest("Todos os dados são obrigatórios");
  }

  // A conta de coleta é amarrada a uma empresa (o token de coleta herda essa empresa).
  if (usuario_tipo === "coletor" && !usuario_empresa_id) {
    throw ApiError.badRequest("A conta de coleta precisa de uma empresa vinculada");
  }

  const senhaHash = bcrypt.hashSync("12345", 10);

  try {
    await Usuario.create({
      usuario_nome: usuario_nome,
      usuario_login: usuario_login,
      usuario_tipo: usuario_tipo,
      usuario_empresa_id: usuario_empresa_id || null,
      usuario_ativo: 1,
      usuario_troca_senha: 1,
      usuario_senha: senhaHash,
    });

    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);
    if (err instanceof ApiError) throw err;
    throw ApiError.internal("Erro ao cadastrar usuário");
  }
}

export async function inativaUsuario(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID do usuário é obrigatório");
  }

  const usuario = await Usuario.findByPk(id);

  usuario.usuario_ativo = !usuario.usuario_ativo;

  await usuario.save({ usuarioId: req.usuario.id });

  return res
    .status(200)
    .json({ message: "Usuário inativado/ativado com sucesso" });
}

export async function resetarSenha(req, res) {
  const { id } = req.params;
  if (!id) {
    throw ApiError.badRequest("O ID do usuário é obrigatório");
  }

  const usuario = await Usuario.findByPk(id);

  const senhaHash = bcrypt.hashSync("12345", 10);

  usuario.usuario_senha = senhaHash;
  usuario.usuario_troca_senha = 1;

  await usuario.save({ usuarioId: req.usuario.id });

  return res.status(200).json({ message: "Senha resetada com sucesso" });
}
