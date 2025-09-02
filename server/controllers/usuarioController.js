import { Usuario } from "../models";
import { ApiError } from "../middlewares/ApiError";
import bcrypt from "bcrypt";

export async function cadastrarUsuario(req, res) {
  const { usuario_nome, usuario_tipo, usuario_login } = req.body;

  if (!usuario_login || !usuario_nome || !usuario_tipo) {
    throw ApiError.badRequest("Todos os dados são obrigatórios");
  }

  const senhaHash = bcrypt.hashSync("12345", 10);

  try {
    await Usuario.create({
      usuario_nome: usuario_nome,
      usuario_login: usuario_login,
      usuario_tipo: usuario_tipo,
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
