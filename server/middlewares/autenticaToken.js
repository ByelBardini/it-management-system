import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const CHAVE = process.env.SECRET_KEY_LOGIN || "sua_chave_secreta";

export function autenticar(req, _res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw ApiError.unauthorized("Token não fornecido");
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Formato de token inválido");
  }

  try {
    const payload = jwt.verify(token, CHAVE);

    req.usuario = {
      id: payload.usuario_id,
      tipo: payload.usuario_tipo,
      nome: payload.usuario_nome,
    };

    next();
  } catch {
    throw ApiError.unauthorized("Token inválido ou expirado");
  }
}

export function autorizarRole(role) {
  return (req, _res, next) => {
    if (!req.usuario) {
      throw ApiError.unauthorized("Usuário não autenticado");
    }

    if (req.usuario.tipo !== role && req.usuario.tipo !== "adm") {
      throw ApiError.forbidden("Ação não permitida para o seu tipo de usuário");
    }

    next();
  };
}

export function autorizarUser() {
  return (req, _res, next) => {
    if (!req.usuario) {
      throw ApiError.unauthorized("Usuário não autenticado");
    }
    if (req.usuario.id != req.params.id && req.usuario.tipo !== "adm") {
      throw ApiError.forbidden("Ação não permitida para este usuário");
    }
    next();
  };
}
