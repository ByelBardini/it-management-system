import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Usuario } from "../models/index.js";
import { ApiError } from "../middlewares/ApiError.js";
import { opcoesCookie } from "../config/seguranca.js";
dotenv.config();

const CHAVE = process.env.SECRET_KEY_LOGIN;

// secure só faz sentido sob HTTPS. COOKIE_SECURE permite forçar; senão segue NODE_ENV.
function cookieSeguro() {
  if (process.env.COOKIE_SECURE != null) {
    return process.env.COOKIE_SECURE === "true";
  }
  return process.env.NODE_ENV === "production";
}

export async function login(req, res) {
  const { usuario_login, usuario_senha } = req.body;

  if (!usuario_login || !usuario_senha) {
    throw ApiError.badRequest("Login e senha são obrigatórios.");
  }

  try {
    const usuario = await Usuario.findOne({
      where: { usuario_login: usuario_login },
    });

    if (!usuario) {
      throw ApiError.unauthorized("Login incorreto");
    }

    if (usuario.usuario_ativo == 0) {
      throw ApiError.unauthorized("Usuário inativo");
    }

    const match = await bcrypt.compare(usuario_senha, usuario.usuario_senha);

    if (!match) {
      throw ApiError.unauthorized("Senha incorreta");
    }

    const payload = {
      usuario_id: usuario.usuario_id,
      usuario_tipo: usuario.usuario_tipo,
      usuario_nome: usuario.usuario_nome,
    };

    const token = jwt.sign(payload, CHAVE, {
      expiresIn: "8h",
    });

    // Sessão por cookie httpOnly: o token não trafega mais no corpo da resposta.
    res.cookie("token", token, opcoesCookie(cookieSeguro()));

    return res.status(200).json({
      resposta: {
        usuario_id: usuario.usuario_id,
        usuario_login: usuario.usuario_login,
        usuario_tipo: usuario.usuario_tipo,
        usuario_nome: usuario.usuario_nome,
        usuario_troca_senha: usuario.usuario_troca_senha,
        usuario_caminho_foto: usuario.usuario_caminho_foto || null,
      },
    });
  } catch (err) {
    console.error("Erro ao logar:", err);
    if (err instanceof ApiError) throw err;
    throw ApiError.internal("Erro ao validar usuário");
  }
}

export async function logout(req, res) {
  // Limpa o cookie com os mesmos atributos com que foi criado (path/sameSite/secure).
  res.clearCookie("token", opcoesCookie(cookieSeguro()));
  return res.status(200).json({ mensagem: "Logout realizado" });
}
